terraform {
  backend "azurerm" {
    container_name   = "tfstate"
    key              = "frontend-staging.tfstate"
    use_azuread_auth = true
  }
}
