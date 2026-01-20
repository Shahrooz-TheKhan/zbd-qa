const express = require("express");

const app = express();

// Parse JSON bodies
app.use(express.json());

// Basic health endpoint for smoke checks and CI confidence
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// In-memory store: developerId -> balanceSats
const developerPools = new Map();

/**
 * Prefund a developer reward pool.
 * Body: { developerId: string, amountSats: integer }
 * Rules: minimum 100,000 sats per prefund request.
 */
app.post("/prefund", (req, res) => {
  const { developerId, amountSats } = req.body || {};

  // Validate presence + types
  if (!developerId || !Number.isInteger(amountSats)) {
    return res.status(400).json({ error: "developerId and integer amountSats required" });
  }

  // Business rule from PRD: minimum prefund
  if (amountSats < 100000) {
    return res.status(400).json({ error: "minimum prefund is 100,000 sats" });
  }

  const current = developerPools.get(developerId) || 0;
  developerPools.set(developerId, current + amountSats);

  return res.status(200).json({
    developerId,
    balanceSats: developerPools.get(developerId)
  });
});

/**
 * Mock payment endpoint.
 * Body: { developerId: string, userId: string, amountSats: integer }
 * Behavior:
 *  - Validates inputs
 *  - Applies 2% service fee (floor)
 *  - Fails if developer balance is insufficient
 *  - Deducts amount + fee from the developer pool
 */
app.post("/pay", (req, res) => {
  const { developerId, userId, amountSats } = req.body || {};

  // Input validation (payments must be explicit and integer-based)
  if (!developerId || !userId || !Number.isInteger(amountSats)) {
    return res.status(400).json({ error: "developerId, userId and integer amountSats required" });
  }

  // To keep demo simple: don’t allow 0 or negative “payments”
  if (amountSats < 1) {
    return res.status(400).json({ error: "amountSats must be >= 1" });
  }

  // 2% service fee (integer sats)
  const feeSats = Math.floor(amountSats * 0.02);
  const totalCostSats = amountSats + feeSats;

  const balance = developerPools.get(developerId) || 0;

  // Key error condition for payments: insufficient funds
  if (balance < totalCostSats) {
    return res.status(402).json({ error: "insufficient developer balance" });
  }

  // Deduct funds (“money moved”)
  developerPools.set(developerId, balance - totalCostSats);

  return res.status(200).json({
    status: "SUCCESS",
    developerId,
    userId,
    amountSats,
    feeSats,
    totalCostSats,
    developerBalanceSats: developerPools.get(developerId),
  });
});

module.exports = app;
