removed {
  from = azurerm_service_plan.backend_staging

  lifecycle {
    destroy = false
  }
}

removed {
  from = azurerm_linux_web_app.backend_staging

  lifecycle {
    destroy = false
  }
}

removed {
  from = azapi_resource.backend_staging_database

  lifecycle {
    destroy = false
  }
}
