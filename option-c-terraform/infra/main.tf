terraform {
  required_version = ">= 1.5.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

module "network" {
  source = "../modules/network"
  name   = "${var.project_name}-${var.env}"

  providers = {
    docker = docker
  }
}

module "postgres" {
  source       = "../modules/postgres"
  env          = var.env
  network_name = module.network.name

  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password

  providers = {
    docker = docker
  }
}

module "app" {
  source       = "../modules/app"
  env          = var.env
  network_name = module.network.name

  db_host     = module.postgres.host
  db_port     = module.postgres.port
  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password

  providers = {
    docker = docker
  }
}
