# Estas pruebas usan un proveedor simulado: no se conectan a Azure ni crean recursos.
mock_provider "azurerm" {}
mock_provider "azapi" {}

override_data {
  target = data.azurerm_resource_group.main
  values = {
    name     = "zg-erp"
    location = "brazilsouth"
  }
}

override_data {
  target = data.azurerm_mssql_server.existing
  values = {
    id                          = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/zg-erp/providers/Microsoft.Sql/servers/zg-dbserver"
    name                        = "zg-dbserver"
    location                    = "brazilsouth"
    fully_qualified_domain_name = "zg-dbserver.database.windows.net"
  }
}

variables {
  azure_subscription_id = "00000000-0000-0000-0000-000000000000"
}

run "comprobar_planes_y_aplicaciones" {
  command = plan

  assert {
    condition = (
      azurerm_service_plan.backend_production.sku_name == "B1" &&
      azurerm_service_plan.backend_production.worker_count == 1 &&
      azurerm_service_plan.backend_staging.sku_name == "F1"
    )
    error_message = "Producción debe usar una instancia B1 y preproducción debe mantenerse en F1 gratuito."
  }

  assert {
    condition = (
      azurerm_service_plan.backend_production.name == "service-zg" &&
      azurerm_service_plan.backend_staging.name == "service-zg-stg" &&
      azurerm_linux_web_app.backend_production.name == "zgerpbacktapp" &&
      azurerm_linux_web_app.backend_staging.name == "zgerpbackstg"
    )
    error_message = "Los nombres predeterminados deben coincidir con los recursos solicitados."
  }

  assert {
    condition = (
      azurerm_linux_web_app.backend_production.site_config[0].always_on &&
      !azurerm_linux_web_app.backend_staging.site_config[0].always_on
    )
    error_message = "Always On debe estar activo en B1 y desactivado en F1."
  }

  assert {
    condition = (
      azurerm_linux_web_app.backend_production.https_only &&
      azurerm_linux_web_app.backend_staging.https_only &&
      !azurerm_linux_web_app.backend_production.webdeploy_publish_basic_authentication_enabled &&
      !azurerm_linux_web_app.backend_staging.ftp_publish_basic_authentication_enabled
    )
    error_message = "Las aplicaciones deben exigir HTTPS y no habilitar publicación por autenticación básica."
  }

  assert {
    condition = (
      azurerm_linux_web_app.backend_production.app_settings["APP_ENV"] == "production" &&
      azurerm_linux_web_app.backend_staging.app_settings["APP_ENV"] == "staging"
    )
    error_message = "Cada aplicación debe identificar su entorno sin compartir configuración de SQL."
  }
}

run "comprobar_base_de_preproduccion" {
  command = plan

  assert {
    condition = (
      azapi_resource.backend_staging_database.name == "sqldb-zonagaucha-stg" &&
      azapi_resource.backend_staging_database.parent_id == data.azurerm_mssql_server.existing.id &&
      azapi_resource.backend_staging_database.location == "brazilsouth" &&
      azapi_resource.backend_staging_database.body.properties.createMode == "Default"
    )
    error_message = "La base debe crearse vacía en el servidor existente, sin copiar producción."
  }

  assert {
    condition = (
      azapi_resource.backend_staging_database.body.properties.useFreeLimit &&
      azapi_resource.backend_staging_database.body.properties.freeLimitExhaustionBehavior == "AutoPause" &&
      azapi_resource.backend_staging_database.body.properties.requestedBackupStorageRedundancy == "Local" &&
      azapi_resource.backend_staging_database.body.properties.maxSizeBytes == 34359738368
    )
    error_message = "La base debe solicitar la oferta gratuita, backups locales y pausa al agotar la cuota."
  }

  assert {
    condition = (
      azapi_resource.backend_staging_database.body.sku.capacity == 2 &&
      azapi_resource.backend_staging_database.body.properties.minCapacity == 0.5 &&
      azapi_resource.backend_staging_database.body.properties.autoPauseDelay == 60
    )
    error_message = "La base debe usar serverless de 0.5 a 2 vCores y pausa por inactividad de 60 minutos."
  }
}

run "rechazar_nombre_de_produccion" {
  command = plan

  variables {
    backend_staging_database_name = "sqldb-zonagaucha"
  }

  expect_failures = [var.backend_staging_database_name]
}
