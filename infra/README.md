# Infraestructura

El sistema utiliza servicios de Microsoft Azure para publicar la interfaz, ejecutar la API y almacenar los datos. Los recursos se distribuyen en tres entornos, pruebas, preproducción y producción. La infraestructura se describe mediante Terraform y se organiza por entorno y componente.

## Estructura de carpetas

```text
infra/
├── README.md
└── environments/
    ├── testing/              Entorno de pruebas del pipeline DevOps
    │   ├── frontend/         Storage del frontend
    │   └── backend/          App Service y plan de ejecución
    ├── staging/              Entorno de preproducción de DevSecOps
    │   ├── frontend/         Storage del frontend
    │   └── backend/          App Service, plan y base de preproducción
    └── production/           Entorno de producción de DevSecOps
        ├── frontend/         Storage del frontend
        └── backend/          App Service y plan de producción
```

## Entornos

| Entorno | Función |
| --- | --- |
| Pruebas, `testing` | Recibir los despliegues del pipeline DevOps durante la experimentación. |
| Preproducción, `staging` | Validar la versión desplegada por DevSecOps y ejecutar las pruebas dinámicas antes de producción. Contiene datos de prueba. |
| Producción, `production` | Publicar la versión final del sistema después del recorrido del pipeline DevSecOps. |

Cada entorno tiene su propia cuenta de Storage y su propia aplicación y plan de App Service. Pruebas y preproducción comparten `sqldb-zonagaucha-stg`. Producción utiliza `sqldb-zonagaucha`, separada de los datos de prueba.

## Servicios de Azure

### Blob Storage

El frontend Angular se publica como sitio web estático. Storage almacena los archivos HTML, JavaScript, estilos e imágenes generados por la compilación y los sirve al navegador mediante HTTPS.

| Entorno | Cuenta de Storage |
| --- | --- |
| Pruebas | `zgerpfronttest` |
| Preproducción | `zgerpfrontstg` |
| Producción | `zgerpfrontapp` |

### App Service

El backend Express se ejecuta en App Service para Linux con Node.js. Cada entorno dispone de un plan B1 independiente y de una aplicación que procesa las solicitudes de la API.

| Entorno | Aplicación | Plan |
| --- | --- | --- |
| Pruebas | `zgerpbacktest` | `service-zg-test` |
| Preproducción | `zgerpbackstg` | `service-zg-stg` |
| Producción | `zgerpbacktapp` | `service-zg` |

### Azure SQL

Las bases de datos se alojan en el servidor `zg-dbserver`. Almacenan las cuentas de usuario, los catálogos y los movimientos de compras, ventas e inventario. El backend utiliza conexiones cifradas para acceder a la información.

| Base de datos | Entornos |
| --- | --- |
| `sqldb-zonagaucha-stg` | Pruebas y preproducción. |
| `sqldb-zonagaucha` | Producción. |

### Monitoreo

Azure Monitor permite consultar el estado y las métricas de los recursos de Azure. Grafana reúne los paneles de seguimiento del sistema. El backend también exporta métricas mediante `/metrics`.

[Proyecto](../README.md) · [Arquitecturas y base de datos](../docs/README.md)
