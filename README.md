# Senior QA Engineer Technical Assessment (ZBD)

This repository contains my submission for the Senior QA Engineer technical assessment.
The goal is to demonstrate how I approach quality, risk, and testing in a real-world
payments system, with an emphasis on correctness, reliability, and practical trade-offs.

The focus is on:
- Testing strategy for a reward payments SDK
- API testing with failure and edge cases
- CI/CD quality gates
- Infrastructure testing and smoke validation
- Reasoning about real-world incidents and trade-offs

Where relevant, assumptions are informed by the public ZBD Rewards SDK documentation:
https://docs.zbdpay.com/rewards/sdk

## Explicit Assumptions

The following assumptions were made intentionally and are documented to avoid ambiguity:

- The client-side SDK runs in untrusted environments (games, devices); all enforcement of
  correctness, limits, and fraud prevention must happen server-side.
- All monetary values are handled as integers (sats); no floating-point arithmetic is used.
- Reward payouts are asynchronous, and final success or failure is confirmed via webhooks.
- Duplicate requests and retries are expected and must be safe.
- Developers must pre-fund reward pools before payouts can occur.
- Testing defaults to non-production environments using fake funds.
- Any production validation, if required, should be minimal, manual, and closely monitored.

All test scenarios and decisions are based on these assumptions.

## Trade-offs
- The mock API is intentionally minimal to demonstrate testing approach, error handling, and concurrency behavior.
- Terraform uses **local Docker** resources (network + compute + database) to avoid cloud cost/risk and keep it  reproducible.
- Smoke tests validate “deployment worked” with basic health + DB readiness checks (not exhaustive).

---

## Contents
- **Part 1:** `part1-test-plan.md` (concise test plan for Rewards SDK)
- **Part 2:**
  - **Option A (API + Load):** `option-a-api-load/`
  - **Option B (CI/CD):** `.github/workflows/ci.yml`
  - **Option C (Terraform IaC):** `option-c-terraform/`
- **Part 3:** `part3-problem-solving.md`

## Tools Used
- Node.js + Express for a mock payment API
- Jest + Supertest for functional tests
- k6 for basic load testing
- GitHub Actions for CI
- Terraform + Docker provider for local “test environment” infra
- Shell scripting – smoke testing
---
## Part 1 – Test Plan

A concise test plan for the **Rewards SDK – Achievement-Based Bitcoin Payouts** feature.
The focus is on identifying the highest-risk areas and validating them first.

Key focus areas:
- Money correctness (amounts, fees, balances)
- Duplicate protection and safe retries
- Rate limiting and fraud prevention
- Webhook reliability
- Safe testing without risking real money

File: `part-1-test-plan.md`


---

## Part 2 – Hands-On Exercises

I implemented Options A, B, and C to demonstrate hands-on capability across API testing,
CI/CD, and infrastructure as code.

---

### Option A – API Testing and Load Testing

A minimal mock payments API, prefund API and Health API used to demonstrate:
- Functional API testing
- Edge-case handling
- Load testing under concurrent traffic

Includes:
- Node.js + Express mock API
- Jest + Supertest functional tests
- k6 load test simulating concurrent users
- A short report summarizing load test results

Location: `option-a-api-load/`

### How to run Option A (API + Load)
```bash
cd option-a-api-load
npm install
npm test
npm start #(starts server locally for load testing)
```
Run Load test 
```bash
k6 run load/k6-payment.js
```
Results: `/option-a-api-load/REPORT.md`

## Option B – CI/CD Pipeline

Option B demonstrates how tests are enforced automatically via CI.
Rather than duplicating test logic, the GitHub Actions workflow:
  - Runs Option A tests on every push and pull request
  - Blocks merges if tests fail
This mirrors how CI would typically be structured in practice.

location:  `.github/workflows/ci.yml`

## Option C – Test Infrastructure as Code

A lightweight, local infrastructure setup using Terraform and Docker to simulate:
  - Application service (compute)
  - Postgres database
  - Isolated network
  - Smoke test to validate deployment
This allows safe, repeatable environment validation without using cloud resources.

location: `option-c-terraform/`

### How to run

``` bash 
cd option-c-terraform/infra
terraform init
terraform apply
```

### smoke tests
``` bash
cd ../scripts
./smoke.sh
```
The smoke test verifies:
  - The application is reachable and healthy
  - The database is running and accepting connections
    
### Env and Secret strategdy 

location: `option-c-terraform/docs/ENV_AND_SECRETS.md`

## Part 3 – Problem Solving

Written responses covering:
  - A production issue involving timeouts and incorrect payment state
  - How I would approach QA as the first QA engineer on a payments platform
Focus areas:
  - Reproducing intermittent failures
  - Identifying testing gaps
  - Preventing future incidents
  - Assessing existing QA practices before introducing changes

file: `part-3-problem-solving.md`

## AI Tool Usage

AI tools were used for initial setup, drafting, and wording polish.

All final decisions and validation were done manually by reviewing the output, running the code, and verifying behavior locally.

## Test results 

#### API Functional tests results

<img width="547" height="239" alt="API tests" src="https://github.com/user-attachments/assets/aa1312f7-6c2a-4821-af32-03a0b156b1d5" />

#### API load test results

<img width="992" height="817" alt="API LOAD TEST" src="https://github.com/user-attachments/assets/e4ba522e-3d4c-44be-8f5f-2f27b7b143e7" />

#### Terraform smoke test results 

<img width="460" height="120" alt="Terraform smoke tests" src="https://github.com/user-attachments/assets/7c7ac6fd-5e0a-4d0f-8e37-dee1ae40e71a" />

