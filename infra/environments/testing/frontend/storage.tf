# el acceso publico permite servir el sitio estatico de Angular
#trivy:ignore:azure-storage-default-action-deny
resource "azurerm_storage_account" "frontend_testing" {
  name                = "zgerpfronttest"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location

  account_kind             = "StorageV2"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  access_tier              = "Hot"

  https_traffic_only_enabled       = true
  min_tls_version                  = "TLS1_2"
  allow_nested_items_to_be_public  = false
  shared_access_key_enabled        = true
  default_to_oauth_authentication  = false
  cross_tenant_replication_enabled = false
  public_network_access            = "Enabled"

  tags = {
    environment = "testing"
    component   = "frontend"
  }
}

resource "azurerm_storage_account_static_website" "frontend_testing" {
  storage_account_id = azurerm_storage_account.frontend_testing.id
  index_document     = "index.html"
  error_404_document = "index.html"
}

output "frontend_testing_url" {
  description = "URL del sitio estático de Testing."
  value       = azurerm_storage_account.frontend_testing.primary_web_endpoint
}

output "frontend_testing_storage_account_name" {
  description = "Cuenta que recibe el artefacto del frontend de Testing."
  value       = azurerm_storage_account.frontend_testing.name
}
