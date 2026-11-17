# Bugs conocidos — reservas-app

Bugs detectados durante el desarrollo del set de tests de API (`scripts/test_happy.sh` y
`scripts/test_errors.sh`). Ninguno fue corregido: se documentan para priorizar su arreglo.

| # | Bug | Severidad | Archivo | Estado |
|---|-----|-----------|---------|--------|
| 1 | `DELETE /api/v1/services/:id` devuelve 404 siempre | Alta | `src/controllers/serviceController.js` | Abierto |
| 2 | `POST /api/v1/bookings` con campos faltantes devuelve 500 en vez de 422 | Media | `src/services/bookigns.service.js` | Abierto |
| 3 | `POST /api/v1/bookings` no devuelve el booking creado en el payload | Media | `src/dao/bookings.dao.js` | Abierto |
| 4 | JSON malformado devuelve 500 en vez de 400 | Baja | `src/middleware/errorHandler.js` | Abierto |
| 5 | IDs duplicados en `data/services.json` | Media | `data/services.json` | Abierto |
| 6 | Código muerto: `ServiceManager` / `BookingManager` duplican la lógica activa | Baja | `src/managers/` | Abierto |
| 7 | `updateService` invoca al repository dos veces | Baja | `src/services/services.service.js` | Abierto |

---

## 1. `DELETE /api/v1/services/:id` devuelve 404 siempre

- **Severidad:** Alta (el endpoint es totalmente inoperante)
- **Archivo:** `src/controllers/serviceController.js:63`
- **Síntoma:** `DELETE /api/v1/services/1` con un servicio existente responde `404 Servizio no encontrado` / "Servicio no encontrado", siempre.
- **Causa:** el controller lee `request.params.sid`, pero la ruta define `/:id` (ver `src/routes/service.router.js:7`). `Number(undefined)` produce `NaN`, y `findIndex` nunca coincide con `NaN`.
- **Reproducir:** `http DELETE localhost:<PORT>/api/v1/services/1` → 404.
- **Fix sugerido:** reemplazar `request.params.sid` por `request.params.id` en `serviceController.delete`.
- **Detectado por:** `scripts/test_errors.sh` (test "DELETE on an existing service id").

## 2. `POST /api/v1/bookings` con campos faltantes devuelve 500 en vez de 422

- **Severidad:** Media (la validación existe, pero explota antes de responder)
- **Archivo:** `src/services/bookigns.service.js:20`
- **Síntoma:** enviar un body sin `clientName`/`clientEmail`/`date`/`time` responde `500 Internal Server Error` en lugar de `422` con el mensaje de validación.
- **Causa:** `throw ValidationError(...)` sin `new`. Lanzar un constructor de clase lanza un `TypeError` (`Class constructor ValidationError cannot be invoked without 'new'`), que cae al `globalErrorHandler` como error genérico 500.
- **Reproducir:** `http POST localhost:<PORT>/api/v1/bookings clientName="x"` → 500.
- **Fix sugerido:** `throw new ValidationError(...)`.
- **Detectado por:** `scripts/test_errors.sh` (test "POST /bookings with missing fields").

## 3. `POST /api/v1/bookings` no devuelve el booking creado en el payload

- **Severidad:** Media (el booking se persiste, pero el cliente no recibe el recurso)
- **Archivo:** `src/dao/bookings.dao.js:27-38`
- **Síntoma:** crear una reserva responde `200` con `payload: undefined` (la clave desaparece del JSON por `JSON.stringify`).
- **Causa:** `BookingDAO.create` persiste el array pero no tiene `return`, así que `createBooking` en el service devuelve `undefined`.
- **Reproducir:** `http POST localhost:<PORT>/api/v1/bookings clientName="x" clientEmail="x@y.com" date="01-12-2026" time="1000"` → el body no incluye `payload.id`.
- **Fix sugerido:** agregar `return newBooking;` al final de `BookingDAO.create`.
- **Detectado por:** `scripts/test_happy.sh` (test "POST /bookings returns the created booking").

## 4. JSON malformado devuelve 500 en vez de 400

- **Severidad:** Baja
- **Archivo:** `src/middleware/errorHandler.js`
- **Síntoma:** enviar un body con JSON inválido responde `500 Internal Server Error`.
- **Causa:** `globalErrorHandler` solo distingue `AppError`; los errores de `express.json()` (body-parser) traen su propio `error.statusCode` (400) pero se ignoran y caen al `console.error` + 500.
- **Reproducir:** `http POST localhost:<PORT>/api/v1/services Content-Type:application/json <<< '{invalid'` → 500.
- **Fix sugerido:** antes del fallback 500, respetar `error.statusCode` si existe (ej: `const status = error.statusCode ?? error.status ?? 500`).
- **Detectado por:** `scripts/test_errors.sh` (test "Malformed JSON body").

## 5. IDs duplicados en `data/services.json`

- **Severidad:** Media (comportamiento no determinista en toda la API de servicios)
- **Archivo:** `data/services.json`
- **Síntoma:** existen dos registros con `id: 1`. `GET /services/1`, `PUT /services/1` y `DELETE /services/1` actúan siempre sobre el primero que aparezca en el array; el segundo registro es inalcanzable por id.
- **Causa:** datos cargados/creados a mano (probablemente con el manager viejo o editando el JSON directamente). El `create` del DAO genera `max(id) + 1`, que no repara duplicados preexistentes.
- **Fix sugerido:** normalizar `data/services.json` con ids únicos. Opcionalmente validar unicidad al crear.
- **Detectado por:** inspección manual de los datos durante el diseño de los tests.

## 6. Código muerto: `ServiceManager` / `BookingManager`

- **Severidad:** Baja (deuda técnica y riesgo futuro)
- **Archivos:** `src/managers/ServiceManager.js`, `src/managers/BookingManager.js`
- **Síntoma:** ninguna ruta usa los managers; el cableado real es controller → service → repository → DAO (`src/services/index.js`). Además:
  - `ServiceManager.updateService` guarda con `services[idService] = ...`, usando el **id como índice de array** (no busca por id). Si algún día se cablea, corrompe registros.
  - Duplican la validación que ya existe en los services.
- **Fix sugerido:** eliminar los managers o conectarlos realmente; en cualquier caso, nunca usar `array[id]` para ubicar un registro.
- **Detectado por:** revisión del grafo de dependencias durante el diseño de los tests.

## 7. `updateService` invoca al repository dos veces

- **Severidad:** Baja (hoy es idempotente, pero duplica lecturas/escrituras del archivo)
- **Archivo:** `src/services/services.service.js:66-67`
- **Síntoma:** `this.servicesRepository.update(id, updatedData)` se llama en la línea 66, se descarta, y se vuelve a llamar en la 67 para devolver el resultado.
- **Fix sugerido:** una sola llamada: `return await this.servicesRepository.update(id, updatedData);`
- **Detectado por:** revisión de código durante el diseño de los tests.
