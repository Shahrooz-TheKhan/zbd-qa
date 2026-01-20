variable "env" { type = string }
variable "network_name" { type = string }

variable "db_host" { type = string }
variable "db_port" { type = number }
variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}

locals {
  container_name = "app-${var.env}"
  internal_port  = 8080
  external_port  = 18080
}

resource "docker_image" "app" {
  name = "hashicorp/http-echo:1.0"
}

resource "docker_container" "app" {
  name  = local.container_name
  image = docker_image.app.image_id

  command = [
    "-listen", ":${local.internal_port}",
    "-text", "ok=true env=${var.env} db=${var.db_host}:${var.db_port}/${var.db_name}"
  ]

  env = [
    "ENV=${var.env}",
    "DB_HOST=${var.db_host}",
    "DB_PORT=${var.db_port}",
    "DB_NAME=${var.db_name}",
    "DB_USER=${var.db_user}",
    "DB_PASSWORD=${var.db_password}"
  ]

  networks_advanced {
    name = var.network_name
  }

  ports {
    internal = local.internal_port
    external = local.external_port
  }
}

output "base_url" {
  value = "http://localhost:${local.external_port}"
}
