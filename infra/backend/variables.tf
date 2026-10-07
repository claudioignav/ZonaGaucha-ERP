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

variable "backend_staging_location" {
  description = "Región de preproducción. Debe admitir Linux F1; puede ser distinta si Azure restringe Brasil Sur."
  type        = string
  default     = "brazilsouth"
}

variable "backend_production_plan_name" {
  description = "Nombre del nuevo plan B1 de producción."
  type        = string
  default     = "service-zg"
}

variable "backend_staging_plan_name" {
  description = "Nombre del nuevo plan F1 gratuito de preproducción."
  type        = string
  default     = "service-zg-stg"
}

variable "backend_production_app_name" {
  description = "Nombre globalmente único de la aplicación de producción."
  type        = string
  default     = "zgerpbacktapp"
}

variable "backend_staging_app_name" {
  description = "Nombre globalmente único de la aplicación de preproducción."
  type        = string
  default     = "zgerpbackstg"
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

variable "frontend_staging_origins" {
  description = "Orígenes HTTPS del frontend que pueden llamar al backend de preproducción."
  type        = list(string)
  default     = ["https://zgerpfrontstg.z15.web.core.windows.net"]

  validation {
    condition     = alltrue([for origin in var.frontend_staging_origins : startswith(origin, "https://") && !strcontains(origin, "*") && !endswith(origin, "/")])
    error_message = "Indica orígenes HTTPS exactos, sin comodines ni barra final."
  }
}

variable "existing_sql_server_name" {
  description = "Servidor SQL existente que alojará la nueva base, sin administrar su configuración."
  type        = string
  default     = "zg-dbserver"
}

variable "backend_staging_database_name" {
  description = "Nombre de la base nueva y vacía de preproducción. No debe ser el de producción."
  type        = string
  default     = "sqldb-zonagaucha-stg"

  validation {
    condition = (
      length(trimspace(var.backend_staging_database_name)) > 0 &&
      !contains(["master", "sqldb-zonagaucha"], lower(var.backend_staging_database_name))
    )
    error_message = "Indica un nombre nuevo; no puedes usar master ni sqldb-zonagaucha, que es producción."
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
