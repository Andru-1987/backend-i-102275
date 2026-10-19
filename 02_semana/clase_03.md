### 3. Contenido de la primera sesión: Temario a ver y ejercicios

* **Nombre de la clase**: Sesión en Vivo: Dominando Express y Arquitecturas REST.
* **Temario a ver**:
  * Diseño de API de alto nivel aplicando el **Modelo de Madurez de Richardson** (recursos, verbos HTTP y HATEOAS).
  * **Arquitectura de middlewares**: Cómo influye el orden de ejecución en la seguridad y el flujo del servidor.
  * Gestión centralizada y documentada de errores para evitar que el servidor caiga en producción.
  * Estrategias de **validación, seguridad e idempotencia** en peticiones.
  * Principio de **Statelessness** (servidor sin estado) en arquitecturas REST.
* **Ejercicios y actividades**:
  * **Rally de Debugging: Rescatando el Servidor (15 min)**: Diagnóstico e identificación en vivo de errores lógicos y técnicos en un servidor Express con fallas (middlewares desordenados, falta de `express.json()` o rutas superpuestas).
  * **Desafío de Diseño: Arquitectura de Carrito de Compras (25 min)**: Trabajo en subgrupos para diseñar las rutas REST, middlewares necesarios (autenticación, roles, cuerpo) y códigos de estado HTTP para un sistema de carrito de compras.
  * **Debate Técnico: El Estado de la API (10 min)**: Discusión abierta sobre las implicaciones y ventajas de construir servicios *Stateless*.

***

## 1. Conceptos del Temario

### Modelo de Madurez de Richardson

