# Option C — Environments & Secrets Strategy (1 page)

## Goal
Support multiple test environments (dev/staging/prod) with consistent infrastructure while keeping secrets out of Git.

## Environments
Recommended approach:
- Use a single root module (`infra/`) and pass environment-specific variables.
- Separate environment values via `*.tfvars` files (or Terraform workspaces).

Example:
- `infra/dev.tfvars`
- `infra/staging.tfvars`
- `infra/prod.tfvars`

Run:
- `terraform apply -var-file=dev.tfvars`
- `terraform apply -var-file=staging.tfvars`

Alternative: Terraform workspaces:
- `terraform workspace new dev`
- `terraform workspace new staging`
Pros: easy switching. Cons: can hide state complexity; still need var separation.

## State management
Local state is fine for a take-home.
In a real team:
- Use remote state (e.g., S3 + DynamoDB lock, Terraform Cloud, etc.)
- Enable locking to prevent concurrent applies
- Use separate state per environment

## Secrets handling
Never commit secrets (db passwords, API keys).
Recommended options:
1) Environment variables
   - `TF_VAR_db_password=... terraform apply`
2) A secrets manager (prod)
   - AWS Secrets Manager / Vault
   - Inject into runtime (not into Terraform state where possible)
3) CI secrets
   - GitHub Actions Secrets for non-local runs

For this take-home:
- `terraform.tfvars.example` shows the shape of required secrets
- real `terraform.tfvars` should be gitignored

## Access patterns
- The app container receives DB connection values via environment variables.
- The DB is on a dedicated Docker network with the app.
- Host port exposure is only for local smoke testing convenience; real environments would restrict exposure.
