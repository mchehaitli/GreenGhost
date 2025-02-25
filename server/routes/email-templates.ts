import { Router } from 'express';
import { db } from '../db';
import { emailTemplates, emailSegments, waitlist, insertEmailTemplateSchema } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAuth } from '../auth';
import { fromZodError } from 'zod-validation-error';
import { log } from '../vite';
import emailService from '../services/email';

const router = Router();

// Get all email templates
router.get('/api/email-templates', requireAuth, async (_req, res) => {
  try {
    const templates = await db.query.emailTemplates.findMany({
      orderBy: (emailTemplates, { desc }) => [desc(emailTemplates.created_at)]
    });
    return res.json(templates);
  } catch (error) {
    log('Error fetching email templates:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create new email template
router.post('/api/email-templates', requireAuth, async (req, res) => {
  try {
    const validatedData = insertEmailTemplateSchema.parse(req.body);
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

// Update email template
router.patch('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const validatedData = insertEmailTemplateSchema.parse(req.body);
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

// Delete email template
router.delete('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Send email to segment
router.post('/api/email-templates/:id/send', requireAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const { emails } = req.body;
    if (!Array.isArray(emails)) {
      return res.status(400).json({ error: 'emails must be an array' });
    }

    // Get template
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, templateId));
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Send emails
    let successCount = 0;
    for (const email of emails) {
      try {
        await emailService.sendCustomEmail(email, template.subject, template.html_content);
        successCount++;
      } catch (error) {
        log(`Failed to send email to ${email}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Record segment
    const [segment] = await db.insert(emailSegments).values({
      template_id: templateId,
      total_recipients: successCount,
    }).returning();

    return res.json({
      success: true,
      total_sent: successCount,
      segment_id: segment.id,
    });
  } catch (error) {
    log('Error sending emails:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to send emails' });
  }
});

// Send test email
router.post('/api/email-templates/:id/test', requireAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Get template
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, templateId));
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Send test email
    const success = await emailService.sendCustomEmail(email, template.subject, template.html_content);
    if (!success) {
      throw new Error('Failed to send test email');
    }

    return res.json({ success: true });
  } catch (error) {
    log('Error sending test email:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;