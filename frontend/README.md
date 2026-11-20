# Frontend

El frontend se desarrolló con Angular 21 y TypeScript. Presenta los módulos de ventas, compras, inventario, catálogos y cuentas, junto con el dashboard de indicadores. La información se obtiene desde la API del backend y las opciones disponibles dependen del rol y los permisos de la sesión.

## Instalación y configuración

| Requisito | Detalle |
| --- | --- |
| Node.js | 24 LTS, con npm incluido |
| Backend | En ejecución para iniciar sesión y consultar datos |

```bash
cd frontend
npm ci
npm start
```

| Comando | Uso |
| --- | --- |
| `npm ci` | Instala las dependencias según `package-lock.json`. |
| `npm start` | Inicia la aplicación en modo de desarrollo. |
| `npm run build:production` | Genera los archivos para publicar en `dist/erp-frontend/browser/`. |
| `npm run test:ci` | Ejecuta las pruebas con Vitest y genera la cobertura en `coverage/`. |

La cobertura generada se utiliza en el análisis de calidad del pipeline.

## Conexión con el backend

La dirección de la API se define en `public/config.js`. En Azure, los workflows de despliegue escriben en ese archivo la URL del backend correspondiente a cada entorno.

## Estructura de carpetas

```text
frontend/
├── README.md
├── public/                   Archivos públicos y configuración de la API
├── scripts/                  Scripts de apoyo
└── src/
    ├── app/
    │   ├── components/       Componentes compartidos
    │   ├── models/           Modelos de datos
    │   ├── pages/            Pantallas de los módulos
    │   ├── pipes/            Transformación de valores
    │   ├── services/         Consultas a la API y sesión
    │   └── validators/       Validaciones de formularios
    └── assets/
        ├── icons/            Iconos de la interfaz
        └── img/              Imágenes de la aplicación
```

## Mantenimiento

Para incorporar cambios en el frontend se recomienda lo siguiente.

- **Respetar la organización de carpetas.** Las pantallas van en pages, los componentes reutilizables en components, las llamadas a la API en services, las interfaces en models, los formatos en pipes y las reglas de los formularios en validators.
- **Consultar la API solo desde los servicios.** Las páginas obtienen los datos mediante los servicios y no construyen direcciones propias. La URL base se toma de public/config.js.
- **Proteger las pantallas nuevas.** Cada ruta se agrega en app-routing-module.ts con sus guards. Los permisos de models/permisos.ts deben coincidir con los del backend.
- **Incluir pruebas unitarias.** Cada archivo nuevo lleva su archivo .spec.ts en la misma carpeta y la cobertura debe superar el 80 %.
- **Ejecutar las pruebas antes de subir cambios.** npm run test:ci debe terminar sin errores antes de abrir el pull request.

[Volver al proyecto](../README.md)
