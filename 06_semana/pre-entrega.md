## Contenido de la Pre-Entrega

* **Nombre de la actividad**: Migración a MongoDB con Mongoose.
* **Objetivo**: Migrar la API inicial del Sistema Backend de Turnos y Reservas desde la persistencia local en archivos JSON con `FileSystem` hacia MongoDB Atlas utilizando Mongoose, conservando las rutas y endpoints ya trabajados sin alterar el comportamiento externo.
* **Modelos requeridos (en archivos independientes dentro de `src/dao/models/`)**:
  1. `service.model.js`: Estructura para la colección `services`.
  2. `booking.model.js`: Estructura para la colección `bookings`, guardando los servicios mediante referencia a su `ObjectId` y cantidad (`services: [{ service: ObjectId, quantity: Number }]`), evitando incrustar el objeto completo.
  3. `message.model.js`: Estructura para la colección `messages`.
* **Requerimientos de conexión y entorno**:
  * Configurar la URI de conexión a la base de datos mediante la variable de entorno `MONGO_URI`.
  * Incluir obligatoriamente el archivo `.env.example` en la raíz del proyecto.
  * Excluir estrictamente las credenciales reales, el archivo `.env` y la carpeta `node_modules` en el archivo `.gitignore`.
* **Endpoints que deben mantenerse operativos**:
  * **Servicios**: `GET /api/services`, `GET /api/services/:sid`, `POST /api/services`, `PUT /api/services/:sid`, `DELETE /api/services/:sid`.
  * **Reservas**: `POST /api/bookings`, `GET /api/bookings/:bid`, `POST /api/bookings/:bid/services/:sid`.
* **Arquitectura de software esperada**:
  * Mantenimiento de la arquitectura en capas: `routes → controllers → services → repositories → DAO → models`.
  * El cambio de persistencia debe acotarse a la capa DAO y Modelos, asegurando que las capas superiores (`controllers` y `services`) permanezcan estables.
* **Formato de entrega**: Enlace a un repositorio público de GitHub sin archivos sensibles ni carpetas comprimidas.

