variable "project_name" {
  type    = string
  default = "zbd-qa"
}

variable "env" {
  type    = string
  default = "dev"
}

variable "db_name" {
  type    = string
  default = "payments"
}

variable "db_user" {
  type    = string
  default = "appuser"
}

variable "db_password" {
  type      = string
  sensitive = true
}
