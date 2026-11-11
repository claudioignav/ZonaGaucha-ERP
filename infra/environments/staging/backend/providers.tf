provider "azurerm" {
  subscription_id = var.azure_subscription_id

  features {}
}

provider "azapi" {
  subscription_id = var.azure_subscription_id
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}
