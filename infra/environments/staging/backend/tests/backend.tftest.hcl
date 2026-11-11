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

run "comprobar_plan_y_aplicacion" {
  command = plan

  assert {
    condition = (
      azurerm_service_plan.backend_staging.sku_name == "B1" &&
      azurerm_service_plan.backend_staging.worker_count == 1 &&
      azurerm_service_plan.backend_staging.name == "service-zg-stg" &&
      azurerm_linux_web_app.backend_staging.name == "zgerpbackstg"
    )
    error_message = "El ambiente debe usar una instancia B1 y los nombres esperados."
  }

  assert {
    condition = (
      !azurerm_linux_web_app.backend_staging.site_config[0].always_on &&
      azurerm_linux_web_app.backend_staging.https_only &&
      !azurerm_linux_web_app.backend_staging.webdeploy_publish_basic_authentication_enabled &&
      !azurerm_linux_web_app.backend_staging.ftp_publish_basic_authentication_enabled
    )
    error_message = "La aplicación debe conservar su configuración de Always On, HTTPS y publicación."
  }

  assert {
    condition     = azurerm_linux_web_app.backend_staging.app_settings["APP_ENV"] == "staging"
    error_message = "La aplicación debe identificar su propio entorno."
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
      azapi_resource.backend_staging_database.body.properties.freeLimitExhaustionBehavior == "BillOverUsage" &&
      azapi_resource.backend_staging_database.body.properties.requestedBackupStorageRedundancy == "Local" &&
      azapi_resource.backend_staging_database.body.properties.maxSizeBytes == 34359738368
    )
    error_message = "La base debe solicitar la oferta gratuita, backups locales y cobro por excedentes."
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
