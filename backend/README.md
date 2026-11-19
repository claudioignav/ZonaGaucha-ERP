# Backend Zona Gaucha ERP

API en Express y Sequelize que usa Azure SQL. Las variables de entorno de cada ambiente están descritas en `.env.example`, `.env.staging.example` y `.env.production.example`.

## Inicio de sesión

### Duración de la sesión

Al iniciar sesión el backend entrega un token JWT que dura 30 días. El valor se controla con la variable `JWT_EXPIRA` y si no está definida se usan `30d`.

El frontend guarda la sesión en el navegador (`localStorage`), por lo que se mantiene al recargar la página y al cerrar el navegador. Antes de recuperarla revisa que el token no haya vencido. Si venció, la borra y pide iniciar sesión otra vez. Cerrar sesión también la borra.

En Azure la variable `JWT_EXPIRA` se configura a mano en cada App Service, porque Terraform no la define. Si ahí sigue con el valor anterior (`2h`), la sesión durará eso. Para aplicar los 30 días hay que cambiarla a `30d` o eliminarla.

### Suspensión por intentos fallidos

Cuando alguien escribe mal la contraseña de una cuenta 5 veces seguidas, la cuenta queda suspendida 15 minutos. Durante ese tiempo el login responde 423 e indica cuántos minutos faltan, aunque la contraseña sea correcta. Al pasar la suspensión se puede entrar de nuevo, y un inicio de sesión correcto reinicia el conteo.

Los intentos se guardan en las columnas `intentos_fallidos` y `bloqueado_hasta` de la tabla `usuario`. Antes de desplegar esta versión hay que ejecutar `sql/usuario_bloqueo_intentos.sql` en la base de cada ambiente (testing, preproducción y producción). Si el backend se despliega sin esas columnas, el login falla. El script revisa si las columnas ya existen, así que se puede ejecutar más de una vez.

Los valores de 5 intentos y 15 minutos están en `controllers/authController.js` (`MAX_INTENTOS` y `MINUTOS_SUSPENSION`).
