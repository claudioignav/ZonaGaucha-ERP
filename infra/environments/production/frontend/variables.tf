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
