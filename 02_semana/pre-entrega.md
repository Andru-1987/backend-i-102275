### 2. Contenido de la pre entrega: consignas

* **Nombre de la actividad**: Actividad: Diseño de endpoints REST para servicios.
* **Objetivo**: Construir una API REST con Express que exponga endpoints para gestionar el recurso `services`, vinculando las rutas con la clase `ServiceManager` creada anteriormente.
* **Estructura obligatoria del repositorio público de GitHub**:
  ```bash
  src/
  ├── config/env.config.js
  ├── managers/ServiceManager.js
  ├── routes/services.router.js
  ├── app.js
  └── server.js
  package.json
  .env.example
  .gitignore
  README.md
  ```
* **Criterios de aceptación**:
  1. **Configuración y modularización**:
     * Servidor Express con ESM (`import`/`export`) y lectura del puerto mediante variables de entorno en `.env`.
     * Router de servicios modularizado en `src/routes/services.router.js` utilizando `express.Router()`.
     * La lógica de persistencia/negocio debe mantenerse dentro de `ServiceManager` y no directamente en `app.js`.
  2. **Endpoints requeridos**:
     * **`GET /api/services`**: Obtiene todos los servicios. Debe aceptar filtros por query params (ejemplo: `?category=salud`, `?available=true`).
     * **`GET /api/services/:sid`**: Obtiene un servicio por su `id` (`200 OK` si existe, `404 Not Found` si no).
     * **`POST /api/services`**: Crea un servicio con los datos enviados en `req.body`. El `id` debe generarse internamente (`201 Created` si se crea, `400 Bad Request` si faltan campos).
     * **`PUT /api/services/:sid`**: Actualiza los campos recibidos sin permitir la modificación del `id` (`200 OK` si existe, `404 Not Found` si no).
     * **`DELETE /api/services/:sid`**: Elimina el servicio especificado (`200 OK` si existe, `404 Not Found` si no).
  3. **Uso de Express**: Lectura de `:sid` mediante `req.params`, de filtros mediante `req.query` y de datos mediante `req.body`.
* **Qué evitar**: Enviar el `id` en el body del `POST`, colocar la lógica del `ServiceManager` directamente en `app.js`, u omitir los códigos de estado HTTP (`200`, `201`, `400`, `404`).

