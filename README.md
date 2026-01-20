# Senior QA Engineer Technical Assessment (ZBD)

This repo contains my deliverables for the assessment.

The focus is on:
- Testing strategy for a reward payments SDK
- API testing with failure and edge cases
- CI/CD quality gates
- Infrastructure testing and smoke validation
- Reasoning about real-world incidents and trade-offs

## Contents
- **Part 1:** `part1-test-plan.md` (concise test plan for Rewards SDK)
- **Part 2:**
  - **Option A (API + Load):** `option-a-api-load/`
  - **Option B (CI/CD):** `option-b-cicd/.github/workflows/ci.yml`
  - **Option C (Terraform IaC):** `option-c-terraform/`
- **Part 3:** `part3-problem-solving.md`

## Tools Used
- Node.js + Express for a mock payment API
- Jest + Supertest for functional tests
- k6 for basic load testing
- GitHub Actions for CI
- Terraform + Docker provider for local “test environment” infra

## Assumptions / Trade-offs
- The mock API is intentionally minimal to demonstrate testing approach, error handling, and concurrency behavior.
- Terraform uses **local Docker** resources (network + compute + database) to avoid cloud cost/risk and keep it reproducible.
- Smoke tests validate “deployment worked” with basic health + DB readiness checks (not exhaustive).

---

# How to run Option A (API + Load)
```bash
cd option-a-api-load
npm install
npm test
npm run start
