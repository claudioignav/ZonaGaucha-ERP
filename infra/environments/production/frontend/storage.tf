# el sitio estatico necesita acceso publico
#trivy:ignore:azure-storage-default-action-deny
resource "azurerm_storage_account" "frontend_production" {
  name                = var.frontend_production_storage_account_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.frontend_location

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

  lifecycle {
    prevent_destroy = true
  }
}

# sitio estatico que sirve el build de angular
resource "azurerm_storage_account_static_website" "frontend_production" {
  storage_account_id = azurerm_storage_account.frontend_production.id
  index_document     = "index.html"
  error_404_document = "index.html"
}
