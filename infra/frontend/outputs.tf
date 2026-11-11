output "frontend_production_url" {
  description = "URL pública del frontend de producción."
  value       = azurerm_storage_account.frontend_production.primary_web_endpoint
}
