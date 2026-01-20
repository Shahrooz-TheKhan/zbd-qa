# Option A — API Testing + Basic Load Test Report

## What I built
A minimal mock payments API with:
- `POST /prefund` — pre-fund a developer pool (min 100,000 sats)
- `POST /pay` — mock payment that deducts `amountSats + 2% fee` from the developer pool
- `GET /health` — basic health check

Functional tests are implemented with Jest + Supertest (in-memory HTTP testing, no ports needed).

## Functional test coverage (high-signal scenarios)
- Happy path: valid prefund and pay succeeds
- Validation: missing required fields / non-integer amounts rejected with 400
- Boundary: `amountSats` must be >= 1
- Funds control: insufficient developer balance returns 402
- Accounting: balance decreases by `amount + fee` and fee math uses integer sats (floor)

## Load test setup
Tool: k6  
Scenario: 75 virtual users (VUs) for 20 seconds against `POST /pay` (with a one-time prefund in `setup()`).

Why: demonstrate concurrent behavior and failure patterns (error rate + latency), not to “benchmark” performance.

## Load test results (local run)
- Checks succeeded: 100% (14,626 / 14,626)
- Failed requests: 0%
- Throughput: ~728 requests/sec (14,626 requests in ~20s)
- Latency: avg 2.45ms, p90 5.25ms, p95 7.07ms, max 19.25ms

Observation: With sufficient prefunding, the API remained correct under concurrency with low latency.

## Key findings / recommendations
1. **Idempotency is required for real payments**  
   Add an idempotency key for `/pay` to prevent double-charges on retries (especially under timeouts).
2. **Rate limiting + fraud controls should be enforced server-side**  
   Even if an SDK exists, enforce user/developer rate limits and suspicious patterns at the API layer.
3. **Use durable storage + transactional updates**  
   This demo uses an in-memory Map; a real implementation needs an ACID database transaction to prevent race conditions and ensure correct balances under concurrent writes.
4. **Add observability**  
   Record request IDs, outcome codes, and latency percentiles; alert on spikes in timeouts / 402s / webhook failures.

## Trade-offs
- In-memory state is intentional to keep scope small and deterministic for a take-home.
- No auth/webhooks here; those are covered in Part 1 test planning and Part 3 incident prevention strategy.
