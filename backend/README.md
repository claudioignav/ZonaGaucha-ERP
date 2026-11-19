# Backend Zona Gaucha ERP

API en Express y Sequelize que usa Azure SQL. Las variables de entorno de cada ambiente están descritas en `.env.example`, `.env.staging.example` y `.env.production.example`.

## Inicio de sesión

### Duración de la sesión

Al iniciar sesión el backend entrega un token JWT que dura 30 días. El valor se controla con la variable `JWT_EXPIRA` y si no está definida se usan `30d`.

El frontend guarda la sesión en el navegador (`localStorage`), por lo que se mantiene al recargar la página y al cerrar el navegador. Antes de recuperarla revisa que el token no haya vencido. Si venció, la borra y pide iniciar sesión otra vez. Cerrar sesión también la borra.

En Azure la variable `JWT_EXPIRA` se configura a mano en cada App Service, porque Terraform no la define. Si ahí sigue con el valor anterior (`2h`), la sesión durará eso. Para aplicar los 30 días hay que cambiarla a `30d` o eliminarla.
