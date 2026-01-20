variable "env" { type = string }
variable "network_name" { type = string }

variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}

locals {
  container_name = "postgres-${var.env}"
  port           = 5432
}

resource "docker_image" "postgres" {
  name = "postgres:16-alpine"
}

resource "docker_container" "postgres" {
  name  = local.container_name
  image = docker_image.postgres.image_id

  env = [
    "POSTGRES_DB=${var.db_name}",
    "POSTGRES_USER=${var.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}",
  ]

  networks_advanced {
    name = var.network_name
  }

  ports {
    internal = local.port
    external = 5432
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ${var.db_user} -d ${var.db_name}"]
    interval = "5s"
    timeout  = "3s"
    retries  = 20
  }
}

output "host" {
  value = local.container_name
}

output "port" {
  value = local.port
}

output "dsn" {
  value     = "postgresql://${var.db_user}:${var.db_password}@localhost:5432/${var.db_name}"
  sensitive = true
}
