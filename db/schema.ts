import { pgTable, text, serial, boolean, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Base tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  is_admin: boolean("is_admin").default(false).notNull(),
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
  zip_code: text("zip_code").default("").notNull(),
  notes: text("notes"),
  verified: boolean("verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
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
});

// Pricing plans tables
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billing_period: text("billing_period").notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const pricingPlans = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  max_square_footage: integer("max_square_footage"),
  popular: boolean("popular").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  display_order: integer("display_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const planFeatures = pgTable("plan_features", {
  id: serial("id").primaryKey(),
  plan_id: integer("plan_id").references(() => plans.id, { onDelete: "cascade" }).notNull(),
  feature: text("feature").notNull(),
  included: boolean("included").default(true).notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const pricingContent = pgTable("pricing_content", {
  id: serial("id").primaryKey(),
  page_title: text("page_title").notNull(),
  page_subtitle: text("page_subtitle").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  waitlist: one(waitlist, {
    fields: [verificationTokens.email],
    references: [waitlist.email],
  }),
}));

export const emailSegmentsRelations = relations(emailSegments, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [emailSegments.template_id],
    references: [emailTemplates.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  features: many(planFeatures),
}));

export const planFeaturesRelations = relations(planFeatures, ({ one }) => ({
  plan: one(plans, {
    fields: [planFeatures.plan_id],
    references: [plans.id],
  }),
}));



// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  is_admin: z.boolean().default(false).optional(),
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

export const insertPricingPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required"),
  max_square_footage: z.number().min(0).optional(),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  display_order: z.number().default(0),
});

export const insertPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  billing_period: z.string().min(1, "Billing period is required"),
  sort_order: z.number().default(0),
});

export const insertPlanFeatureSchema = z.object({
  plan_id: z.number(),
  feature: z.string().min(1, "Feature text is required"),
  included: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const insertPricingContentSchema = z.object({
  page_title: z.string().min(1, "Page title is required"),
  page_subtitle: z.string().min(1, "Page subtitle is required"),
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

export const selectPricingPlanSchema = createSelectSchema(pricingPlans);
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;
export type SelectPricingPlan = typeof pricingPlans.$inferSelect;

export const selectPlanFeatureSchema = createSelectSchema(planFeatures);
export type InsertPlanFeature = typeof planFeatures.$inferInsert;
export type SelectPlanFeature = typeof planFeatures.$inferSelect;

export const selectPricingContentSchema = createSelectSchema(pricingContent);
export type InsertPricingContent = typeof pricingContent.$inferInsert;
export type SelectPricingContent = typeof pricingContent.$inferSelect;

export const selectPlanSchema = createSelectSchema(plans);
export type InsertPlan = typeof plans.$inferInsert;
export type SelectPlan = typeof plans.$inferSelect;