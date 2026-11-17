# Adaptación de reservas-app a MongoDB con Mongoose

Proyecto: `06_semana/reservas-app-mongo`
Decisión de diseño: usar el **`_id` de MongoDB (ObjectId)** como identificador, en lugar de mantener el `id` numérico consecutivo. Mongoose como ODM.

## Arquitectura

El desacoplamiento ya existe: `repositories` reciben el DAO **inyectado por constructor**. El swap de persistencia ocurre en un único punto: `src/dao/index.js`.

```
routes → controllers → services → repositories → DAO (⭐ punto de intercambio)
                                                   ├── JSONFileDAO  (actual, se conserva)
                                                   └── MongooseDAO  (nuevo) → MongoDB
```

Subir a la capa DAO todo lo que está arriba queda casi intacto. Los únicos cambios forzados fuera del DAO son:

1. **Controllers**: eliminan el casteo `Number(request.params.id)` → ahora los ids son strings de ObjectId.
2. **BookingsService**: la comparación de servicios dentro de una reserva pasa a comparar ObjectIds.
3. **server.js**: conecta a Mongo antes de escuchar.

---

## 1. Dependencia y variables de entorno

```bash
npm i mongoose
```

`env.example`:

```
PORT =
NODE_ENV =
MONGODB_URI =
```

`src/config/env.config.js`:

```js
const { PORT, NODE_ENV, MONGODB_URI } = process.env

if (!PORT || !NODE_ENV || !MONGODB_URI) throw new Error('Se requieren PORT, NODE_ENV y MONGODB_URI')

export default {
    port: Number(PORT),
    nodeEnv: NODE_ENV,
    mongodbUri: MONGODB_URI,
}
```

> Las variables `SERVICES_DB_PATH` / `BOOKINGS_DB_PATH` quedan obsoletas (solo las usan los fileDAOs y `src/managers/`, que es código muerto).

## 2. Conexión: `src/database/mongoose.js` (nuevo)

```js
import mongoose from "mongoose";
import config from "../config/env.config.js";

export async function connectDB() {
  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
  mongoose.connection.once("open", () => console.log(`MongoDB conectada: ${config.mongodbUri}`));

  await mongoose.connect(config.mongodbUri);
}
```

`server.js`:

```js
import app from "./app.js";
import config from "./src/config/env.config.js";
import { connectDB } from "./src/database/mongoose.js";

await connectDB();

app.listen(config.port, () =>
  console.log(`Server listening at http://127.0.0.1:${config.port}`),
);
```

## 3. Models

`src/models/service.model.js` (nuevo):

```js
import { Schema, model } from "mongoose";

const serviceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, required: true },
});

export default model("Service", serviceSchema);
```

`src/models/booking.model.js` (nuevo):

```js
import { Schema, model } from "mongoose";

const bookingSchema = new Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "pending" },
  services: [{
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    quantity: { type: Number, default: 1 },
  }],
});

export default model("Booking", bookingSchema);
```

Notas:
- Mongo genera `_id` automáticamente; ya no hace falta el contador de ids.
- `services.service` es un ObjectId con `ref` a `Service` (referencia documental, no duplica el servicio).
- No se agregan timestamps para mantener la forma actual de los datos.

## 4. Mongoose DAOs (nuevos)

Mismo contrato que los DAOs de archivo (`getAll`, `getById`, `create`, `update`, `delete`). Regla clave: **`.lean()` en todas las lecturas** para devolver objetos planos (POJOs) y no romper la capa de servicios (spreads, filtros, `quantity++`).

`src/dao/services.mongo.dao.js`:

```js
import mongoose from "mongoose";
import Service from "../models/service.model.js";

export default class ServicesMongoDAO {
  async getAll() {
    return Service.find().lean();
  }

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Service.findById(id).lean();
  }

  async create(serviceData) {
    const created = await Service.create(serviceData);
    return created.toObject();
  }

  async update(id, updatedData) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Service.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true }).lean();
  }

  async delete(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Service.findByIdAndDelete(id).lean();
  }
}
```

`src/dao/bookings.mongo.dao.js`: igual, usando `Booking` y el modelo de booking.

> `isValidObjectId` evita que un id malformado en la URL termine en un `CastError` → 500. Con el guard devuelve `null` → 404.

## 5. El swap: `src/dao/index.js` (editar)

```js
import ServicesMongoDAO from "./services.mongo.dao.js";
import BookingsMongoDAO from "./bookings.mongo.dao.js";

const servicesDAO = new ServicesMongoDAO();
const bookingsDAO = new BookingsMongoDAO();

