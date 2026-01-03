import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id),
  keyHash: text("key_hash").notNull(),
  prefix: text("prefix").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id),
  amount: integer("amount").notNull(), // stored in cents
  currency: text("currency").default("USD").notNull(),
  status: text("status").notNull().default("pending"), // pending, success, failed
  customerEmail: text("customer_email"),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, {
    fields: [merchants.userId],
    references: [users.id],
  }),
  apiKeys: many(apiKeys),
  transactions: many(transactions),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  merchant: one(merchants, {
    fields: [apiKeys.merchantId],
    references: [merchants.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertMerchantSchema = createInsertSchema(merchants).omit({ id: true, userId: true, createdAt: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, merchantId: true, keyHash: true, prefix: true, createdAt: true });
// For transactions, we usually create them via API, but we'll have a schema for the creation request
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, merchantId: true, createdAt: true, status: true });


// === EXPLICIT API CONTRACT TYPES ===

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// API Request/Response Types

export type CreateMerchantRequest = InsertMerchant;
export type CreateApiKeyRequest = InsertApiKey;
// Response for API Key creation needs to return the raw key ONLY ONCE
export type CreateApiKeyResponse = ApiKey & { rawKey: string };

export type CreateTransactionRequest = {
  amount: number;
  currency: string;
  customerEmail?: string;
  referenceId?: string;
};

export type ProcessPaymentRequest = {
  transactionId: number;
  cardNumber: string; // Simulated
  cvv: string; // Simulated
  expiry: string; // Simulated
};

export type TransactionResponse = Transaction;

