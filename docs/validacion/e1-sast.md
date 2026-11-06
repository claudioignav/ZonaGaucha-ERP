# Casos E1.1 y E1.2 Código fuente

| Caso | Categoría | Cambio experimental |
|---|---|---|
| E1.1 | Código fuente | Permitir que una petición HTTPS del backend acepte certificados no confiables. |
| E1.2 | Código fuente | Cifrar información simulada de un reporte del backend con el algoritmo débil Triple DES (`des-ede3-cbc`). |

Ambos casos se incorporan en un único commit sobre `test/e1-seguridad`, reconstruida desde `6967b089efd5d32579ab78040c639edfac7cff0e` de `feature/pipelines`. Esta historia excluye los commits experimentales de credenciales y composición. El manifiesto y el lockfile conservan la base corregida, y no se incluyen los archivos de credenciales simuladas.

## Implementación

E1.1 se encuentra en `backend/utils/solicitudReporte.js`. Prepara una petición HTTPS con `rejectUnauthorized: false`, que desactiva la validación del certificado del servidor. Se utiliza un destino reservado `.invalid` y la prueba simula `https.request`, sin acceder a la red ni modificar las conexiones reales de la aplicación.

E1.2 se encuentra en `backend/utils/cifradoReporte.js`. Recibe la clave como argumento y genera un IV aleatorio; el cambio deliberadamente inseguro es la selección del algoritmo. Las pruebas usan una clave efímera generada en memoria y contenido simulado. Esta función se ejercita desde las pruebas, sin integrarse al cifrado de datos reales.

Las pruebas funcionales verifican que se prepara la solicitud simulada del reporte y que se puede recuperar el contenido simulado cifrado. No abren conexiones a Azure ni ejecutan cargas de explotación. Que esas pruebas aprueben no demuestra seguridad.

## Ejecución y evidencia pendiente

Las reglas de referencia son `S4830` para validación del certificado y `S5547` para algoritmos de cifrado débiles. Ambos patrones se comprobaron localmente con SonarJS. La desactivación de la validación puede generar también `S5527` y el cifrado puede generar `S5542`, por lo que dos casos experimentales no equivalen necesariamente a dos hallazgos. La detección, la severidad y la clasificación efectiva en SonarCloud deben confirmarse en su análisis. No se asignan resultados anticipados ni se confunden vulnerabilidades con Security Hotspots.

El ensayo previo de TLS 1.0 se conserva como limitación observada: en el SHA `1f69c95bffb0ad70c93a1518e9bd10eca259cc61`, la regla local `S4423` detectó el patrón, pero SonarCloud no reportó un hallazgo para ese archivo. En esa ejecución reportó únicamente `S5542` y `S5547` sobre el cifrado. Evidencia: https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/42168711106. Ese resultado no se atribuye al nuevo caso de certificados.

El workflow actual ejecuta Sonar únicamente en `main` o en un pull request hacia `main`. Un push a esta rama omite ese paso, aunque el job denominado SAST pueda aprobar por sus otras comprobaciones. No se modifica esa condición ni se reducen umbrales o exclusiones en este cambio.

El PR #56 conserva los dos commits de la base de pipelines y un único commit experimental SAST. Se debe comprobar el rango y los pasos realmente ejecutados antes de atribuir un fallo a estos casos. No se ignoran hallazgos ni se modifican los controles de GitGuardian o Snyk para forzar un resultado.

Las ejecuciones anteriores de credenciales y composición corresponden a otros SHA y deben tratarse como fases separadas. Sus enlaces de evidencia son:

- Credenciales, CI completo: https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/42162365193
- Credenciales, CI reducido: https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/42162365174
- Composición, CI completo: https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/42163572225
- Composición, CI reducido: https://github.com/claudioignav/ZonaGaucha-ERP/actions/runs/42163572278

Se registrarán el SHA, el evento, los enlaces de los CI completo y reducido, los pasos ejecutados y los hallazgos reales. Esta fase no incorpora despliegues ni cambios en `main`.

## Referencias de las reglas

- https://rules.sonarsource.com/javascript/RSPEC-4830/
- https://rules.sonarsource.com/javascript/RSPEC-5547/
