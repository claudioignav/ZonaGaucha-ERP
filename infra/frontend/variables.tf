variable "azure_subscription_id" {
  description = "Identificador de la suscripción Azure for Students."
  type        = string
}

variable "resource_group_name" {
  description = "Resource Group existente de Zona Gaucha."
  type        = string
  default     = "zg-erp"
}

variable "frontend_location" {
  description = "Región de las cuentas Storage del frontend."
  type        = string
  default     = "brazilsouth"
}

variable "frontend_production_storage_account_name" {
  description = "Cuenta Storage existente del frontend de producción."
  type        = string
  default     = "zgerpfrontapp"
}

variable "frontend_staging_storage_account_name" {
  description = "Nombre globalmente único para el Storage del frontend de staging."
  type        = string
  default     = "zgerpfrontstg"
}

variable "tags" {
  description = "Etiquetas comunes para los recursos nuevos administrados por Terraform."
  type        = map(string)
  default = {
    application = "zona-gaucha-erp"
    managed-by  = "terraform"
  }
}