export { servicesDAO, bookingsDAO };
```

`src/repositories/index.js` **no cambia** (sigue inyectando los DAOs por constructor).

## 6. Controllers (editar)

`src/controllers/serviceController.js` y `src/controllers/bookController.js`: eliminar todos los casteos `Number(...)`. Los ids viajan como strings de ObjectId:

```js
// antes
const serviceId = Number(request.params.id);
// después
const serviceId = request.params.id;
```

Mismo cambio en `bookController` (`:id` en `getById`, `:bid` / `:sid` en `addServiceToBooking`).

## 7. BookingsService (editar)

`src/services/bookigns.service.js` — en `addServiceToBooking` la comparación cambia porque ahora son ObjectIds:

```js
// antes
const existingService = updetedBooking.services.find(
  (item) => item.service === serviceId,
);
// después (comparar como string)
const existingService = updetedBooking.services.find(
  (item) => String(item.service) === String(serviceId),
);
```

Y el push ya no castea a Number:

```js
updetedBooking.services.push({ service: serviceId, quantity: 1 });
```

El resto de la lógica de validación y del service layer queda igual (los filtros de `getServices` por `category`/`available` funcionan igual sobre POJOs).

## 8. Seed: `src/scripts/seed.js` (nuevo, opcional pero recomendado)

Importa `data/*.json` a Mongo. Los ids numéricos viejos se descartan y los bookings se remapean al nuevo ObjectId del servicio:

```js
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import Service from "../models/service.model.js";
import Booking from "../models/booking.model.js";
import config from "../config/env.config.js";

await mongoose.connect(config.mongodbUri);

const servicesData = JSON.parse(await readFile(new URL("../../data/services.json", import.meta.url), "utf8"));
const bookingsData = JSON.parse(await readFile(new URL("../../data/bookings.json", import.meta.url), "utf8"));

await Promise.all([Service.deleteMany({}), Booking.deleteMany({})]);

const insertedServices = await Service.insertMany(servicesData);

// mapa: id numérico viejo -> nuevo ObjectId
const idMap = new Map(servicesData.map((s, i) => [s.id, insertedServices[i]._id]));

const remappedBookings = bookingsData.map((b) => ({
  ...b,
  id: undefined,
  services: b.services.map((item) => ({
    service: idMap.get(item.service),
    quantity: item.quantity,
  })),
}));

await Booking.insertMany(remappedBookings);

console.log("Seed completado");
await mongoose.disconnect();
```

> **Gotcha**: `data/services.json` tiene dos servicios con `id: 1` (duplicado heredado del bug del contador). Con ObjectId esto deja de importar para los nuevos datos, pero si el seed corre con el mapa por id numérico, la segunda entrada con `id: 1` pisa a la primera en `idMap`. Como los bookings actuales solo referencian los ids 3 y 4, no afecta hoy — igual conviene corregir el JSON duplicado antes de seedear.

Correr con:

```bash
node --env-file=.env src/scripts/seed.js
```

---

## Resumen de archivos

| Archivo | Acción |
|---|---|
| `package.json` | editar — agregar `mongoose` |
| `env.example` / `src/config/env.config.js` | editar — `MONGODB_URI` (quedan obsoletos los `_DB_PATH`) |
| `src/database/mongoose.js` | crear |
| `src/models/service.model.js` | crear |
| `src/models/booking.model.js` | crear |
| `src/dao/services.mongo.dao.js` | crear |
| `src/dao/bookings.mongo.dao.js` | crear |
| `src/dao/index.js` | editar — swap de DAOs |
| `src/controllers/serviceController.js` | editar — quitar `Number()` |
| `src/controllers/bookController.js` | editar — quitar `Number()` |
| `src/services/bookigns.service.js` | editar — comparación/push de ObjectId |
| `server.js` | editar — `await connectDB()` |
| `src/scripts/seed.js` | crear |
| `src/dao/*.dao.js` (file) | se conservan como referencia del patrón (o se borran) |
| `src/managers/` | **código muerto** — no lo usa ninguna ruta; quedaría roto con Mongo. Recomendado borrarlo en esta entrega |

## Ajustado y pendiente (bugs preexistentes, fuera del alcance de la capa Mongo)

- `servicesService.updateService` llama a `this.servicesRepository.update(id, ...)` dos veces.
- `BookingsService.createBooking` hace `ValidationError(...)` sin `new` → TypeError en runtime cuando falla la validación.
- `ServiceController.delete` lee `request.params.sid` cuando la ruta define `/:id` → DELETE de servicios siempre falla.
- El manejo de errores podría interpretar `MongooseValidationError`/`CastError` en `errorHandler` (400/500) — opcional, otra entrega.

## Orden de implementación

1. `npm i mongoose` + env
2. `src/database/mongoose.js` + conexión en `server.js`
3. Models
4. Mongoose DAOs + swap en `dao/index.js`
5. Controllers (quitar `Number()`) + `bookigns.service.js` (ObjectId)
6. Seed + prueba manual de endpoints (CRUD services, bookings, `POST /bookings/:bid/services/:sid`)
