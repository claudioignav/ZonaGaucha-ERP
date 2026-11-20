# plan linux b1 del backend de preproduccion
resource "azurerm_service_plan" "backend_staging" {
  name                = var.backend_staging_plan_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.backend_staging_location
  os_type             = "Linux"
  sku_name            = "B1"
  worker_count        = 1

  tags = merge(var.tags, {
    environment = "staging"
    component   = "backend"
  })
}

# backend en app service, solo https y tls 1.2
resource "azurerm_linux_web_app" "backend_staging" {
  name                = var.backend_staging_app_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = azurerm_service_plan.backend_staging.location
  service_plan_id     = azurerm_service_plan.backend_staging.id

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
    app_command_line        = var.backend_startup_command

    application_stack {
      node_version = var.backend_node_version
    }

    cors {
      allowed_origins     = var.frontend_staging_origins
      support_credentials = false
    }
  }

  # usa NODE_ENV=production para que preproduccion se comporte igual que produccion
  app_settings = {
    NODE_ENV = "production"
    APP_ENV  = "staging"
  }

  tags = merge(var.tags, {
    environment = "staging"
    component   = "backend"
  })

  lifecycle {
    ignore_changes = [app_settings]
  }
}
