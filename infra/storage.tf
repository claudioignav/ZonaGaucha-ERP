resource "azurerm_storage_account" "frontend" {
  name                     = "storagefrontendapp"
  resource_group_name      = "rg-frontend"
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "LRS"

  enable_https_traffic_only       = true
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false

  # Bloque requerido por la regla de SonarQube
  identity {
    type = "SystemAssigned"
  }

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}