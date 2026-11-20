provider "azurerm" {
  subscription_id = var.azure_subscription_id

  features {}
}

# azapi permite pedir la oferta gratuita de sql desde la creacion
provider "azapi" {
  subscription_id = var.azure_subscription_id
}

# grupo de recursos existente, no se administra desde terraform
data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}
