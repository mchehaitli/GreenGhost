import { Router } from 'express';
import { db } from '../db';
import { emailTemplates, emailSegments, waitlist, insertEmailTemplateSchema } from '../../db/schema';
import { eq, inArray, not, or } from 'drizzle-orm';
import { requireAuth } from '../auth';
import { fromZodError } from 'zod-validation-error';
import { log } from '../vite';
import { sendMarketingEmail } from '../services/email';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// System template names that should be filtered out from custom templates
const SYSTEM_TEMPLATE_NAMES = ['Welcome Email', 'Verification Email'];

// Get custom email templates
router.get('/api/email-templates/custom', requireAuth, async (_req, res) => {
  try {
    const templates = await db.query.emailTemplates.findMany({
      where: not(inArray(emailTemplates.name, SYSTEM_TEMPLATE_NAMES)),
      orderBy: (emailTemplates, { desc }) => [desc(emailTemplates.created_at)]
    });
    return res.json(templates);
  } catch (error) {
    log('Error fetching custom email templates:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch custom templates' });
  }
});

// Load system template from file
async function loadSystemTemplate(templateName: string) {
  try {
    const fileName = templateName === 'Welcome Email' ? 'welcome-email.html' : 'verification-email.html';
    const filePath = path.join(__dirname, '../templates', fileName);
    const html_content = await fs.readFile(filePath, 'utf-8');
    
    const subject = templateName === 'Welcome Email' 
      ? 'Welcome to Green Ghost\'s Waitlist!' 
      : 'Verify Your Email for Green Ghost';
    
    return {
      id: templateName === 'Welcome Email' ? -1 : -2, // Use negative IDs for system templates
      name: templateName,
      subject,
      html_content,
      created_at: new Date('2025-01-01'), // Fixed date for system templates
      updated_at: new Date('2025-01-01'),
      is_system: true
    };
  } catch (error) {
    log(`Error loading system template ${templateName}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Get all email templates including system templates
router.get('/api/email-templates', requireAuth, async (_req, res) => {
  try {
    const dbTemplates = await db.query.emailTemplates.findMany({
      orderBy: (emailTemplates, { desc }) => [desc(emailTemplates.created_at)]
    });
    
    // Load system templates from files
    const welcomeTemplate = await loadSystemTemplate('Welcome Email');
    const verificationTemplate = await loadSystemTemplate('Verification Email');
    
    const systemTemplates = [welcomeTemplate, verificationTemplate].filter(Boolean);
    
    // Combine system templates with database templates
    const allTemplates = [...systemTemplates, ...dbTemplates];
    
    return res.json(allTemplates);
  } catch (error) {
    log('Error fetching email templates:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create new email template
router.post('/api/email-templates', requireAuth, async (req, res) => {
  try {
    const validatedData = insertEmailTemplateSchema.parse(req.body);

    // Check if template name already exists
    const existingTemplate = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.name, validatedData.name)
    });

    if (existingTemplate) {
      return res.status(400).json({ error: 'Template name already exists' });
    }

    const [template] = await db.insert(emailTemplates).values(validatedData).returning();
    return res.status(201).json(template);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update system template file
async function updateSystemTemplate(templateName: string, subject: string, html_content: string) {
  try {
    const fileName = templateName === 'Welcome Email' ? 'welcome-email.html' : 'verification-email.html';
    const filePath = path.join(__dirname, '../templates', fileName);
    await fs.writeFile(filePath, html_content, 'utf-8');
    
    return {
      id: templateName === 'Welcome Email' ? -1 : -2,
      name: templateName,
      subject,
      html_content,
      created_at: new Date('2025-01-01'),
      updated_at: new Date(),
      is_system: true
    };
  } catch (error) {
    log(`Error updating system template ${templateName}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Update email template
router.patch('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const validatedData = insertEmailTemplateSchema.parse(req.body);
    
    // Handle system templates (negative IDs)
    if (id < 0) {
      const templateName = id === -1 ? 'Welcome Email' : 'Verification Email';
      const updatedTemplate = await updateSystemTemplate(templateName, validatedData.subject, validatedData.html_content);
      return res.json(updatedTemplate);
    }

    // Handle regular database templates
    validatedData.updated_at = new Date();

    // Check if template exists
    const existingTemplate = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if new name conflicts with another template
    if (validatedData.name !== existingTemplate.name) {
      const nameExists = await db.query.emailTemplates.findFirst({
        where: eq(emailTemplates.name, validatedData.name)
      });
      if (nameExists) {
        return res.status(400).json({ error: 'Template name already exists' });
      }
    }

    const [template] = await db.update(emailTemplates)
      .set({
        ...validatedData,
        updated_at: new Date(),
      })
      .where(eq(emailTemplates.id, id))
      .returning();

    return res.json(template);
  } catch (error) {
    if (error instanceof Error) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

// Get individual email template
router.get('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    // Handle system templates
    if (id < 0) {
      const templateName = id === -1 ? 'Welcome Email' : 'Verification Email';
      const systemTemplate = await loadSystemTemplate(templateName);
      if (!systemTemplate) {
        return res.status(404).json({ error: 'System template not found' });
      }
      return res.json(systemTemplate);
    }

    // Handle regular database templates
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.json(template);
  } catch (error) {
    log('Error fetching email template:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Delete email template
router.delete('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    // Prevent deletion of system templates
    if (id < 0) {
      return res.status(400).json({ error: 'System templates cannot be deleted' });
    }

    // Check if template exists
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Delete the template
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));

    return res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Send test email
router.post('/api/email-templates/test', requireAuth, async (req, res) => {
  try {
    const { templateId, testEmail } = req.body;
    
    if (!templateId || !testEmail) {
      return res.status(400).json({ error: 'Template ID and test email are required' });
    }

    // Get the template
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Send test email
    const result = await sendMarketingEmail(
      testEmail,
      template.subject,
      template.html_content,
      template.from_email,
      'Test User'
    );

    if (result.success) {
      return res.json({ message: 'Test email sent successfully' });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Get recipients for a template
router.get('/api/email-templates/:id/recipients', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let recipients: { email: string; name?: string }[] = [];

    switch (template.recipient_type) {
      case 'all':
        // Get all waitlist members
        const allMembers = await db.query.waitlist.findMany({
          where: eq(waitlist.verified, true)
        });
        recipients = allMembers.map(member => ({
          email: member.email,
          name: member.first_name && member.last_name ? 
            `${member.first_name} ${member.last_name}` : undefined
        }));
        break;
        
      case 'waitlist':
        // Get only waitlist members
        const waitlistMembers = await db.query.waitlist.findMany({
          where: eq(waitlist.verified, true)
        });
        recipients = waitlistMembers.map(member => ({
          email: member.email,
          name: member.first_name && member.last_name ? 
            `${member.first_name} ${member.last_name}` : undefined
        }));
        break;
        
      case 'custom':
        // Parse custom filter
        if (template.recipient_filter) {
          try {
            const filter = JSON.parse(template.recipient_filter);
            recipients = filter.emails || [];
          } catch (error) {
            console.error('Error parsing recipient filter:', error);
            recipients = [];
          }
        }
        break;
    }

    return res.json({ recipients, count: recipients.length });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

// Send email campaign
router.post('/api/email-templates/:id/send', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const { customRecipients, zipCodes, recipientType, fromEmail } = req.body;
    let recipients: Array<{email: string, name?: string}> = [];

    // Handle different recipient types
    if (customRecipients && Array.isArray(customRecipients)) {
      // Custom recipients (either from waitlist or prospect emails)
      recipients = customRecipients.map(email => ({ email, name: email.split('@')[0] }));
    } else {
      // Fetch recipients based on type and ZIP codes
      let waitlistMembers = await db.query.waitlist.findMany({
        where: zipCodes && zipCodes.length > 0 
          ? inArray(waitlist.zip_code, zipCodes)
          : undefined
      });

      // Filter based on recipient type
      if (recipientType === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        waitlistMembers = waitlistMembers.filter(member => 
          new Date(member.created_at) >= thirtyDaysAgo
        );
      }

      recipients = waitlistMembers.map(member => ({ 
        email: member.email, 
        name: member.email.split('@')[0] 
      }));
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found for this campaign' });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Send emails to all recipients
    for (const recipient of recipients) {
      try {
        const result = await sendMarketingEmail(
          recipient.email,
          template.subject,
          template.html_content,
          fromEmail || template.from_email,
          recipient.name
        );

        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`${recipient.email}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Record the campaign in email history
    try {
      await db.insert(emailSegments).values({
        template_id: id,
        zip_codes: zipCodes || [],
        sent_at: new Date(),
        total_recipients: recipients.length,
      });
      log(`Email campaign history recorded for template ${id}`);
    } catch (historyError) {
      log('Failed to record email history:', historyError instanceof Error ? historyError.message : 'Unknown error');
    }

    return res.json({
      message: 'Email campaign completed',
      successCount,
      errorCount,
      totalRecipients: recipients.length,
      errors: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    console.error('Error sending email campaign:', error);
    return res.status(500).json({ error: 'Failed to send email campaign' });
  }
});

// Duplicate template
router.post('/api/email-templates/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create duplicate with modified name
    const duplicateData = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };

    const [duplicatedTemplate] = await db.insert(emailTemplates).values(duplicateData).returning();
    
    return res.status(201).json(duplicatedTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    return res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// Send email to segment
router.post('/api/email-templates/:id/send', requireAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const { zip_codes } = req.body;
    if (!Array.isArray(zip_codes)) {
      return res.status(400).json({ error: 'zip_codes must be an array' });
    }

    // Get template
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, templateId)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get recipients
    const recipients = await db.query.waitlist.findMany({
      where: zip_codes.length > 0 ? inArray(waitlist.zip_code, zip_codes) : undefined
    });

    // Record segment
    const [segment] = await db.insert(emailSegments).values({
      template_id: templateId,
      zip_codes: zip_codes,
      total_recipients: recipients.length,
    }).returning();

    return res.json({
      success: true,
      total_recipients: recipients.length,
      segment_id: segment.id,
    });
  } catch (error) {
    log('Error sending emails:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to send emails' });
  }
});

// Add this route for email history
router.get('/api/email-history', requireAuth, async (_req, res) => {
  try {
    const history = await db.query.emailSegments.findMany({
      with: {
        template: true,
      },
      orderBy: (emailSegments, { desc }) => [desc(emailSegments.sent_at)],
    });

    const formattedHistory = history.map(entry => ({
      id: entry.id,
      template_name: entry.template?.name || 'Email Campaign',
      sent_at: entry.sent_at,
      total_recipients: entry.total_recipients,
      status: 'completed',
    }));

    return res.json(formattedHistory);
  } catch (error) {
    log('Error fetching email history:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch email history' });
  }
});

// Get detailed information about a specific email campaign
router.get('/api/email-history/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }

    const historyEntry = await db.query.emailSegments.findFirst({
      where: eq(emailSegments.id, id),
      with: {
        template: true,
      },
    });

    if (!historyEntry) {
      return res.status(404).json({ error: 'Email history entry not found' });
    }

    // Get recipient emails based on the campaign criteria
    let recipientEmails: string[] = [];
    try {
      if (historyEntry.zip_codes && historyEntry.zip_codes.length > 0) {
        // Get recipients by ZIP codes
        const waitlistEntries = await db.query.waitlist.findMany({
          where: (waitlist, { inArray }) => inArray(waitlist.zip_code, historyEntry.zip_codes),
          columns: { email: true }
        });
        recipientEmails = waitlistEntries.map(entry => entry.email);
      } else {
        // Get all waitlist recipients
        const waitlistEntries = await db.query.waitlist.findMany({
          columns: { email: true }
        });
        recipientEmails = waitlistEntries.map(entry => entry.email);
      }
    } catch (error) {
      log('Error fetching recipient emails:', error instanceof Error ? error.message : 'Unknown error');
    }

    const recipientInfo = {
      total_count: historyEntry.total_recipients,
      zip_codes: historyEntry.zip_codes || [],
      targeting_type: historyEntry.zip_codes && historyEntry.zip_codes.length > 0 ? 'zip_code' : 'all_waitlist',
      recipient_emails: recipientEmails
    };

    return res.json({
      id: historyEntry.id,
      template: historyEntry.template,
      sent_at: historyEntry.sent_at,
      recipient_info: recipientInfo,
      status: 'completed'
    });
  } catch (error) {
    log('Error fetching email history details:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch email history details' });
  }
});

// Delete email history entry
router.delete('/api/email-history/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }

    const result = await db.delete(emailSegments).where(eq(emailSegments.id, id));
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Email history entry not found' });
    }

    log(`Email history entry ${id} deleted successfully`);
    return res.json({ message: 'Email history entry deleted successfully' });
  } catch (error) {
    log('Error deleting email history entry:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to delete email history entry' });
  }
});

export default router;