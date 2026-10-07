output "frontend_production_url" {
  description = "URL pública del frontend de producción."
  value       = azurerm_storage_account.frontend_production.primary_web_endpoint
}

output "frontend_staging_url" {
  description = "URL pública del frontend de staging."
  value       = azurerm_storage_account.frontend_staging.primary_web_endpoint
}

output "frontend_staging_storage_account_name" {
  description = "Nombre del Storage de staging."
  value       = azurerm_storage_account.frontend_staging.name
}

output "frontend_staging_connection_string" {
  description = "Connection string para configurar el secreto del entorno frontend-staging."
  value       = azurerm_storage_account.frontend_staging.primary_connection_string
  sensitive   = true
}
