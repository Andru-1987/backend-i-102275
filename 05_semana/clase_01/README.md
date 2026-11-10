# reservas-app

API REST de reserva de servicios (spa/estética): gestiona un catálogo de servicios y reservas que pueden incluir servicios. Construida con **Express 5**, persistencia en **JSON plano** (`data/`), arquitectura por capas (route → controller → manager) y manejo centralizado de errores.

## Quick path

```bash
cp env.example .env       # completar variables (ver Configuración)
npm install
npm start                 # node --env-file=.env --watch server.js
```

Verificación: `GET http://127.0.0.1:PORT/health` → `{"status":"ok","serverName":"AndruServer"}`

## Arquitectura

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Entry | `app.js` / `server.js` | Monta routers y middlewares; levanta el servidor |
| Router | `src/routes/*.router.js` | Define endpoints. `baseRouter.js` provee CRUD base (GET all, GET by id, POST) |
| Controller | `src/controllers/*.js` | Valida presencia, traduce params, lanza `AppError` |
| Manager | `src/managers/*.js` | Reglas de negocio + lectura/escritura del JSON |
| Utilidades | `src/utils/apiResponse.js` | Envelope único de respuesta `success` |
| Errores | `src/errors/appErrors.js`, `middleware/errorHandler.js` | Errores tipados por HTTP status |

## Configuración

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (obligatorio) |
| `NODE_ENV` | Entorno (obligatorio) |
| `SERVICES_DB_PATH` | Ruta de `data/services.json` |
| `BOOKINGS_DB_PATH` | Ruta de `data/bookings.json` |

> ⚠️ Falta levantar sin variables: `env.config.js` lanza error si faltan `PORT` o `NODE_ENV`.

---

## Endpoints

Envelope de respuesta:

```json
// éxito
{ "status": "success", "message": "...", "payload": { } }
// error (globalErrorHandler)
{ "status": "error", "message": "...", "payload": null }
```

### Salud

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Status del servidor |
| GET | `/info` | Versión de Node del proceso |

### Servicios — `/api/v1/services`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista servicios. Query: `category` (case-insensitive) y `available=true|false` |
| GET | `/:id` | Obtiene un servicio por ID |
| POST | `/` | Crea servicio (valida campos obligatorios) |
| PUT | `/:id` | Actualiza parcialmente un servicio |
| DELETE | `/:id` | Elimina un servicio (devuelve el eliminado) |

### Reservas — `/api/v1/bookings`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Lista reservas (404 si no hay ninguna) |
| GET | `/:id` | Obtiene una reserva por ID |
| POST | `/` | Crea reserva con `status: "pending"` y `services: []` |
| POST | `/:bid/services/:sid` | Agrega un servicio a la reserva; si ya existe incrementa `quantity` |

---

## Casos de test

Códigos esperados: `200` ok · `201` creado · `204` actualizado · `404` no encontrado · `422` validación · `500` error interno.

### Servicios

| # | Caso | Request | Esperado |
|---|------|---------|----------|
| S1 | Listar todos | `GET /api/v1/services` | `200`, array en `payload` |
| S2 | Filtrar por categoría | `GET /api/v1/services?category=estetica` | `200`, solo coincidencias (case-insensitive) |
| S3 | Filtrar por disponibilidad | `GET /api/v1/services?available=false` | `200`, solo `available: false` |
| S4 | Obtener por ID existente | `GET /api/v1/services/3` | `200`, objeto |
| S5 | Obtener ID inexistente | `GET /api/v1/services/999` | `404`, "Servicio no encontrado" |
| S6 | Crear válido | `POST` con todos los campos | `201`, objeto con `id` autogenerado (max+1) |
| S7 | Crear sin campo obligatorio | `POST` sin `price` | `422`, "El campo price -> esta faltante" |
| S8 | Crear con `available` no booleano | `POST` con `available: "true"` | `422`, "El campo available debe ser True o False" |
| S9 | Actualizar existente | `PUT /:id` con campos parciales | `204` |
| S10 | Actualizar inexistente | `PUT /999` | `404` |
| S11 | Eliminar existente | `DELETE /:id` | `200`, devuelve el servicio eliminado |
| S12 | Eliminar inexistente | `DELETE /999` | `404` |

