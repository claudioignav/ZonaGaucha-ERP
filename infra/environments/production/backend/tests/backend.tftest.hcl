# estas pruebas usan un proveedor simulado: no se conectan a Azure ni crean recursos
mock_provider "azurerm" {}
mock_provider "azapi" {}

override_data {
  target = data.azurerm_resource_group.main
  values = {
    name     = "zg-erp"
    location = "brazilsouth"
  }
}

variables {
  azure_subscription_id = "00000000-0000-0000-0000-000000000000"
}

run "comprobar_plan_y_aplicacion" {
  command = plan

  assert {
    condition = (
      azurerm_service_plan.backend_production.sku_name == "B1" &&
      azurerm_service_plan.backend_production.worker_count == 1 &&
      azurerm_service_plan.backend_production.name == "service-zg" &&
      azurerm_linux_web_app.backend_production.name == "zgerpbacktapp"
    )
    error_message = "El ambiente debe usar una instancia B1 y los nombres esperados."
  }

  assert {
    condition = (
      azurerm_linux_web_app.backend_production.site_config[0].always_on &&
      azurerm_linux_web_app.backend_production.https_only &&
      !azurerm_linux_web_app.backend_production.webdeploy_publish_basic_authentication_enabled &&
      !azurerm_linux_web_app.backend_production.ftp_publish_basic_authentication_enabled
    )
    error_message = "La aplicación debe conservar su configuración de Always On, HTTPS y publicación."
  }

  assert {
    condition     = azurerm_linux_web_app.backend_production.app_settings["APP_ENV"] == "production"
    error_message = "La aplicación debe identificar su propio entorno."
  }
}
