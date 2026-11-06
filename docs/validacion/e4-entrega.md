# E4 Entrega de software

Las ramas `test/e4-entrega-devops` y `test/e4-entrega-devsecops` parten de `6967b089efd5d32579ab78040c639edfac7cff0e`, la base limpia de `feature/pipelines`. Mantienen el mismo código del frontend y del backend, sin los casos de seguridad de E1.

## Conexión entre integración y despliegue

- DevOps ejecuta los CI reducidos. El despliegue requiere una ejecución manual con `desplegar=true`, que se activará únicamente después de completar las tres iteraciones. No incorpora GitGuardian, Snyk, Sonar, Trivy ni ZAP.
- DevSecOps ejecuta los CI completos mediante un PR hacia `main`, sin fusionarlo. El despliegue requiere la etiqueta explícita `e4-desplegar`, que no se añadirá hasta completar la tercera iteración y contar con la indicación del usuario. Después de aprobar Sonar y generar el artefacto, el despliegue incorpora Trivy y ZAP Baseline. ZAP conserva el comportamiento informativo del CD original, sin bloquear producción por sus alertas.
- Cada componente despliega su propio artefacto del mismo run primero en staging y después en production. No utiliza artefactos de otro commit o enfoque.
- La configuración de despliegue y los destinos son compartidos por ambos enfoques. No se ejecutan ambas secuencias simultáneamente sobre los mismos entornos.
- Los workflows originales de CD y las reglas de `main` se conservan. No es necesario fusionar las ramas experimentales en `main` para desplegarlas.

## Inicio de los despliegues

El commit de preparación cambia únicamente workflows, la acción de despliegue y esta guía. Se ejecutan los CI para comprobar la configuración, pero el CD se omite cuando el último commit no modifica el componente de la aplicación.

Los cambios pequeños se aplicarán de forma equivalente en ambas ramas, en tres commits separados y en el mismo orden. Las iteraciones 1 y 2 ejecutarán únicamente CI y no desplegarán ni en preproducción ni en producción. El despliegue final se realizará después de completar el cambio 3. El último commit debe modificar ambos componentes para activar los dos despliegues.

Publicar commits no activa CD. DevOps necesita la activación manual indicada y DevSecOps la etiqueta de despliegue en su PR. El workflow reutilizable vuelve a comprobar esa autorización antes de acceder a los entornos. Un PR sin la etiqueta y un push directo a la rama DevSecOps no despliegan. El push puede aprobar el CI con Sonar omitido, por lo que la medición del enfoque completo se toma del evento de PR.

## Registro de métricas

Se registrarán enfoque, iteración, contenido del cambio, SHA, evento, fechas del commit, inicio y fin de los jobs de CI y CD, disponibilidad en producción y enlaces de ejecución. En las iteraciones 1 y 2 se comparará la duración de CI hasta el job de compilación o empaquetado. El despliegue final y su duración se medirán por separado. El change lead time de cada cambio se obtiene desde su commit hasta la disponibilidad del lote final en producción, incluyendo las esperas entre iteraciones. Esas esperas se anotarán y no se atribuirán al costo de las comprobaciones del pipeline.

La frecuencia de despliegue se calculará con despliegues de producción completados en ventanas equivalentes. Con esta planificación se espera un despliegue final por enfoque y componente, no tres despliegues. Frontend y backend se analizarán por separado. La preparación, las ejecuciones canceladas y las restauraciones no se cuentan como entregas de la secuencia experimental.

Cada enfoque tiene sus propios commits al aplicar la misma secuencia desde la misma base. Los SHA pueden diferir aunque el contenido funcional sea equivalente. Los despliegues están bloqueados por defecto y la producción se publicará únicamente después de la tercera iteración.
