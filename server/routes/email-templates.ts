import { Router } from 'express';
import { db } from '../db';
import { emailTemplates, emailSegments, waitlist, insertEmailTemplateSchema } from '../../db/schema';
import { eq, inArray, not, or } from 'drizzle-orm';
import { requireAuth } from '../auth';
import { fromZodError } from 'zod-validation-error';
import { log } from '../vite';

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

// Update email template
router.patch('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const validatedData = insertEmailTemplateSchema.parse(req.body);

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

// Delete email template
router.delete('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    // Check if it's a system template
    const template = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.id, id)
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (SYSTEM_TEMPLATE_NAMES.includes(template.name)) {
      return res.status(403).json({ error: 'Cannot delete system templates' });
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

export default router;