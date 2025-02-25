import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Base tables
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  zip_code: text("zip_code").default("").notNull(),
  verified: boolean("verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"), // New column for verification expiration
});

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  used: boolean("used").default(false).notNull(),
});

// Relations
export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  waitlist: one(waitlist, {
    fields: [verificationTokens.email],
    references: [waitlist.email],
  }),
}));

// Zod schemas for validation
export const insertWaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  zip_code: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

export const verificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string(),
});

// Export types
export const selectWaitlistSchema = createSelectSchema(waitlist);
export type InsertWaitlist = typeof waitlist.$inferInsert;
export type SelectWaitlist = typeof waitlist.$inferSelect;

export const insertVerificationTokenSchema = createInsertSchema(verificationTokens);
export const selectVerificationTokenSchema = createSelectSchema(verificationTokens);
export type InsertVerificationToken = typeof verificationTokens.$inferInsert;
export type SelectVerificationToken = typeof verificationTokens.$inferSelect;