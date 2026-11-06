# Casos E1.5 y E1.6 Composición de software

## Casos preparados

| Caso | Categoría | Cambio experimental |
|---|---|---|
| E1.5 | Composición de software | Incorporar `lodash@4.17.20` como dependencia del backend, con vulnerabilidades altas documentadas. |
| E1.6 | Composición de software | Incorporar `jsonpath-plus@10.0.0` como dependencia del backend, con vulnerabilidades críticas documentadas. |

Se fijan ambas versiones exactamente en `backend/package.json` y se actualiza `backend/package-lock.json` para que ambos CI instalen la misma composición. Cada dependencia puede producir varios hallazgos. No se presupone que dos dependencias equivalgan a dos vulnerabilidades.

Las bibliotecas se incorporan al inventario de dependencias de producción del backend para evaluar su detección por SCA. No se agregan llamadas a ellas desde la aplicación ni se ejecutan sus vulnerabilidades. Esta prueba no demuestra alcanzabilidad o explotación de las funciones afectadas.

## Aislamiento respecto de credenciales

Antes de preparar este cambio se retiran los dos archivos de la fase anterior: `backend/config/conexionReporte.js` y `backend/config/claveReporte.pem`. Se conserva el registro de sus resultados en `e1-credenciales.md`.

La referencia sin exposiciones es `6967b089efd5d32579ab78040c639edfac7cff0e`, publicada en `feature/pipelines`. En esa referencia aprobaron los workflows completos y reducidos del frontend y del backend. El paso de Sonar no se ejecuta en estos pushes, por su condición existente, y no se interpreta como una revisión estática aprobada.

Se mantiene `@azure/identity@4.14.1` y su dependencia corregida `open@11.0.4`. Esa actualización evita introducir de nuevo el hallazgo preexistente `SNYK-JS-OPEN-22112123` que se corrigió antes de estas pruebas.

## Comparación que se realizará

El mensaje propuesto para el commit es `test: incorporar dependencias con vulnerabilidades conocidas`.

Ambos workflows del backend deben ejecutar el mismo commit y evento `push`, con un nuevo rango respecto del commit anterior:

1. En el CI completo, el job de secretos debe poder avanzar sin los archivos de credenciales de la fase anterior.
2. Snyk debe analizar el manifiesto y el lockfile y reportar los hallazgos altos o críticos correspondientes a las dependencias incorporadas. El umbral existente es `high`.
3. El CI reducido debe ejecutar las pruebas, registrar cobertura y empaquetar el backend con esas mismas dependencias. No ejecuta SCA ni usa los nombres de los checks de seguridad requeridos.

Se registrarán las versiones, identificadores de los avisos, severidades, rutas de dependencia, SHA, rango y enlaces de ambas ejecuciones. No se cuenta como detección un error de autenticación, del scanner o de instalación. Tampoco se interpreta la ausencia de SCA en el reducido como cero vulnerabilidades.

Al analizar un PR o todo el historial pueden volver a aparecer las credenciales de los commits anteriores. Para esta comparación se debe verificar el rango del nuevo push; no deben ignorarse hallazgos ni atribuir un hallazgo histórico de credenciales a la composición.

## Estado

Esta fase se publica en `test/e1-seguridad` por indicación del usuario. Los cambios preparados no constituyen resultados de Snyk; sus resultados deben registrarse después de la ejecución del CI. Los umbrales, las exclusiones y los workflows de despliegue permanecen iguales. La rama experimental no debe integrarse ni desplegarse en producción con estas dependencias.

## Fuentes de las versiones seleccionadas

- https://security.snyk.io/package/npm/lodash/4.17.20
- https://security.snyk.io/package/npm/jsonpath-plus/10.0.0
