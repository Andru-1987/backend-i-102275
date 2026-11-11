# Semana 6: MongoDB Atlas y Mongoose

## 1. Contenido Teórico

1. **Limitaciones de FileSystem y necesidad de bases de datos NoSQL**:
   * Las operaciones de persistencia mediante archivos JSON con `FileSystem` presentan severas limitaciones en aplicaciones de escala real: dificultad para consultar volúmenes masivos, riesgo de corrupción por lecturas/escrituras concurrentes, falta de herramientas avanzadas de búsqueda, poca escalabilidad y complejidad para relacionar información.
   * **MongoDB** es una base de datos NoSQL orientada a documentos que almacena la información en un formato BSON (JSON binario), manteniendo una coincidencia natural con la estructura de objetos de JavaScript.
   * **Conceptos clave de MongoDB**:
     * **Base de datos**: Contenedor principal del sistema (`booking_system`).
     * **Colección**: Agrupación de documentos de un mismo tipo (`services`, `bookings`, `messages`).
     * **Documento**: Registro individual dentro de una colección.
     * **Campo**: Propiedad clave-valor dentro de un documento.
     * **`ObjectId`**: Identificador único de 12 bytes generado automáticamente por MongoDB para la propiedad `_id`.
   * **MongoDB Atlas**: Servicio de bases de datos en la nube (DBaaS) que permite administrar clusters, gestionar usuarios, configurar listas blancas de IP (*whitelisting*), replicación y obtener cadenas de conexión remotas sin administrar servidores locales.

2. **Conexión y Mongoose como ODM**:
   * **Mongoose**: Librería Object Data Modeling (ODM) para Node.js que actúa como capa intermedia e "oficial de aduanas" entre la aplicación y MongoDB, añadiendo estructura, validaciones de tipo y abstrayendo la persistencia.
   * **Instalación e importación**: Se incorpora al proyecto mediante `npm install mongoose` y se importa con sintaxis ESM mediante `import mongoose from 'mongoose'`.
   * **Gestión segura de la URI**: La cadena de conexión (`mongodb+srv://...`) contiene credenciales sensibles y se almacena exclusivamente en la variable de entorno `MONGO_URI` dentro del archivo `.env`, utilizando `.env.example` como plantilla para el repositorio.
   * **Resiliencia en producción**: Se recomienda incluir parámetros como `retryWrites=true` en la URI para reintentar operaciones de escritura ante fallos de red temporales.
   * **Conexión centralizada**: La lógica se ubica en `src/config/database.config.js` ejecutando `mongoose.connect()`, empleando `process.exit(1)` para detener el proceso si la conexión falla.

3. **Schemas, Models y Colecciones**:
   * **Schema**: Plano o definición técnica que especifica los campos, tipos de datos (`String`, `Number`, `Boolean`, `Date`), validaciones obligatorias y opciones automáticas como `timestamps: true` (agrega `createdAt` y `updatedAt`).
   * **Model**: Objeto o interfaz compilada a partir de un Schema que permite ejecutar consultas CRUD sobre una colección específica de MongoDB.
   * **Definición de modelos del sistema**:
     * `service.model.js`: Colección `services` (`name`, `description`, `duration`, `price`, `category`, `available`).
     * `booking.model.js`: Colección `bookings` (`clientName`, `clientEmail`, `date`, `time`, `status`, `services`). Las referencias a los servicios se definen vinculando su `ObjectId`:
       ```javascript
       services: [
         {
           service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
           quantity: Number
         }
       ]
       ```
      
     * `message.model.js`: Colección `messages` (`user`, `message`, `createdAt`).