### Reservas

| # | Caso | Request | Esperado |
|---|------|---------|----------|
| B1 | Listar reservas | `GET /api/v1/bookings` | `200`, array (o `404` si está vacío) |
| B2 | Obtener por ID | `GET /api/v1/bookings/1` | `200`, objeto con `services` |
| B3 | ID inexistente | `GET /api/v1/bookings/999` | `404`, "Reserva no encontrada" |
| B4 | Crear válida | `POST` con `clientName, clientEmail, date, time` | `201`, con `status: "pending"` y `services: []` |
| B5 | Crear con campo faltante/vacío | `POST` sin `date` | Error "Faltan campos obligatorios" |
| B6 | Agregar servicio nuevo | `POST /1/services/3` | `200`, `services` incluye `{service: 3, quantity: 1}` |
| B7 | Agregar servicio repetido | `POST /1/services/3` (dos veces) | `200`, `quantity` incrementa (no duplica el ítem) |
| B8 | Reserva inexistente | `POST /999/services/1` | `404`, "Reserva no encontrada" |
| B9 | Servicio inexistente | `POST /1/services/999` | `404`, "Servicio no encontrado" |

---

## Schemas | Models

### Service

```json
{
  "id": 1,            // number — autogenerado (max + 1)
  "name": "string",   // obligatorio en POST
  "description": "string",  // obligatorio
  "duration": 60,     // number (minutos)
  "price": 7500,      // number
  "category": "Estetica",   // string — filtra por query
  "available": true   // boolean — obligatorio, validado
}
```

### Booking

```json
{
  "id": 1,                  // number — autogenerado (max + 1)
  "clientName": "string",   // obligatorio en POST
  "clientEmail": "string",  // obligatorio
  "date": "30-11-2026",     // string libre (sin validación de formato)
  "time": "10:30",          // string libre
  "status": "pending",      // seteado por el sistema al crear
  "services": [             // items agregados vía POST /:bid/services/:sid
    { "service": 1, "quantity": 4 }  // service: id del Service
  ]
}
```

### Errores de dominio (`AppError`)

| Clase | HTTP | Uso |
|-------|------|-----|
| `ValidationError` | 422 | Falta un campo o tipo inválido (servicios) |
| `NotFoundError` | 404 | Recurso inexistente (también lista vacía de reservas) |
| `BadRequestError` / `UnauthorizedError` / `ForbiddenError` / `ConflictError` | 400 / 401 / 403 / 409 | Disponibles, aún sin uso |

Error no tipado → `500` con mensaje genérico `"Internal Server Error"`.

---

## Known issues (comportamiento actual a tener en cuenta)

1. **Mismatch de nombres de param**: los routers base registran `:id`, pero los controllers leen `:sid` (servicios) y `:bid` (reservas). Por ejemplo `GET /api/v1/services/:id` lee `request.params.sid` → `Number(undefined)` = `NaN` → `404` siempre. Afecta: GET por ID, PUT y DELETE de servicios; GET por ID y PUT de reservas (la ruta `POST /:bid/services/:sid` sí funciona).
2. **`updateService` usa índice de array**: guarda en `services[idService]` (índice) en vez de buscar por `id`. Si los IDs no coinciden con la posición, corrompe el archivo (ilustrado por el `id: 1` duplicado en `data/services.json`).
3. **`createBooking` lanza `Error` genérico** si faltan campos (B5): responde `500` en vez de `422`.
4. **`204` con body**: `sendUpdated` declara 204 pero envía JSON; Express descarta el body de un 204.
5. **Race condition latente**: lectura/escritura completa del JSON sin lock; escrituras concurrentes pueden sobrescribirse.
