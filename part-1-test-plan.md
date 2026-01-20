# Part 1 — Test Plan: Rewards SDK (Achievement-Based Bitcoin Payouts)

## 1) Assumptions & Context

This test plan is based on the provided PRD and the publicly available ZBD Rewards SDK documentation:
https://docs.zbdpay.com/rewards/sdk

Key assumptions:
- The SDK is used by game developers to trigger rewards but relies on ZBD backend APIs for validation and payouts.
- Client-side SDK calls cannot be trusted; the backend is the source of truth for eligibility, balances, and payouts.
- Rewards are asynchronous and final success or failure is confirmed via webhooks.
- Users receive rewards into a ZBD wallet.
- All payout amounts are integers (sats), with no floating-point values.
- Developers must pre-fund a reward pool, and each payout includes a 2% service fee.

---

## 2) Test Scope

### What I would prioritize (highest risk areas)

- **Money correctness**
  - Correct payout amounts (1–100,000 sats)
  - Correct 2% service fee calculation
  - Accurate developer balance deductions
  - Dashboard totals matching underlying data
- **Duplicate protection**
  - Prevent double payouts caused by retries, duplicate achievement submissions, or webhook retries.
- **Payout timing**
  - Users receive funds within the 60-second SLA (measured using percentiles, not just averages).
- **Rate limiting**
  - Enforce a maximum of 10 rewards per user per hour at the backend level.
- **Fraud prevention**
  - Detect suspicious patterns and block users after 3 failed attempts within 10 minutes.
- **Failure handling**
  - Insufficient developer balance
  - Suspended user accounts
  - Network timeouts or partial failures
- **Webhook reliability**
  - Correct success/failed notifications
  - Retry behavior when developer endpoints are unavailable
- **Safe testing**
  - Clear separation between testing and real-money environments.

### What I would defer (explicitly)

- Full UI automation of the dashboard (focus on validating data correctness first).
- Exhaustive SDK/platform testing across all engines and devices.
- Deep security or penetration testing beyond QA-level validation (flag as follow-up work).
- Extended analytics validation beyond the core metrics listed in the PRD.

---

## 3) Critical Test Scenarios

| Test ID | Scenario | Expected Result | Priority |
|-------|---------|----------------|----------|
| T01 | Happy path: valid reward event, valid user, successful payout | User wallet credited within 60s; success webhook sent; dashboard metrics updated | Blocker |
| T02 | Payout amount outside allowed range (below 1 or above 100,000 sats) | Request rejected with clear validation error; no payout created | Blocker |
| T03 | Developer attempts to pre-fund less than 100,000 sats | Request rejected; reward pool not created or updated | Blocker |
| T04 | Insufficient developer balance during payout | No wallet credit; payout marked failed; failed webhook sent; dashboard shows failure | Blocker |
| T05 | Service fee calculation (2%) | Developer balance reduced by payout + fee; values consistent across API and dashboard | Blocker |
| T06 | Duplicate reward claim for same user and achievement | Only one payout created; subsequent requests return idempotent response | Blocker |
| T07 | User exceeds rate limit (>10 rewards in one hour) | Additional requests rejected; no payouts created | Blocker |
| T08 | Fraud rule triggered (3 failed attempts in 10 minutes) | User temporarily blocked; further attempts rejected and logged | Blocker |
| T09 | Suspended user attempts to claim reward | Request rejected; no payout; safe error returned | Blocker |
| T10 | Webhook endpoint down and/or poor network conditions | Webhooks retried with backoff; no duplicate payouts; final state remains consistent | High |

---

## 4) Test Environment Strategy (Safe Testing)

- Default all automated testing to a **non-production environment using fake sats**.
- Use sandbox developer accounts with pre-seeded reward pools.
- Enforce strict separation between test and production environments:
  - Separate API endpoints and credentials
  - CI guardrails to prevent production calls
- Test webhook behavior using mock endpoints and controlled failure scenarios.
- If limited production verification is required:
  - Use very small amounts
  - Run manually (not in CI)
  - Monitor closely and treat as canary testing.

---

## 5) Key Risks & Mitigations

1. **Double payouts**
   - Caused by retries, duplicate achievement submissions, or webhook retries.
   - Mitigation: idempotency keys and server-side deduplication.
2. **Incorrect balance or fee calculations**
   - Risk of overpaying users or misreporting totals.
   - Mitigation: integer-only calculations, centralized fee logic, reconciliation checks.
3. **Fraud or abuse from client-side tampering**
   - SDK runs in untrusted environments.
   - Mitigation: backend validation, rate limits, fraud detection rules.
4. **Missed or inconsistent webhook delivery**
   - Developers may not know final payout state.
   - Mitigation: retries with backoff, failure visibility, ability to re-send events.
5. **Accidental real-money payouts during testing**
   - Mitigation: strict environment separation, separate credentials, CI safeguards, and monitoring.
