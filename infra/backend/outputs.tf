output "backend_production_url" {
  description = "URL HTTPS asignada por Azure al nuevo backend de producción."
  value       = "https://${azurerm_linux_web_app.backend_production.default_hostname}"
}

output "backend_production_app_name" {
  description = "Nombre de la aplicación de producción para su futuro despliegue."
  value       = azurerm_linux_web_app.backend_production.name
}

output "backend_plans" {
  description = "Planes, regiones y niveles de los recursos nuevos."
  value = {
    production = {
      name     = azurerm_service_plan.backend_production.name
      location = azurerm_service_plan.backend_production.location
      sku      = azurerm_service_plan.backend_production.sku_name
    }
  }
}
