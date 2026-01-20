variable "name" {
  type = string
}

resource "docker_network" "this" {
  name = var.name
}

output "name" {
  value = docker_network.this.name
}