4. **Validaciones avanzadas y Middlewares (Hooks)**:
   * **Validación de Enums**: Restricción de valores aceptados en campos específicos (ej. `status: { type: String, enum: ['pending', 'confirmed', 'cancelled'] }`).
   * **Middlewares de Mongoose (`pre` y `post`)**: Funciones que se ejecutan antes o después de acciones como `.save()`. Un uso habitual es el hook `pre('save')` para actualizar fechas o encriptar contraseñas.
   * **Uso del contexto `this`**: Los middlewares de Mongoose requieren el uso de funciones tradicionales (`function()`) para acceder al documento mediante `this`, ya que las arrow functions no poseen su propio contexto.

# MongoDB Atlas y Mongoose

MongoDB resuelve las limitaciones de persistencia en archivos, Mongoose aporta modelado y validación, y Atlas simplifica el despliegue remoto. A continuación hago una revisión avanzada, con correcciones y prácticas recomendadas para tu proyecto de sistema de reservas. [mongoosejs](https://mongoosejs.com/docs/validation.html)

## Correcciones clave

| Punto del material | Ajuste técnico recomendado |
|---|---|
| “Mongoose es la capa oficial de aduanas” | Es una analogía útil, pero Mongoose es un **ODM de terceros**, no parte oficial de MongoDB. Añade schemas, validación, hooks, casting y consultas tipadas.  [mongoosejs](https://mongoosejs.com/docs/validation.html) |
| `process.exit(1)` ante fallo de conexión | Es válido para un arranque crítico, pero en producción conviene registrar el error, aplicar reintentos con backoff y diferenciar errores transitorios de errores de configuración. |
| “Las referencias vinculan el `ObjectId`” | Correcto: MongoDB no impone integridad referencial automática; la coherencia entre `bookings.services[].service` y `services` debe gestionarse en la aplicación. |
| `timestamps: true` | Agrega `createdAt` y `updatedAt`; en Mongoose, `updatedAt` se actualiza automáticamente en operaciones de modificación de documentos. |
| `pre('save')` para encriptar contraseñas | Correcto para documentos creados o modificados con `.save()`, pero **no** se ejecuta en `updateOne`, `updateMany` ni `findOneAndUpdate` por defecto. Para esos casos, usa hooks de query o actualiza mediante `save()`.  [mongoosejs](https://mongoosejs.com/docs/middleware.html) |

## MongoDB y Atlas

MongoDB almacena documentos BSON, una representación binaria de JSON que soporta tipos adicionales como `ObjectId`, fechas, decimales y datos binarios. Un `ObjectId` ocupa 12 bytes: 4 de timestamp, 5 aleatorios por proceso y 3 de contador incremental; por eso su representación hexadecimal habitual tiene 24 caracteres. [mongodb](https://www.mongodb.com/docs/manual/reference/method/objectid/)

Atlas es un DBaaS: abstrae el aprovisionamiento, réplicas, monitoreo y acceso remoto, pero no elimina la responsabilidad de configurar correctamente usuarios, red, credenciales y opciones de conexión. Las cadenas `mongodb+srv://` son las recomendadas para Atlas porque usan DNS SRV para descubrir los nodos del cluster. [mongodb](https://www.mongodb.com/docs/atlas/resilient-application/?interface=driver&language=nodejs)

```env
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/booking_system?retryWrites=true&w=majority
```

- Guardá la URI solo en `.env`, que debe estar en `.gitignore`.
- Usá `.env.example` con placeholders, nunca credenciales reales.
- `retryWrites=true` permite reintentar una vez ciertas escrituras ante fallos transitorios o elecciones de réplica. [mongodb](https://www.mongodb.com/docs/atlas/resilient-application/?interface=driver&language=nodejs)
- `w=majority` solicita confirmación de escritura desde la mayoría de los miembros con datos del replica set; mejora durabilidad a cambio de mayor latencia. [mongodb](https://www.mongodb.com/docs/atlas/resilient-application/?interface=driver&language=nodejs)
- En Atlas, creá un usuario de base de datos con permisos mínimos para la aplicación y restringí el acceso por IP cuando corresponda.

## Conexión centralizada

Una implementación más robusta que la versión mínima sería:

```js
// src/config/database.config.js
import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI no está definida');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB conectado');
  });

  mongoose.connection.on('error', (error) => {
    console.error('Error de MongoDB:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB desconectado');
  });
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
```

En el punto de entrada:

```js
try {
  await connectDatabase(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
} catch (error) {
  console.error('No se pudo iniciar la aplicación:', error);
  process.exit(1);
}
```

`process.exit(1)` es apropiado si la aplicación no puede operar sin base de datos; en un contenedor o plataforma cloud, el proceso debe finalizar para que el orquestador pueda reiniciarlo.

## Modelado de dominio

Para `booking_system`, el modelado propuesto es razonable, pero conviene explicitar índices, unicidad y reglas de negocio.

```js
// src/models/service.model.js
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, 'La duración debe ser al menos 1 minuto'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo'],
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
```

```js
// src/models/booking.model.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      match: [/^( [mongoosejs](https://mongoosejs.com/docs/validation.html)\d|2[0-3]):[0-5]\d$/, 'Formato de hora inválido'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

bookingSchema.index(
  { date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } },
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
```

El índice parcial evita dos reservas activas en exactamente la misma fecha y hora, mientras permite conservar históricos de reservas canceladas. MongoDB no valida por sí solo disponibilidad de horarios, solapamientos con duración ni capacidad; eso debe implementarse en la capa de servicio antes de persistir.

## Validaciones y hooks

Mongoose trata la validación como middleware y la ejecuta automáticamente antes de `save()`; los validadores integrados incluyen `required`, `enum`, `min`, `max`, `match`, `minLength` y `maxLength`. [mongoosejs](https://mongoosejs.com/docs/validation.html)

```js
messageSchema.pre('validate', function () {
  if (this.message) {
    this.message = this.message.trim();
  }
});
```

Para un hook que necesita el documento, usá función tradicional:

```js
bookingSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'cancelled') {
    this.set('cancellationReason', this.cancellationReason ?? 'Sin motivo especificado');
  }
  next();
});
```

El uso de `function` es necesario porque `this` referencia el documento; una arrow function hereda el `this` léxico del ámbito exterior y no permite ese acceso. Mongoose admite tanto `next()` como funciones `async` que devuelven promesas, y los hooks deben registrarse antes de compilar el modelo con `mongoose.model()`. [mongoosejs](https://mongoosejs.com/docs/middleware.html)

## Consultas con referencias

Para listar reservas con los servicios asociados:

```js
const bookings = await Booking.find({ status: 'confirmed' })
  .populate('services.service', 'name price duration')
  .sort({ date: 1, time: 1 })
  .lean();
```

`populate` realiza consultas adicionales para resolver los documentos referenciados. Para listados grandes, considerá `lean()` —devuelve objetos JavaScript planos, más livianos— y proyectá solo los campos necesarios.

## Riesgos a vigilar

- **Credenciales en el repositorio:** nunca commitear `.env`; rotar credenciales si una URI fue expuesta.
- **Concurrencia de reservas:** un índice único evita duplicados exactos, pero no resuelve por sí solo reservas simultáneas para el mismo horario; usá transacciones cuando la operación afecte múltiples documentos o requiera consistencia fuerte.
- **Validación incompleta en updates:** las validaciones de schema no siempre se aplican igual en operaciones de actualización directa; validá el payload en la capa de controladores/servicios y usá opciones como `runValidators` cuando corresponda.
- **Referencias huérfanas:** antes de eliminar un `Service`, verificá si existe en reservas activas o implementá borrado lógico con `available: false`.
- **Fechas y husos horarios:** almacená `Date` en UTC y convertí a la zona horaria de Buenos Aires al mostrar o interpretar horarios.

El diseño propuesto queda bien alineado con una API REST de reservas: `services` como catálogo, `bookings` como transacciones de reserva con referencias, y `messages` como registro de comunicaciones. [mongoosejs](https://mongoosejs.com/docs/validation.html)
