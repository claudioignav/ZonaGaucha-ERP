-- columnas y tabla para importar ventas desde shopify y mercado libre
-- ejecutar en cada base (preproduccion y produccion) antes de desplegar el backend
IF COL_LENGTH('dbo.venta', 'id_externo') IS NULL
  ALTER TABLE dbo.venta ADD id_externo NVARCHAR(40) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_venta_plataforma_id_externo')
  CREATE UNIQUE INDEX UX_venta_plataforma_id_externo
    ON dbo.venta (id_plataforma, id_externo)
    WHERE id_externo IS NOT NULL;
GO

IF OBJECT_ID('dbo.integracion', 'U') IS NULL
  CREATE TABLE dbo.integracion (
    plataforma NVARCHAR(30) NOT NULL CONSTRAINT PK_integracion PRIMARY KEY,
    refresh_token NVARCHAR(200) NULL,
    ultima_sincronizacion DATETIMEOFFSET NULL
  );
GO
