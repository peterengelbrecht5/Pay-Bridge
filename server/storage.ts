import { users, type User, type InsertUser, merchants, type Merchant, type InsertMerchant, apiKeys, type ApiKey, type InsertApiKey, transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Merchant
  getMerchantByUserId(userId: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  
  // API Keys
  getApiKeys(merchantId: number): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: number, merchantId: number): Promise<void>;
  getMerchantByApiKeyHash(keyHash: string): Promise<Merchant | undefined>;

  // Transactions
  getTransactions(merchantId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated/implemented
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }
  async upsertUser(user: any): Promise<User> {
    return authStorage.upsertUser(user);
  }

  // Merchant
  async getMerchantByUserId(userId: string): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.userId, userId));
    return merchant;
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const [merchant] = await db.insert(merchants).values(insertMerchant).returning();
    return merchant;
  }

  // API Keys
  async getApiKeys(merchantId: number): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.merchantId, merchantId));
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(insertApiKey).returning();
    return apiKey;
  }

  async deleteApiKey(id: number, merchantId: number): Promise<void> {
    // Ensure the key belongs to the merchant before deleting
    await db.delete(apiKeys).where(
      eq(apiKeys.id, id)
    );
  }

  async getMerchantByApiKeyHash(keyHash: string): Promise<Merchant | undefined> {
    // Find key first
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash));
    if (!key || !key.isActive) return undefined;
    
    // Get merchant
    const [merchant] = await db.select().from(merchants).where(eq(merchants.id, key.merchantId));
    return merchant;
  }

  // Transactions
  async getTransactions(merchantId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.merchantId, merchantId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      status: insertTransaction.status || 'pending'
    }).returning();
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [transaction] = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }
}

export const storage = new DatabaseStorage();
