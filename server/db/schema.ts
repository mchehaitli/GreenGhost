import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Waitlist table definition (keeping only what's needed for the public site)
export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  zip_code: text('zip_code').notNull(),
  verified: boolean('verified').notNull().default(false),
  created_at: timestamp('created_at').defaultNow(),
  expires_at: timestamp('expires_at'),
});

// Zod schema for waitlist validation
export const insertWaitlistSchema = z.object({
  email: z.string().email("Invalid email format"),
  zip_code: z.string().min(5, "Invalid ZIP code"),
});

export const verificationSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().min(6, "Invalid verification code"),
});

// Types for waitlist selections from database
export type SelectWaitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;