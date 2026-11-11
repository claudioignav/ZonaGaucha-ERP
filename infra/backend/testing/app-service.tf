data "azurerm_storage_account" "frontend_testing" {
  name                = "zgerpfronttest"
  resource_group_name = data.azurerm_resource_group.main.name
}

data "azurerm_mssql_server" "existing" {
  name                = "zg-dbserver"
  resource_group_name = data.azurerm_resource_group.main.name
}

locals {
  tags = {
    environment = "testing"
    component   = "backend"
  }
  staging_database_name = "sqldb-zonagaucha-stg"
}

resource "azurerm_service_plan" "backend_testing" {
  name                = "service-zg-test"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
  worker_count        = 1
  tags                = local.tags
}

resource "azurerm_linux_web_app" "backend_testing" {
  name                = "zgerpbacktest"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = azurerm_service_plan.backend_testing.location
  service_plan_id     = azurerm_service_plan.backend_testing.id

  https_only                                     = true
  ftp_publish_basic_authentication_enabled       = false
  webdeploy_publish_basic_authentication_enabled = false

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on               = false
    ftps_state              = "Disabled"
    minimum_tls_version     = "1.2"
    scm_minimum_tls_version = "1.2"
    http2_enabled           = true
    use_32_bit_worker       = true

    application_stack {
      node_version = "22-lts"
    }

    cors {
      allowed_origins     = [trimsuffix(data.azurerm_storage_account.frontend_testing.primary_web_endpoint, "/")]
      support_credentials = false
    }
  }

  # APP_ENV selecciona la base permitida por el backend. La etiqueta Azure identifica Testing.
  app_settings = {
    NODE_ENV = "production"
    APP_ENV  = "staging"
    DB_HOST  = data.azurerm_mssql_server.existing.fully_qualified_domain_name
    DB_NAME  = local.staging_database_name
    DB_PORT  = "1433"
  }

  tags = local.tags

  lifecycle {
    # Las credenciales de ejecución se configuran directamente en App Service.
    ignore_changes = [app_settings]
  }
}

output "backend_testing_url" {
  description = "URL HTTPS asignada al backend de Testing."
  value       = "https://${azurerm_linux_web_app.backend_testing.default_hostname}"
}

output "backend_testing_app_name" {
  description = "Aplicación que recibe el artefacto del backend de Testing."
  value       = azurerm_linux_web_app.backend_testing.name
}
