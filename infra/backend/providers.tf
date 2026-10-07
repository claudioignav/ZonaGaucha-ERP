provider "azurerm" {
  subscription_id = var.azure_subscription_id

  features {}
}

# AzAPI permite pedir la oferta gratuita de SQL desde la creación.
provider "azapi" {
  subscription_id = var.azure_subscription_id
}

# Usamos el grupo existente; no lo creamos ni administramos desde aquí.
data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}
