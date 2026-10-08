# Consultamos el servidor existente. No lo importamos ni cambiamos sus permisos.
data "azurerm_mssql_server" "existing" {
  name                = var.existing_sql_server_name
  resource_group_name = data.azurerm_resource_group.main.name
}

# AzureRM 5.7.0 no expone useFreeLimit; AzAPI lo envía desde la primera creación.
# Así no creamos primero una base de pago para modificarla después.
resource "azapi_resource" "backend_staging_database" {
  type      = "Microsoft.Sql/servers/databases@2025-01-01"
  name      = var.backend_staging_database_name
  parent_id = data.azurerm_mssql_server.existing.id
  location  = data.azurerm_mssql_server.existing.location

  body = {
    sku = {
      name     = "GP_S_Gen5"
      tier     = "GeneralPurpose"
      family   = "Gen5"
      capacity = 2
    }

    properties = {
      # Se crea vacía: no copia ni restaura información de producción.
      createMode = "Default"
      collation  = "SQL_Latin1_General_CP1_CI_AS"

      maxSizeBytes   = 34359738368
      minCapacity    = 0.5
      autoPauseDelay = 60

      # Si termina la cuota mensual, se pausa; no se habilitan cargos por excedentes.
      useFreeLimit                     = true
      freeLimitExhaustionBehavior      = "AutoPause"
      requestedBackupStorageRedundancy = "Local"
      licenseType                      = "LicenseIncluded"
      readScale                        = "Disabled"
      zoneRedundant                    = false
    }
  }

  response_export_values = [
    "properties.useFreeLimit",
    "properties.freeLimitExhaustionBehavior",
    "properties.status",
  ]

  tags = merge(var.tags, {
    environment = "staging"
    component   = "database"
  })

  lifecycle {
    prevent_destroy = true
  }
}
