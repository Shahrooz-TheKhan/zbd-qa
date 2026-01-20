# Part 3 — Problem Solving

## Scenario 1
**A critical bug in production: Lightning payments occasionally fail with a timeout, but users are still charged. Happens ~1% normally and ~5% during traffic spikes.**

### How I’d reproduce it
- Simulate high traffic and degraded network conditions between the API and the payment processor:
  - Artificial latency
  - Timeouts
  - Partial failures
- Trigger concurrent payouts while forcing intermittent timeouts at the payment step.
- Correlate:
  - API responses
  - payment processor responses
  - final wallet state
- Look specifically for cases where:
  - the API times out or errors
  - but the payment actually completes asynchronously afterward

The goal is to reproduce a **“payment succeeded but confirmation was lost”** scenario.

---

### What testing gap likely allowed this
- **Lack of idempotency** on payout creation or retries.
- Treating a timeout as a definitive failure instead of an *unknown state*.
- Insufficient testing under:
  - real concurrency
  - partial failures
  - degraded network conditions
- Missing validation that retries do not re-trigger payments when the original request eventually succeeds.

---

### Prevention strategy going forward
- Treat timeouts as **“unknown”**, not “failed,” until confirmed.
- Introduce **idempotency keys** for payout requests so retries are safe.
- Ensure payout state transitions are explicit and auditable (e.g., pending → succeeded / failed).
- Add monitoring and alerts on:
  - timeout rates
  - mismatches between API responses and wallet state
- Add load and chaos-style tests that intentionally inject latency and timeouts into the payment flow.

---

## Scenario 2
**You’re starting as the first QA engineer at ZBD (payments platform with mobile apps and APIs).**

### First 30-day plan

**Week 1–2: Assess what already exists**
- Understand the end-to-end payment flows (SDK → API → payout → webhook).
- Review any existing QA practices:
  - manual test checklists
  - automated tests (if any)
  - CI pipelines
  - release and incident response processes.
- Analyze recent incidents, support tickets, and on-call reports to identify real failure patterns.
- Evaluate observability and tooling:
  - error and timeout metrics
  - logging around payouts and retries
  - visibility into webhook failures.
- Identify the highest-risk gaps, especially around money movement, retries, and state consistency.

**Week 3–4: Strengthen and formalize**
- Define a small “critical regression” suite (smoke + payments core) that runs:
  - on every PR (fast, reliable)
  - before release (slightly broader).
  This becomes the team’s go-to safety net for changes impacting money movement.
- Fill the most critical gaps with targeted automated tests:
  - happy-path payouts
  - duplicate/retry safety
  - insufficient balance handling
  - suspended users.
- Add or tighten CI gates so critical paths block regressions.
- Document testing strategy, known risks, and ownership so the team has shared expectations.
- Propose a realistic roadmap to expand coverage without slowing delivery.

---

### Balancing speed vs coverage
- Focus on **high-impact paths first**, especially anything involving money.
- Avoid trying to test “everything” early.
- Use lightweight automation and targeted manual testing where it provides the most value.
- Expand coverage incrementally as the system stabilizes.

---

### Approach to testing financial transactions with real money
- Default all testing to **non-production environments** with fake funds.
- Keep production testing:
  - manual
  - minimal
  - explicitly approved
- Use very small amounts and dedicated accounts if production validation is required.
- Rely heavily on monitoring, alerts, and reconciliation checks rather than frequent production tests.
- Treat production as something to **observe carefully**, not experiment in.

---

## Summary
The key to testing financial systems is not exhaustive test cases, but:
- clear state transitions
- safe retries
- strong observability
- and disciplined handling of unknown or partial failures.

