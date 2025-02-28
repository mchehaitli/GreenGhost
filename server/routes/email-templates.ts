import { Router } from 'express';
import { db } from '../db';
import { emailTemplates, emailSegments, waitlist, insertEmailTemplateSchema } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAuth } from '../auth';
import { fromZodError } from 'zod-validation-error';
import { log } from '../vite';

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