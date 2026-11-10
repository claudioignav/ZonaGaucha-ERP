# Producción usa un plan propio, separado del de preproducción.
resource "azurerm_service_plan" "backend_production" {
  name                = var.backend_production_plan_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.backend_production_location
  os_type             = "Linux"
  sku_name            = "B1"
  worker_count        = 1

  tags = merge(var.tags, {
    environment = "production"
    component   = "backend"
  })

  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_linux_web_app" "backend_production" {
  name                = var.backend_production_app_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = azurerm_service_plan.backend_production.location
  service_plan_id     = azurerm_service_plan.backend_production.id

  https_only                                     = true
  ftp_publish_basic_authentication_enabled       = false
  webdeploy_publish_basic_authentication_enabled = false

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on               = true
    ftps_state              = "Disabled"
    minimum_tls_version     = "1.2"
    scm_minimum_tls_version = "1.2"
    http2_enabled           = true
    use_32_bit_worker       = false
    app_command_line        = var.backend_startup_command

    application_stack {
      node_version = var.backend_node_version
    }

    cors {
      allowed_origins     = var.frontend_production_origins
      support_credentials = false
    }
  }

  # No añadimos claves de SQL ni conectamos una base de datos sin configurarla.
  app_settings = {
    NODE_ENV = "production"
    APP_ENV  = "production"
  }

  tags = merge(var.tags, {
    environment = "production"
    component   = "backend"
  })

  lifecycle {
    prevent_destroy = true
  }
}
