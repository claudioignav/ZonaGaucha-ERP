output "backend_production_url" {
  description = "URL HTTPS asignada por Azure al nuevo backend de producción."
  value       = "https://${azurerm_linux_web_app.backend_production.default_hostname}"
}

output "backend_staging_url" {
  description = "URL HTTPS asignada por Azure al backend de preproducción."
  value       = "https://${azurerm_linux_web_app.backend_staging.default_hostname}"
}

output "backend_production_app_name" {
  description = "Nombre de la aplicación de producción para su futuro despliegue."
  value       = azurerm_linux_web_app.backend_production.name
}

output "backend_staging_app_name" {
  description = "Nombre de la aplicación de preproducción para su futuro despliegue."
  value       = azurerm_linux_web_app.backend_staging.name
}

output "backend_plans" {
  description = "Planes, regiones y niveles de los recursos nuevos."
  value = {
    production = {
      name     = azurerm_service_plan.backend_production.name
      location = azurerm_service_plan.backend_production.location
      sku      = azurerm_service_plan.backend_production.sku_name
    }
    staging = {
      name     = azurerm_service_plan.backend_staging.name
      location = azurerm_service_plan.backend_staging.location
      sku      = azurerm_service_plan.backend_staging.sku_name
    }
  }
}

output "backend_staging_database" {
  description = "Nombre y servidor de la base de preproducción, sin credenciales."
  value = {
    name        = azapi_resource.backend_staging_database.name
    id          = azapi_resource.backend_staging_database.id
    server_name = data.azurerm_mssql_server.existing.name
    server_host = data.azurerm_mssql_server.existing.fully_qualified_domain_name
  }
}
