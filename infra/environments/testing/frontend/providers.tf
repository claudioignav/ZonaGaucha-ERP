terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.4"
    }
  }

  backend "azurerm" {
    resource_group_name  = "zg-erp"
    storage_account_name = "zgerpfrontstg"
    container_name       = "tfstate"
    key                  = "frontend-testing.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "main" {
  name = "zg-erp"
}
