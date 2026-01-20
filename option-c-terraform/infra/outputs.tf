output "app_base_url" {
  value = module.app.base_url
}

output "postgres_dsn" {
  value     = module.postgres.dsn
  sensitive = true
}
