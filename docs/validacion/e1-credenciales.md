# Casos E1.3 y E1.4 Exposición de credenciales

## Casos incluidos en el mismo cambio

| Caso | Categoría | Cambio experimental | Archivo |
|---|---|---|---|
| E1.3 | Credenciales | Exponer una contraseña simulada de la base de datos en el código del backend. | `backend/config/conexionReporte.js` |
| E1.4 | Credenciales | Exponer una clave privada de prueba en un archivo del backend. | `backend/config/claveReporte.pem` |

La contraseña corresponde a un usuario y host ficticios, sin una cuenta registrada. La clave RSA de 2048 bits fue generada exclusivamente para el experimento, sin asociación con un certificado, usuario o servicio real. Ninguno de estos archivos se importa desde la configuración operativa de la aplicación.

Se mantienen los valores de las pruebas preliminares para que el cambio sea su agrupación y la organización de los CI reducidos. No se consideran nuevos tipos de secreto ni se afirma que el scanner los desconozca.

## Rama y versión de referencia

La rama es `test/e1-seguridad`. Se reconstruye desde `main` y se integra por avance rápido la rama `feature/pipelines` actualizada.

La base es `6967b08`, que incluye:

- `d657fb5`: los CI reducidos del frontend y backend, cada uno con dos jobs. Primero pruebas y cobertura. Después compilación o empaquetado, con dependencia del primer job.
- La variable `GITHUB_PUSH_BASE_SHA` que utiliza ggshield 1.55.0 para determinar el rango de commits del push.
- La actualización de `@azure/identity` a `4.14.1`, con `open@11.0.4`, para conservar la corrección del hallazgo preexistente de Snyk.

Los nombres de los jobs exigidos por las reglas de `main` se conservan. Los jobs reducidos tienen nombres propios y no sustituyen esos controles.

## Comparación

Ambas exposiciones se incorporan en un solo commit con el mensaje `test: exponer credenciales simuladas en el backend`. El CI completo y el reducido del backend deben analizar el mismo SHA y evento `push`.

| Configuración | Resultado que se comprobará |
|---|---|
| CI completo | GitGuardian identifica ambos secretos y el job **Detección de secretos** bloquea la ejecución. |
| CI reducido | Los jobs de pruebas y cobertura, y de empaquetado, pueden aprobar pese a la presencia de los archivos. |

Si el job de secretos bloquea el CI completo, los jobs dependientes de SCA, pruebas y SAST quedan omitidos. Esa omisión no demuestra que esos análisis hayan aprobado.

Se registrarán los detectores, las ubicaciones, el rango de commits, los enlaces de ambas ejecuciones y las severidades mostradas por la herramienta. No se copiarán los valores completos de los secretos al informe. Un fallo de autenticación o del servicio del scanner no cuenta como detección.

La detección de un secreto y su validez operativa son resultados diferentes. Una clave de prueba sin un servicio asociado no demuestra acceso real, aunque su exposición sea detectada.

## Alcance de esta ejecución

Las ejecuciones individuales anteriores son evidencia preliminar y no deben mezclarse con los tiempos de esta ejecución conjunta. Un único pipeline con los dos casos no permite atribuir su duración completa a cada secreto por separado.

El tiempo de remediación definido en el informe requiere registrar y cerrar la Issue correspondiente. No se inventa ese intervalo a partir de los tiempos del pipeline.

Los workflows de CD siguen restringidos a `main`. Los artefactos del CI reducido son experimentales y no deben desplegarse. Los archivos simulados deberán retirarse al terminar la evaluación de credenciales.
