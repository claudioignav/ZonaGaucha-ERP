import {
  to = azurerm_storage_account.frontend_production
  id = "/subscriptions/${var.azure_subscription_id}/resourceGroups/${var.resource_group_name}/providers/Microsoft.Storage/storageAccounts/${var.frontend_production_storage_account_name}"
}

import {
  to = azurerm_storage_account_static_website.frontend_production
  id = "/subscriptions/${var.azure_subscription_id}/resourceGroups/${var.resource_group_name}/providers/Microsoft.Storage/storageAccounts/${var.frontend_production_storage_account_name}"
}
