# Backend

El backend se desarrolló con Node.js y Express 5. Expone la API del ERP, valida los permisos de acceso y procesa las compras, ventas e inventario. Utiliza Sequelize para acceder a Azure SQL y JWT para autenticar las solicitudes.

## Estructura de carpetas

```text
backend/
├── README.md
├── app.js                    Aplicación Express y registro de rutas
├── index.js                  Inicio del servidor y conexión SQL
├── assets/                   Recursos utilizados por el backend
├── config/                   Entorno, conexión y seguridad
├── controllers/              Procesamiento de las operaciones
├── middleware/               Autenticación, permisos y validaciones
├── models/                   Modelos y relaciones de Sequelize
├── routes/                   Rutas de la API
├── tests/                    Pruebas automatizadas
└── utils/
    └── integraciones/        Consulta e importación de ventas externas
```

## Instalación y configuración

| Requisito | Detalle |
| --- | --- |
| Node.js | 22 LTS, con npm incluido |
| Base de datos | Azure SQL del proyecto, con acceso autorizado |
| Configuración | Archivo `.env` creado a partir de `.env.example` |

```bash
cd backend
npm ci
npm start
```

| Comando | Uso |
| --- | --- |
| `npm ci` | Instala las dependencias según `package-lock.json`. |
| `npm start` | Inicia la API. |
| `npm test` | Ejecuta las pruebas. |
| `npm run test:ci` | Ejecuta las pruebas y genera el reporte de cobertura. |

### Variables de entorno

| Variable | Uso |
| --- | --- |
| `APP_ENV` | Entorno del backend, `staging` o `production`. |
| `DB_HOST`, `DB_PORT` y `DB_NAME` | Servidor, puerto y base de datos de Azure SQL. |
| `DB_USER` y `DB_PASS` | Cuenta de acceso a la base de datos. |
| `FRONT_URL` | Dirección del frontend autorizada para consultar la API. |
| `JWT_SECRET` y `JWT_EXPIRA` | Clave de firma y duración de las sesiones. |
| `METRICS_TOKEN` | Token para consultar las métricas de monitoreo. |
| `SHOPIFY_*` y `MERCADOLIBRE_*` | Credenciales de las plataformas de venta. Son opcionales. |

Las credenciales de la base, la clave de firma y los tokens se entregan de forma privada y no se publican en el repositorio. El backend se conecta a la base Azure SQL del proyecto y no crea una base propia.

## Rutas principales

| Ruta | Uso |
| --- | --- |
| `POST /auth/login` | Iniciar sesión. |
| `GET /auth/perfil` | Consultar el perfil de la sesión. |
| `/usuarios` | Administrar cuentas de usuario. Requiere rol administrador. |
| `/catalogos` | Administrar productos, proveedores, categorías, plataformas y tipos. |
| `/compras` | Consultar y registrar compras. |
| `GET /compras/pdf` | Exportar el historial de compras con sus filtros. |
| `/ventas` | Consultar y registrar ventas. |
| `POST /ventas/sincronizar` | Importar ventas de las plataformas configuradas. |
| `/inventario` | Consultar lotes y existencias. |
| `GET /dashboard` | Consultar indicadores y estadísticas. |
| `GET /estado/despliegue` | Consultar el estado y la versión desplegada. |
| `GET /metrics` | Exportar métricas en formato Prometheus. |

Las rutas de negocio requieren un JWT en el encabezado `Authorization: Bearer <token>` y validan los permisos correspondientes. `/metrics` utiliza su propia credencial, definida en `METRICS_TOKEN`.

## Pruebas

```bash
npm run test:ci
```

Jest ejecuta las pruebas y genera los reportes en `coverage/`. La configuración exige al menos un 80 % global en líneas, sentencias, funciones y ramas. El pipeline DevSecOps también envía la cobertura al análisis de SonarCloud.

El backend cuenta con **271 pruebas** distribuidas en **30 conjuntos de pruebas**. Se utiliza Jest y Supertest para comprobar las rutas HTTP, los permisos, las validaciones y las operaciones del sistema.

## Mantenimiento

Para incorporar cambios en el backend se recomienda lo siguiente.

- **Respetar la organización por capas.** Cada ruta de routes delega en un controlador de controllers. Las validaciones previas van en middleware, el acceso a datos en models y las funciones compartidas en utils.
- **Proteger las rutas nuevas.** Toda ruta, salvo el inicio de sesión, pasa por authenticateToken y declara su permiso con verifyPermiso. Los permisos de cada rol se definen en utils/permisos.js.
- **Incluir pruebas unitarias.** Cada cambio se acompaña de pruebas en la carpeta tests y la cobertura debe superar el 80 %.
- **Mantener alineados los modelos y la base.** Un cambio en una tabla de Azure SQL se refleja en su modelo de Sequelize.
- **Registrar las variables nuevas.** Se agregan en .env.example y en la configuración del App Service de cada entorno, sin publicar sus valores.

[Volver al proyecto](../README.md)
