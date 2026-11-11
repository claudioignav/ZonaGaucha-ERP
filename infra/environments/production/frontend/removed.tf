removed {
  from = azurerm_storage_account.frontend_staging

  lifecycle {
    destroy = false
  }
}

removed {
  from = azurerm_storage_account_static_website.frontend_staging

  lifecycle {
    destroy = false
  }
}
