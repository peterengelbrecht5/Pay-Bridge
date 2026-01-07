import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get merchant from authenticated user
  const requireMerchant = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.claims.sub;
    const merchant = await storage.getMerchantByUserId(userId);
    if (!merchant) {
        // If checking /api/merchants/me, passing through to let route handle 404
        if (req.path === '/api/merchants/me' && req.method === 'GET') return next();
        return res.status(403).json({ message: "Merchant profile required" });
    }
    req.merchant = merchant;
    next();
  };

  // === Merchants ===
  
  app.get(api.merchants.me.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const merchant = await storage.getMerchantByUserId(userId);
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found" });
    }
    res.json(merchant);
  });

  app.post(api.merchants.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.merchants.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Check if already exists
      const existing = await storage.getMerchantByUserId(userId);
      if (existing) {
        return res.status(400).json({ message: "Merchant profile already exists" });
      }

      const merchant = await storage.createMerchant({ ...input, userId });
      res.status(201).json(merchant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === API Keys ===

  app.get(api.apiKeys.list.path, requireMerchant, async (req: any, res) => {
    const keys = await storage.getApiKeys(req.merchant.id);
    res.json(keys);
  });

  app.post(api.apiKeys.create.path, requireMerchant, async (req: any, res) => {
    try {
      const input = api.apiKeys.create.input.parse(req.body);
      
      // Generate Key
      const rawKey = `sk_test_${crypto.randomBytes(24).toString('hex')}`;
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      
      const apiKey = await storage.createApiKey({
        merchantId: req.merchant.id,
        name: input.name,
        prefix: 'sk_test', // Hardcoded for MVP
        keyHash: keyHash,
        isActive: true
      });

      // Return raw key only once
      res.status(201).json({ ...apiKey, rawKey });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.apiKeys.delete.path, requireMerchant, async (req: any, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteApiKey(id, req.merchant.id);
    res.sendStatus(204);
  });

  // === Transactions (Dashboard) ===

  app.get(api.transactions.list.path, requireMerchant, async (req: any, res) => {
    const transactions = await storage.getTransactions(req.merchant.id);
    res.json(transactions);
  });

  // === Public API (Checkout/Simulation) ===

  // Middleware to validate API Key
  const validateApiKey = async (req: any, res: any, next: any) => {
    const apiKeyHeader = req.headers['x-api-key'];
    if (!apiKeyHeader) return res.status(401).json({ message: "Missing API Key" });
    
    // In a real app, use timing safe comparison. MVP: simple hash check.
    // Hash the incoming key to compare with stored hash
    const keyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');
    const merchant = await storage.getMerchantByApiKeyHash(keyHash);
    
    if (!merchant) {
      return res.status(401).json({ message: "Invalid API Key" });
    }
    req.merchant = merchant;
    next();
  };

  app.post(api.transactions.create.path, validateApiKey, async (req: any, res: any) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const transaction = await storage.createTransaction({
        ...input,
        merchantId: req.merchant.id,
        status: 'pending'
      });
      res.status(201).json(transaction);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.post(api.transactions.process.path, async (req, res) => {
    try {
        const transactionId = parseInt(req.params.id);
        const transaction = await storage.getTransaction(transactionId);
        
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: "Transaction already processed" });
        }

        const { cardNumber, btcAddress } = req.body;
        
        let newStatus = "success";
        if (transaction.currency === "BTC") {
          // BTC Simulation: fails if address is "fail"
          if (btcAddress === "fail") newStatus = "failed";
        } else {
          // Card Simulation: fails if ends in 0000
          if (cardNumber?.endsWith("0000")) newStatus = "failed";
        }

        const updated = await storage.updateTransactionStatus(transactionId, newStatus);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Processing failed" });
    }
  });

  app.get('/api/public/transactions/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid transaction ID" });
        const transaction = await storage.getTransaction(id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
        res.json(transaction);
      } catch (err) {
        res.status(500).json({ message: "Internal server error" });
      }
  });

  // Helper route for no-code button to create transaction and redirect
  app.get('/api/public/transactions/quick', async (req: any, res) => {
    try {
      const { apiKey, amount, currency, referenceId, customerEmail } = req.query;
      
      if (!apiKey) return res.status(401).json({ message: "Missing API Key" });
      
      const keyHash = crypto.createHash('sha256').update(apiKey as string).digest('hex');
      const merchant = await storage.getMerchantByApiKeyHash(keyHash);
      
      if (!merchant) return res.status(401).json({ message: "Invalid API Key" });

      const amountInt = parseInt(amount as string);
      if (isNaN(amountInt) || amountInt <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const transaction = await storage.createTransaction({
        merchantId: merchant.id,
        amount: amountInt,
        currency: (currency as string) || "USD",
        customerEmail: (customerEmail as string) || null,
        referenceId: (referenceId as string) || null,
        status: 'pending'
      });

      res.redirect(`/checkout/${transaction.id}`);
    } catch (err) {
      res.status(500).json({ message: "Quick transaction failed" });
    }
  });


  // === Seed Demo Data ===
  (async () => {
    try {
      // Check if any merchant exists
      // We need a way to check count or just try to find one. 
      // Since we don't have a get all merchants, we can't easily check count without storage method.
      // But we can check if a specific "demo" user exists if we had a constant ID.
      // For MVP simplicity, let's just log that the system is ready. 
      // User can sign up. 
      // If we really want a demo, we'd need to create a user first (via Auth), which is complex programmatically with Replit Auth.
      // So we will skip auto-seeding a merchant and rely on the user to sign up.
      console.log("System ready. Sign up to create a merchant profile.");
    } catch (e) {
      console.error("Seed error", e);
    }
  })();

  return httpServer;
}
