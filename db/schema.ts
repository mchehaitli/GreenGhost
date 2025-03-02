import { pgTable, text, serial, boolean, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Base tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  phone_number: text("phone_number"),
  street_address: text("street_address"),
  city: text("city"),
  state: text("state"),
  zip_code: text("zip_code"),
  notes: text("notes"),
  verified: boolean("verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
});

// New table for page content
export const pageContent = pgTable("page_content", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(), // e.g., 'pricing'
  section: text("section").notNull(), // e.g., 'hero', 'plans', 'services'
  key: text("key").notNull(), // e.g., 'title', 'description'
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// New tables for pricing management
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  billing_period: text("billing_period").default("monthly").notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const planFeatures = pgTable("plan_features", {
  id: serial("id").primaryKey(),
  plan_id: integer("plan_id").notNull().references(() => plans.id, { onDelete: 'cascade' }),
  feature: text("feature").notNull(),
  included: boolean("included").default(true).notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  used: boolean("used").default(false).notNull(),
});

// Email template tables
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  html_content: text("html_content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const emailSegments = pgTable("email_segments", {
  id: serial("id").primaryKey(),
  template_id: serial("template_id").references(() => emailTemplates.id),
  zip_codes: text("zip_codes").array(),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
  total_recipients: serial("total_recipients").notNull(),
  status: text("status").default("completed").notNull(),
});

// Relations
export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  waitlist: one(waitlist, {
    fields: [verificationTokens.email],
    references: [waitlist.email],
  }),
}));

// Add new relations
export const planRelations = relations(plans, ({ many }) => ({
  features: many(planFeatures),
}));

export const planFeaturesRelations = relations(planFeatures, ({ one }) => ({
  plan: one(plans, {
    fields: [planFeatures.plan_id],
    references: [plans.id],
  }),
}));

export const emailSegmentsRelations = relations(emailSegments, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailSegments.template_id],
    references: [emailTemplates.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertWaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  zip_code: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must be numeric"),
});

export const verificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be exactly 6 digits").regex(/^\d+$/, "Verification code must be numeric"),
});

export const insertEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  html_content: z.string().min(1, "Email content is required"),
});

export const insertServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Service description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  sort_order: z.number().optional(),
});

export const insertPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Plan description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  billing_period: z.enum(["monthly", "yearly"]),
  sort_order: z.number().optional(),
});

export const insertPlanFeatureSchema = z.object({
  plan_id: z.number(),
  feature: z.string().min(1, "Feature description is required"),
  included: z.boolean(),
  sort_order: z.number().optional(),
});

// Add new schema for page content
export const insertPageContentSchema = z.object({
  page: z.string().min(1, "Page identifier is required"),
  section: z.string().min(1, "Section identifier is required"),
  key: z.string().min(1, "Content key is required"),
  content: z.string().min(1, "Content is required"),
});

// Export types
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const selectWaitlistSchema = createSelectSchema(waitlist);
export type InsertWaitlist = typeof waitlist.$inferInsert;
export type SelectWaitlist = typeof waitlist.$inferSelect;

export const selectVerificationTokenSchema = createSelectSchema(verificationTokens);
export type InsertVerificationToken = typeof verificationTokens.$inferInsert;
export type SelectVerificationToken = typeof verificationTokens.$inferSelect;

export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type SelectEmailTemplate = typeof emailTemplates.$inferSelect;

export const selectEmailSegmentSchema = createSelectSchema(emailSegments);
export type InsertEmailSegment = typeof emailSegments.$inferInsert;
export type SelectEmailSegment = typeof emailSegments.$inferSelect;

export type InsertService = typeof services.$inferInsert;
export type SelectService = typeof services.$inferSelect;

export type InsertPlan = typeof plans.$inferInsert;
export type SelectPlan = typeof plans.$inferSelect;

export type InsertPlanFeature = typeof planFeatures.$inferInsert;
export type SelectPlanFeature = typeof planFeatures.$inferSelect;

export type InsertPageContent = typeof pageContent.$inferInsert;
export type SelectPageContent = typeof pageContent.$inferSelect;