-- columnas para suspender la cuenta tras intentos fallidos de inicio de sesion
-- ejecutar en cada base (testing, preproduccion y produccion) antes de desplegar el backend
IF COL_LENGTH('dbo.usuario', 'intentos_fallidos') IS NULL
  ALTER TABLE dbo.usuario
    ADD intentos_fallidos INT NOT NULL
      CONSTRAINT DF_usuario_intentos_fallidos DEFAULT 0;

IF COL_LENGTH('dbo.usuario', 'bloqueado_hasta') IS NULL
  ALTER TABLE dbo.usuario
    ADD bloqueado_hasta DATETIMEOFFSET NULL;