[Richardson Maturity model | Glory of Rest](https://medium.com/@davisaac8/modelo-de-madurez-de-richardson-637f77e06dba)
Clasifica las APIs en 4 niveles según su adhesión a REST:

* **Nivel 0 (POX/RPC):** Un único endpoint (ej. `/api`) y un solo método (usualmente `POST`) para todas las operaciones.
* **Nivel 1 (Recursos):** Se separan las entidades en URIs distintas (ej. `/productos`, `/usuarios`), pero con un único verbo HTTP.
* **Nivel 2 (Verbos HTTP):** Uso correcto de verbos (`GET`, `POST`, `PUT`, `DELETE`) y códigos de estado HTTP (`200`, `201`, `400`, `404`, `500`).
* **Nivel 3 (HATEOAS):** La respuesta incluye enlaces hipermedia para guiar al cliente sobre qué acciones puede realizar a continuación.

```json
// Ejemplo de respuesta Nivel 3 (HATEOAS)
{
  "id": 10,
  "producto": "Teclado Mecánico",
  "precio": 85,
  "_links": {
    "self": { "href": "/api/productos/10", "method": "GET" },
    "update": { "href": "/api/productos/10", "method": "PUT" },
    "delete": { "href": "/api/productos/10", "method": "DELETE" }
  }
}

```

---

### Arquitectura de Middlewares

Un middleware es una función que accede a `req`, `res` y `next`. El orden de declaración es crítico porque Express ejecuta las funciones de forma secuencial:

1. **Middlewares globales** (parseo JSON, CORS, loggers) van al inicio.
2. **Autenticación y Autorización** van antes de las rutas protegidas.
3. **Manejadores de rutas** procesan la petición.
4. **Manejadores de errores** siempre van al final.

```js
import express from 'express';

const app = express();

// 1. Parsing global
app.use(express.json());

// 2. Middleware personalizado de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 3. Ruta
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

```

---

### Gestión Centralizada de Errores

Para evitar que una excepción no capturada tire el proceso de Node.js, Express captura los errores pasados a `next(error)` mediante un middleware especial de 4 parámetros `(err, req, res, next)`.

```js
// Middleware centralizado de errores (al final del archivo)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
});

```

---

### Validación, Seguridad e Idempotencia

* **Validación:** Comprobar que los datos de entrada existen y cumplen la estructura esperada antes de procesarlos.
* **Seguridad:** Filtrar entradas para evitar inyecciones y no exponer stack traces en producción.
* **Idempotencia:** Un método es idempotente si ejecutarlo múltiples veces produce el mismo resultado en el servidor.
* **Idempotentes:** `GET`, `PUT`, `DELETE`.
* **No idempotentes:** `POST` (crea un nuevo recurso cada vez).



---

### Principio de Statelessness (Servidor Sin Estado)

El servidor no guarda ninguna sesión del cliente en memoria entre peticiones. Cada solicitud debe contener toda la información necesaria para procesarse (por ejemplo, enviando un token JWT en el encabezado `Authorization`).

---

## 2. Ejercicios y Actividades

### Actividad 1: Rally de Debugging (Código Corregido)

A continuación se muestra el servidor con los errores típicos corregidos y comentados:

```js
import express from 'express';

const app = express();

// CORRECCIÓN 1: express.json() debe ir ANTES de las rutas
app.use(express.json());

// CORRECCIÓN 2: Middleware de loggeo
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Base de datos simple en memoria
const usuarios = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Carlos' }
];

// CORRECCIÓN 3: Orden de rutas superpuestas.
// Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos (:id)
app.get('/usuarios/buscar', (req, res) => {
  const { q } = req.query;
  const resultado = usuarios.filter(u => u.nombre.toLowerCase().includes((q || '').toLowerCase()));
  res.json(resultado);
});

app.get('/usuarios/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    return next(error); // Pasa el error al middleware centralizado
  }

  res.json(usuario);
});

app.post('/usuarios', (req, res, next) => {
  const { nombre } = req.body;

  // Validación básica
  if (!nombre) {
    const error = new Error('El campo "nombre" es obligatorio');
    error.status = 400;
    return next(error);
  }

  const nuevoUsuario = { id: usuarios.length + 1, nombre };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

// CORRECCIÓN 4: Middleware centralizado de errores SIEMPRE al final
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

```

---

### Actividad 2: Desafío de Diseño — Carrito de Compras

#### Tabla de Diseño REST y Middlewares

| Verbo | Ruta | Función | Middlewares requeridos | Código HTTP |
| --- | --- | --- | --- | --- |
| `GET` | `/api/carrito` | Obtener ítems del carrito | `autenticar` | `200 OK` |
| `POST` | `/api/carrito/items` | Agregar producto al carrito | `autenticar`, `validarItemBody` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/carrito/items/:id` | Modificar cantidad de un ítem | `autenticar`, `validarCantidad` | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/carrito/items/:id` | Eliminar ítem del carrito | `autenticar` | `200 OK` / `204 No Content` |
| `POST` | `/api/carrito/checkout` | Finalizar compra y vaciar | `autenticar`, `esRolCliente` | `200 OK` / `400 Bad Request` |

#### Implementación del Carrito en Express (ES Modules)

```js
import express from 'express';

const app = express();
app.use(express.json());

// Simulación de base de datos de carritos por usuario
const carritos = {
  'usr-123': [
    { idProducto: 101, cantidad: 2, precio: 15.00 }
  ]
};

// Middleware de Autenticación simple (Stateless mediante Token simulado)
const autenticar = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso no provisto' });
  }
  // Simulamos extraer el ID de usuario del token
  req.usuarioId = 'usr-123';
  next();
};

// Middleware de Validación
const validarItemBody = (req, res, next) => {
  const { idProducto, cantidad } = req.body;
  if (!idProducto || !cantidad || cantidad <= 0) {
    return res.status(400).json({ error: 'idProducto y cantidad (mayor a 0) son requeridos' });
  }
  next();
};

// Rutas
app.get('/api/carrito', autenticar, (req, res) => {
  const carrito = carritos[req.usuarioId] || [];
  res.json({
    items: carrito,
    _links: {
      checkout: { href: '/api/carrito/checkout', method: 'POST' }
    }
  });
});

app.post('/api/carrito/items', autenticar, validarItemBody, (req, res) => {
  const { idProducto, cantidad } = req.body;
  
  if (!carritos[req.usuarioId]) {
    carritos[req.usuarioId] = [];
  }

  const carrito = carritos[req.usuarioId];
  const itemExistente = carrito.find(item => item.idProducto === idProducto);

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ idProducto, cantidad, precio: 20.00 });
  }

  res.status(201).json({ mensaje: 'Producto agregado al carrito', carrito });
});

app.post('/api/carrito/checkout', autenticar, (req, res) => {
  const carrito = carritos[req.usuarioId];
  if (!carrito || carrito.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  // Vaciar carrito tras la compra
  carritos[req.usuarioId] = [];
  res.status(200).json({ mensaje: 'Orden procesada con éxito' });
});

app.listen(3000, () => console.log('API de Carrito escuchando en puerto 3000'));

```

---

### Actividad 3: Debate Técnico — El Estado de la API

* **Ventajas de una API *Stateless*:**
* **Escalabilidad horizontal:** Cualquier nodo o servidor puede responder a cualquier petición, ya que no depende de variables o sesiones almacenadas en la memoria local.
* **Simplicidad en el servidor:** No se requiere sincronización ni almacenamiento persistente de sesiones entre servidores detras de un balanceador de carga.
* **Caché eficiente:** Respuestas a peticiones idempotentes (`GET`) pueden almacenarse en CDN o navegadores fácilmente.


* **Desventajas / Desafíos:**
* **Payload más grande:** Cada petición debe incluir las credenciales (ej. JWT) y el contexto necesario, lo que incrementa ligeramente el tamaño de las cabeceras HTTP.
* **Complejidad en el cliente:** El cliente (frontend o móvil) asume la responsabilidad de almacenar y gestionar el estado de la aplicación.


