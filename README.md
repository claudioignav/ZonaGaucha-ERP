# <img src="docs/imagenes/logo-zona-gaucha.jpeg" alt="Logo de Zona Gaucha" width="40" height="40"> Zona Gaucha ERP

El presente proyecto se desarrolló entre marzo y noviembre de 2026 y consiste en un sistema web ERP con enfoque DevSecOps para la empresa Zona Gaucha Chile.

El sistema centraliza las ventas, compras e inventario de la empresa para consultar los registros desde una misma plataforma. Incorpora ventas de plataformas externas, permite ingresar registros manuales y relaciona los movimientos con sus productos, proveedores y lotes. El enfoque DevSecOps incorpora controles de seguridad y calidad durante la integración y el despliegue del software.

## Acceso al entorno de staging

El entorno de preproducción está disponible para probar las funciones del sistema. Contiene datos de prueba y registros simulados para la demostración.

| Acceso | Administrador | Usuario |
| --- | --- | --- |
| URL | [Abrir el sistema en staging](https://zgerpfrontstg.z15.web.core.windows.net) | [Abrir el sistema en staging](https://zgerpfrontstg.z15.web.core.windows.net) |
| Correo | `administradorprueba@gmail.com` | `usuarioprueba@gmail.com` |
| Contraseña | `proyectodetitulo2026` | `proyectodetitulo2026` |

## Arquitectura DevSecOps

La arquitectura organiza el proceso de desarrollo en capas de control de versiones, integración continua, seguridad del código, infraestructura como código, despliegue continuo, análisis dinámico y monitoreo. Cada capa reúne las herramientas que permiten revisar, publicar y observar los cambios del sistema.

![Arquitectura DevSecOps por capas](docs/imagenes/arquitectura/arquitectura-devsecops-capas.png)

## Modelo arquitectónico con enfoque DevSecOps

La aplicación utiliza Angular para la interfaz, Express para la lógica de negocio y Azure SQL para almacenar los datos. El backend mantiene una estructura monolítica organizada en rutas, controladores y modelos. En Azure, el frontend se publica en Storage y el backend en App Service, con entornos de preproducción y producción.

![Modelo arquitectónico con enfoque DevSecOps](docs/imagenes/arquitectura/diseno-devsecops.png)

Las arquitecturas física, lógica y DevSecOps se presentan en el README de documentación.

## Pipelines

El flujo general conecta los cambios del repositorio con la integración y el despliegue continuo. Una vez aprobadas las pruebas de CI se publica el artefacto, se despliega en preproducción, se ejecutan las pruebas dinámicas y se continúa hacia producción. Las comprobaciones de disponibilidad permiten detectar errores de despliegue y volver a la versión anterior.

![Flujo general de los pipelines](docs/imagenes/devsecops/pipelines-general.png)

## Pipeline de integración continua

El frontend y el backend cuentan con workflows propios en GitHub Actions. El pipeline DevSecOps revisa la exposición de credenciales con GitGuardian, analiza dependencias con Snyk, ejecuta pruebas con cobertura y realiza el análisis estático con SonarCloud. El resultado del análisis debe cumplir el quality gate antes de publicar el artefacto.

| Componente | Ejecuciones y jobs | Definición |
| --- | --- | --- |
| Frontend | [CI del frontend](https://github.com/claudioignav/ZonaGaucha-ERP/actions/workflows/frontend-ci-devsecops.yml) | [Workflow](.github/workflows/frontend-ci-devsecops.yml) |
| Backend | [CI del backend](https://github.com/claudioignav/ZonaGaucha-ERP/actions/workflows/backend-ci-devsecops.yml) | [Workflow](.github/workflows/backend-ci-devsecops.yml) |

![Flujo del pipeline de integración continua](docs/imagenes/devsecops/integracion-continua.png)

Al abrir una ejecución en Actions se pueden consultar sus jobs, duración y registros.

Como ejemplo, esta [ejecución del CI del frontend](https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/44601961348) muestra los cuatro jobs del análisis DevSecOps.

## Pipeline de despliegue continuo

El pipeline obtiene el artefacto aprobado, analiza la configuración Terraform con Trivy y despliega en preproducción. Luego ejecuta pruebas dinámicas con OWASP ZAP y continúa hacia producción. También comprueba la disponibilidad de la versión desplegada y contempla volver a la anterior ante errores de despliegue.

| Componente | Ejecuciones y jobs | Definición |
| --- | --- | --- |
| Frontend | [CD del frontend](https://github.com/claudioignav/ZonaGaucha-ERP/actions/workflows/frontend-cd-devsecops.yml) | [Workflow](.github/workflows/frontend-cd-devsecops.yml) |
| Backend | [CD del backend](https://github.com/claudioignav/ZonaGaucha-ERP/actions/workflows/backend-cd-devsecops.yml) | [Workflow](.github/workflows/backend-cd-devsecops.yml) |

![Flujo del pipeline de despliegue continuo](docs/imagenes/devsecops/despliegue-continuo.png)

Esta [ejecución del CD del frontend](https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/44602510981) permite consultar el análisis de infraestructura, el despliegue en preproducción, DAST y la publicación en producción.

## Experimentación del enfoque DevSecOps

La validación comparó un pipeline DevOps reducido con uno DevSecOps mediante cinco escenarios experimentales. Se evaluaron la detección de problemas de seguridad y calidad, los tiempos de entrega y la recuperación frente a despliegues defectuosos.

![Comparación del despliegue continuo en DevOps y DevSecOps](docs/imagenes/devsecops/comparacion-despliegue.png)

| Escenario | Ramas de los casos experimentales |
| --- | --- |
| Seguridad | [test/e2-seguridad](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e2-seguridad) |
| Entrega | [DevOps](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e4-entrega-devops) y [DevSecOps](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e4-entrega-devsecops) |
| Mantenibilidad | [test/e1-mantenibilidad](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e1-mantenibilidad) |
| Fiabilidad y calidad de pruebas | [Regresión](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e3-regresion), [cobertura](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e3-cobertura) y [corrección](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e3-correccion) |
| Estabilidad | [test/e5-estabilidad](https://github.com/claudioignav/ZonaGaucha-ERP/tree/test/e5-estabilidad) |

| Pipeline evaluado | Integración continua | Despliegue continuo |
| --- | --- | --- |
| DevOps | Pruebas y preparación del artefacto. [Frontend](.github/workflows/frontend-ci-devops.yml) y [backend](.github/workflows/backend-ci-devops.yml). | Publicación en pruebas. [Frontend](.github/workflows/frontend-cd-devops.yml) y [backend](.github/workflows/backend-cd-devops.yml). |
| DevSecOps | Secretos, dependencias, pruebas, cobertura y análisis estático. [Frontend](.github/workflows/frontend-ci-devsecops.yml) y [backend](.github/workflows/backend-ci-devsecops.yml). | Análisis de infraestructura, preproducción, DAST y producción. [Frontend](.github/workflows/frontend-cd-devsecops.yml) y [backend](.github/workflows/backend-cd-devsecops.yml). |


En esta comparación, DevOps despliega en el entorno de pruebas. DevSecOps recorre preproducción, análisis dinámico y producción. La cantidad de entornos forma parte de la configuración evaluada y debe considerarse al comparar los tiempos de entrega.

## Stack tecnológico

| Componente | Tecnología | Uso |
| --- | --- | --- |
| Frontend | Angular 21 y TypeScript | Interfaz web y organización de los módulos. |
| Interfaz y estilos | Angular Material, Tailwind CSS y SCSS | Componentes visuales y presentación de las pantallas. |
| Backend | Node.js y Express 5 | API HTTP y procesamiento de las operaciones del ERP. |
| Acceso a datos | Sequelize y Tedious | Modelos, relaciones y conexión con SQL Server. |
| Base de datos | Azure SQL | Almacenamiento de cuentas, catálogos, compras, ventas e inventario. |
| Autenticación | JWT y bcrypt | Sesiones de usuario y protección de contraseñas mediante hash. |
| Alojamiento | Azure Blob Storage y App Service | Publicación del frontend y ejecución del backend. |
| Integraciones | APIs externas | Consulta e importación de ventas de las plataformas configuradas. |

## Herramientas

| Herramienta | Uso en el proyecto |
| --- | --- |
| Git y GitHub | Control de versiones, ramas y revisión de cambios mediante pull requests. |
| GitHub Actions | Ejecución de los pipelines de integración y despliegue continuo. |
| GitGuardian | Detección de credenciales y secretos expuestos en el código. |
| Snyk | Análisis de vulnerabilidades conocidas en las dependencias. |
| SonarCloud | Análisis estático, cobertura y evaluación del quality gate. |
| Jest y Supertest | Pruebas del backend y de sus rutas HTTP. |
| Vitest | Pruebas del frontend mediante Angular CLI. |
| Terraform | Definición y gestión de la infraestructura de Azure. |
| Trivy | Análisis de seguridad de la configuración de infraestructura. |
| OWASP ZAP | Pruebas dinámicas de seguridad en preproducción. |
| Grafana y Azure Monitor | Visualización de métricas y seguimiento del funcionamiento del sistema. |

## Prácticas de desarrollo

Los cambios se organizan en ramas y se integran mediante pull requests. El frontend y el backend mantienen sus propias pruebas y pipelines, lo que permite revisar cada componente antes de publicar una versión.

| Práctica | Aplicación |
| --- | --- |
| Pruebas automatizadas | Ejecución de pruebas y generación de reportes de cobertura en CI. |
| Controles DevSecOps | Revisión de secretos, dependencias, código e infraestructura, junto con pruebas dinámicas. |
| Infraestructura como código | Configuraciones Terraform separadas por entorno y componente. |
| Separación de entornos | Pruebas para la comparación DevOps y preproducción y producción para DevSecOps. |
| Gestión de credenciales | Variables de entorno y secretos de GitHub, con autenticación OIDC hacia Azure. |
| Control de acceso | Autenticación y permisos comprobados desde el backend. |
| Verificación y recuperación | Comprobación de la versión desplegada y recuperación de la anterior ante errores de despliegue. |

## Mantenimiento

El pipeline DevSecOps forma parte del sistema y se mantiene junto con el código. Para conservar sus controles al incorporar cambios se recomienda lo siguiente.

- **Respetar las reglas de subida de cambios.** Los cambios se trabajan en ramas y los commits siguen la convención del proyecto, con los prefijos feat, fix, test, style y refactor.
- **No subir cambios directamente a main.** Todo cambio llega a main mediante un pull request, para que el CI lo valide antes del despliegue.
- **Esperar que se completen los checks.** El pull request se integra solo cuando todos los checks del CI terminan correctamente.
- **No desactivar controles para que el pipeline pase.** Si GitGuardian, Snyk, SonarCloud, Trivy u OWASP ZAP detienen un cambio, se corrige la causa en el código o en la configuración. Quitar un job, bajar un umbral o saltarse el quality gate elimina la protección que entrega el pipeline.
- **Revisar los falsos positivos.** Una herramienta puede marcar algo que no representa un riesgo real. Antes de omitirlo se comprueba el hallazgo y, si corresponde, la excepción se registra en la configuración de la herramienta con un comentario que explique el motivo, como el trivy:ignore del Storage.
- **Agregar prácticas cuando el sistema lo requiera.** El pipeline admite nuevos controles, por ejemplo pruebas de extremo a extremo o análisis de contenedores. Se incorporan como jobs adicionales sin reemplazar los existentes.
- **Actualizar las herramientas de forma explícita.** Las acciones de GitHub están fijadas a una versión exacta. Al actualizarlas se cambia esa versión y se revisa la ejecución completa del pipeline.
- **Usar [skip ci] solo en cambios de documentación.** Los cambios de código siempre pasan por el CI.
- **Modificar la infraestructura con Terraform.** Los cambios de Azure se realizan en infra/environments, para que queden versionados y Trivy los analice.
- **Analizar los incidentes.** Cuando un despliegue falla, el pipeline vuelve a la versión anterior y abre una Issue con la etiqueta incidente. La causa se revisa antes de volver a desplegar.

## Requerimientos funcionales

Los siguientes 24 requerimientos describen las funciones del sistema.

| Identificador | Nombre | Requerimiento |
| --- | --- | --- |
| RF‑01 | Inicio de sesión según rol | El sistema debe permitir el inicio de sesión mediante correo y contraseña, otorgando acceso al sistema según el rol de administrador o usuario |
| RF‑02 | Gestión de cuentas de usuario | El sistema debe permitir al administrador registrar, editar, eliminar y restaurar cuentas de usuario, asignando nombre, apellidos, correo, teléfono, contraseña y rol |
| RF‑03 | Sincronización de ventas externas | El sistema debe sincronizar las ventas de Mercado Libre y del sitio web oficial mediante sus APIs |
| RF‑04 | Carga automática de ventas | El sistema debe cargar en tiempo real los registros de ventas provenientes de la base de datos |
| RF‑05 | Registro manual de ventas | El sistema debe permitir el ingreso manual de ventas mediante llenado de formulario. |
| RF‑06 | Visualización del historial de ventas | El sistema debe mostrar el registro de ventas en formato de tabla, detallando el número de factura o boleta, nombre del cliente, fecha de venta, tipo de pago, plataforma, productos vendidos con su cantidad, valor neto y valor adicional |
| RF‑07 | Asociación de venta a lote | El sistema debe exigir en el formulario de registro que cada venta se asocie a un lote específico y a la lista de productos del lote |
| RF‑08 | Exportación del historial de compras | El sistema debe permitir exportar en formato PDF el historial de compras según los filtros aplicados |
| RF‑09 | Registro manual de compras | El sistema debe permitir el ingreso manual de compras de productos o accesorios mediante el llenado de formulario |
| RF‑10 | Trazabilidad de compra | El sistema debe exigir el ingreso del número de lote y proveedor asociado en cada compra |
| RF‑11 | Visualización del historial de compras | El sistema debe mostrar el registro de compras en formato de tabla, detallando el número de factura, proveedor, fecha de compra, tipo de pago, productos ingresados con su cantidad, compra bruta, impuesto y compra neta |
| RF‑12 | Cálculo automatizado de stock | El sistema debe calcular dinámicamente el stock disponible de cada producto en base a las compras y ventas registradas |
| RF‑13 | Actualización automatizada del inventario | El sistema debe aumentar el stock de productos disponible asociado a un lote al registrar una compra y descontarlo al registrar una venta |
| RF‑14 | Visualización del inventario actual | El sistema debe presentar el estado actual del inventario agrupado por lote, mostrando el número de lote, factura asociada, proveedor, tipo de contenido, fecha de creación y disponibilidad de productos |
| RF‑15 | Gestión de productos | El sistema debe permitir crear, visualizar, editar y eliminar productos, asociándolos a una categoría predefinida |
| RF‑16 | Gestión de proveedores | El sistema debe permitir crear, visualizar, editar y eliminar proveedores, registrando su razón social, RUT, teléfono y correo electrónico |
| RF‑17 | Gestión de tipos de pago | El sistema debe permitir crear, visualizar, editar y eliminar tipos de pago, registrando el nombre del tipo de pago |
| RF‑18 | Gestión de plataformas | El sistema debe permitir crear, visualizar, editar y eliminar plataformas, registrando el nombre de la plataforma y sus tipos de pago |
| RF‑19 | Gestión de tipos de contenido | El sistema debe permitir crear, visualizar, editar y eliminar tipos de contenido, registrando el nombre del tipo de contenido |
| RF‑20 | Gestión de categorías de producto | El sistema debe permitir crear, visualizar, editar y eliminar categorías de producto, registrando el nombre de la categoría |
| RF‑21 | Visualización de métricas clave | El sistema debe mostrar al administrador el total vendido, el total comprado y las utilidades acumuladas, junto con su variación porcentual respecto del mes anterior |
| RF‑22 | Gráfico de ventas por mes | El sistema debe mostrar un gráfico de líneas con el registro histórico anual, registrando el número de ventas por mes desde enero a la fecha |
| RF‑23 | Gráfico de ventas por plataforma | El sistema debe generar y mostrar un gráfico circular con la participación de canales de venta, registrando el porcentaje de ventas por plataforma |
| RF‑24 | Visualización de estadísticas empresariales | El sistema debe mostrar la cantidad de productos, cuentas activas, proveedores registrados y categorías de producto en el apartado de dashboard |

## Requerimientos no funcionales

Los siguientes 11 requerimientos describen las condiciones del sistema y los controles de los pipelines.

| Identificador | Nombre | Requerimiento |
| --- | --- | --- |
| RNF‑01 | Prevención de acceso indebido | El sistema debe suspender una cuenta de usuario durante 15 minutos tras 5 intentos fallidos consecutivos de inicio de sesión |
| RNF‑02 | Comunicación cifrada | El sistema debe transmitir toda la información entre el navegador y el servidor mediante HTTPS |
| RNF‑03 | Compatibilidad de navegadores | El sistema debe funcionar sin errores en las versiones más recientes de los navegadores Google Chrome, Safari y Microsoft Edge |
| RNF‑04 | Persistencia de sesión | El sistema debe mantener activa la sesión del usuario durante 30 días antes de exigir un nuevo inicio de sesión |
| RNF‑05 | Protección de rutas del sistema | El sistema debe rechazar toda solicitud a los módulos que no incluya una sesión válida, exceptuando el inicio de sesión |
| RNF‑06 | Detección de secretos | El pipeline de CI debe analizar el código fuente para detectar la exposición accidental de contraseñas, tokens y secretos |
| RNF‑07 | Análisis estático de código | El pipeline de CI debe ejecutar de forma obligatoria pruebas estáticas para la revisión del código fuente |
| RNF‑08 | Análisis de composición de software | El pipeline de CI debe incluir escaneos de composición de software para verificar de manera automática que ninguna librería o dependencia de terceros contenga vulnerabilidades conocidas |
| RNF‑09 | Análisis de seguridad de la infraestructura | El pipeline de CD debe analizar la configuración de infraestructura como código en busca de configuraciones vulnerables antes del despliegue |
| RNF‑10 | Pruebas dinámicas de seguridad | El pipeline de CD debe ejecutar pruebas dinámicas que simulen ataques sobre el entorno de preproducción |
| RNF‑11 | Monitoreo del sistema | El sistema debe exportar métricas de rendimiento y disponibilidad hacia un panel de visualización centralizado |

## Organización del repositorio

```text
ZonaGaucha-ERP/
├── README.md
├── frontend/                    Interfaz Angular
│   ├── README.md
│   ├── public/                  Configuración pública de la API
│   └── src/
│       ├── app/
│       │   ├── components/      Componentes compartidos
│       │   ├── models/          Modelos de datos
│       │   ├── pages/           Pantallas de los módulos
│       │   ├── pipes/           Transformación de valores
│       │   ├── services/        Comunicación con el backend
│       │   └── validators/      Validaciones de formularios
│       └── assets/              Imágenes e iconos
├── backend/                     API Express
│   ├── README.md
│   ├── config/                  Configuración del entorno y seguridad
│   ├── controllers/             Procesamiento de las operaciones
│   ├── middleware/              Autenticación, permisos y validaciones
│   ├── models/                  Modelos y relaciones de la base de datos
│   ├── routes/                  Rutas de la API
│   ├── tests/                   Pruebas automatizadas
│   └── utils/                   Funciones de apoyo e integraciones
├── infra/
│   ├── README.md
│   └── environments/
│       ├── testing/             Entorno de pruebas de DevOps
│       ├── staging/             Entorno de preproducción de DevSecOps
│       └── production/          Entorno de producción
├── docs/
│   ├── README.md
│   └── imagenes/
│       ├── arquitectura/
│       ├── base-de-datos/
│       ├── devsecops/
│       └── sistema/
└── .github/
    ├── scripts/                 Verificación y recuperación de despliegues
    └── workflows/               Pipelines de CI y CD
```

| Carpeta | Contenido |
| --- | --- |
| [frontend](frontend/README.md) | Interfaz Angular, configuración y pruebas. |
| [backend](backend/README.md) | API Express, conexión a la base de datos e integraciones de ventas. |
| [infra](infra/README.md) | Infraestructura de Azure definida mediante Terraform. |
| [docs](docs/README.md) | Arquitecturas, base de datos y diagramas del sistema. |
| [.github/workflows](.github/workflows) | Workflows de integración y despliegue de ambos componentes. |

Para obtener el proyecto se clona el repositorio y luego se siguen las instrucciones de instalación del backend y del frontend.

```bash
git clone https://github.com/claudioignav/ZonaGaucha-ERP.git
cd ZonaGaucha-ERP
```
