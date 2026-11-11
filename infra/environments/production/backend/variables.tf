variable "azure_subscription_id" {
  description = "Identificador de la suscripción de Azure donde se creará el backend."
  type        = string
}

variable "resource_group_name" {
  description = "Grupo de recursos existente de Zona Gaucha."
  type        = string
  default     = "zg-erp"
}

variable "backend_production_location" {
  description = "Región del backend de producción. Debe admitir Linux B1 en tu suscripción."
  type        = string
  default     = "brazilsouth"
}

variable "backend_production_plan_name" {
  description = "Nombre del nuevo plan B1 de producción."
  type        = string
  default     = "service-zg"
}

variable "backend_production_app_name" {
  description = "Nombre globalmente único de la aplicación de producción."
  type        = string
  default     = "zgerpbacktapp"
}

variable "backend_node_version" {
  description = "Versión de Node.js del backend. Se debe confirmar con su package.json antes de desplegar código."
  type        = string
  default     = "22-lts"

  validation {
    condition     = contains(["22-lts", "24-lts"], var.backend_node_version)
    error_message = "Usa una versión LTS compatible: 22-lts o 24-lts."
  }
}

variable "backend_startup_command" {
  description = "Comando de inicio, si el backend lo necesita. No se inventa una ruta de entrada sin revisar el código."
  type        = string
  default     = null
}

variable "frontend_production_origins" {
  description = "Orígenes HTTPS del frontend que pueden llamar al backend de producción."
  type        = list(string)
  default     = ["https://zgerpfrontapp.z15.web.core.windows.net"]

  validation {
    condition     = alltrue([for origin in var.frontend_production_origins : startswith(origin, "https://") && !strcontains(origin, "*") && !endswith(origin, "/")])
    error_message = "Indica orígenes HTTPS exactos, sin comodines ni barra final."
  }
}

variable "tags" {
  description = "Etiquetas comunes para identificar los recursos nuevos."
  type        = map(string)
  default = {
    application = "zona-gaucha-erp"
    managed-by  = "terraform"
  }
}
