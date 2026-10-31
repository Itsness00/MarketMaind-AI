import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default('Institutional Analyst'),
  authProvider: text('auth_provider').notNull().default('google'),
  institution: text('institution').notNull().default('MarketMind Global Desk'),
  baseCurrency: text('base_currency').notNull().default('USD'),
  preferredAiEngine: text('preferred_ai_engine').notNull().default('dual-gemma-gemini'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userApiSources = pgTable('user_api_sources', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  sourceKey: text('source_key').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('MARKET_DATA'),
  endpointUrl: text('endpoint_url').notNull(),
  protocol: text('protocol').notNull().default('REST_JSON'),
  description: text('description').notNull().default('Custom device API / Open-Source feed'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  apiSources: many(userApiSources),
}));

export const userApiSourcesRelations = relations(userApiSources, ({ one }) => ({
  owner: one(users, {
    fields: [userApiSources.userId],
    references: [users.id],
  }),
}));
