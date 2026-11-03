
## Pre-Entrega: Routers - Controllers - Organizacion de la API

* **Nombre de la actividad**: Organización de la API con Routers y Controllers.
* **Objetivo**: Reorganizar la API existente del Sistema Backend de Turnos y Reservas separando responsabilidades en tres capas (rutas, controladores y managers) sin modificar las URLs ni el comportamiento externo de los endpoints.
* **Estructura obligatoria del repositorio público de GitHub**:
  ```bash
  src/
  ├── config/
  │   └── env.config.js
  ├── controllers/
  │   ├── bookings.controller.js
  │   └── services.controller.js
  ├── data/
  │   ├── bookings.json
  │   └── services.json
  ├── managers/
  │   ├── BookingManager.js
  │   └── ServiceManager.js
  ├── routes/
  │   ├── bookings.router.js
  │   └── services.router.js
  ├── app.js
  └── server.js
  package.json
  .env.example
  .gitignore
  README.md
  ```
  *(El repositorio no debe incluir `node_modules`, archivos `.env` ni credenciales reales)*.

* **Criterios de aceptación**:
  1. **Separación de responsabilidades**:
     * **Routers**: Solo definen los endpoints y los conectan con su controlador; no contienen lógica de procesamiento ni acceso a datos.
     * **Controllers**: Reciben los datos de la petición (`req.params`, `req.query`, `req.body`), ejecutan las llamadas a los managers y retornan la respuesta con `res.status().json()`.
     * **Managers**: Administran la lectura y escritura sobre los archivos JSON sin manipular los objetos `req` o `res` de Express.
  2. **Funciones requeridas en controladores**:
     * `services.controller.js`: Implementa `getServices`, `getServiceById`, `createService`, `updateService` y `deleteService`, interactuando con `ServiceManager`.
     * `bookings.controller.js`: Implementa `createBooking`, `getBookingById` y `addServiceToBooking`, interactuando con `BookingManager`. La función `addServiceToBooking` debe validar la existencia previa del servicio mediante `ServiceManager`.
  3. **Endpoints mantenidos (sin cambios de comportamiento)**:
     * `GET /api/services`
     * `GET /api/services/:sid`
     * `POST /api/services`
     * `PUT /api/services/:sid`
     * `DELETE /api/services/:sid`
     * `POST /api/bookings`
     * `GET /api/bookings/:bid`
     * `POST /api/bookings/:bid/services/:sid`
* **Qué evitar**: Modificar las URLs de la API, colocar lógica de acceso a archivos JSON directamente en los routers o utilizar `req` y `res` dentro de la capa de managers.

