terraform {
  backend "azurerm" {
    container_name   = "tfstate"
    key              = "backend-staging.tfstate"
    use_azuread_auth = true
  }
}
