## Ejercicio

* **Nombre de la clase**: Sesión en Vivo: Dominando el Backend con Node.js y JavaScript Avanzado.
* **Temario a ver (Temas clave)**:
  * Arquitectura interna de Node.js (Event Loop y libuv).
  * Manejo avanzado de I/O no bloqueante.
  * Patrones asíncronos maestros: Refactorización pasando de promesas básicas a flujos `async/await` robustos con manejo de errores profesional.
  * Arquitectura de servicios aplicando ESM (ECMAScript Modules) y Clean Code.
  * Debugging de alto nivel para identificar cuellos de botella y errores comunes en producción.
* **Ejercicios y actividades**:
  * **Live-Coding participativo**: Construcción en vivo de la clase administradora de servicios.
  * **Retos de debugging en tiempo real**: Resolución de errores de ejecución y fallos asíncronos planteados por el instructor.
  * **Sprint de optimización**: Ejercicio final enfocado en aplicar escalabilidad mediante el uso de clusters.

***

## Bloque 1: Entendiendo el Event Loop y Libuv 

### Ejercicio 1.1: El Predictor de Ejecución (Visualización del Event Loop)

**Objetivo:** Comprender las fases del Event Loop (Call Stack, Microtasks/Promesas, Macrotasks/Timers, `process.nextTick`).

**Consigna para el alumno:**
Sin ejecutar el siguiente código en la terminal, analiza el flujo de ejecución e indica en qué orden exacto se imprimirán los mensajes en la consola.

```javascript
import fs from 'node:fs';

console.log('1. Inicio del script');

setTimeout(() => {
  console.log('2. setTimeout (0ms)');
}, 0);

setImmediate(() => {
  console.log('3. setImmediate');
});

Promise.resolve().then(() => {
  console.log('4. Promesa resuelta (Microtask)');
});

process.nextTick(() => {
  console.log('5. process.nextTick');
});

fs.readFile(import.meta.filename, () => {
  console.log('6. Lectura de archivo completada (I/O Callback)');
});

console.log('7. Fin del script');

```

**Reto práctico extra:** Ejecuta el archivo con Node.js (`node event-loop.js`). ¿Coincidió tu predicción? ¿Qué sucede si ejecutas el script 5 veces seguidas con respecto al orden entre `setTimeout` y `setImmediate`?


### Orden exacto de salida en consola:

1. `1. Inicio del script`
2. `7. Fin del script`
3. `5. process.nextTick`
4. `4. Promesa resuelta (Microtask)`
5. `2. setTimeout (0ms)`
6. `3. setImmediate`
7. `6. Lectura de archivo completada (I/O Callback)`

### Explicación técnica:

* **Sincrónico (Call Stack):** Se ejecutan inmediatamente `1` y `7`.
* **Microtasks Phase:** Al vaciarse el Call Stack, Node ejecuta prioritariamente las microtareas. `process.nextTick` tiene máxima prioridad sobre la cola de Promesas, por lo que imprime `5` y luego `4`.
* **Timers Phase:** Entra al ciclo del Event Loop. `setTimeout` de 0ms se ejecuta en la fase de Timers (`2`).
* **Check Phase:** `setImmediate` se ejecuta en la fase Check (`3`). *(Nota: El orden entre `setTimeout(0)` y `setImmediate` en el *main module* puede diferir milisegundalmente por latencia de inicialización del Timer de Libuv, pero dentro de un callback de I/O `setImmediate` siempre se ejecuta primero)*.
* **I/O Callbacks:** La lectura del disco toma tiempo de I/O físico (Libuv thread pool) y su callback entra al Event Loop cuando se completa (`6`).



---

## Bloque 2: Refactorización Asíncrona y Manejo de Errores 

### Ejercicio 2.1: De "Callback Hell" a Clean `async/await`

**Objetivo:** Refactorizar un módulo legado que utiliza callbacks a código moderno con `fs/promises` y bloques `try/catch/finally`.

**Código legacy a refactorizar:**

```javascript
// legacyService.js
import fs from 'fs';

function cargarServicios(path, callback) {
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      callback('Error leyendo el archivo', null);
    } else {
      try {
        const servicios = JSON.parse(data);
        callback(null, servicios);
      } catch (e) {
        callback('Error al parsear el JSON', null);
      }
    }
  });
}

```

**Consigna para el alumno:**

1. Refactoriza la función utilizando `fs/promises` y sintaxis ESM (`import`).
2. Implementa una clase o función `obtenerServicios(path)` que use `async/await`.
3. Crea un sistema de **errores personalizados** (ej. `ServiceNotFoundError` o `InvalidDataError`) lanzados según el tipo de fallo detectado.

### 1. `src/errors/customErrors.js`

```javascript
export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class ServiceNotFoundError extends ServiceError {
  constructor(id) {
    super(`El servicio con ID "${id}" no existe.`, 404);
  }
}

export class InvalidDataError extends ServiceError {
  constructor(message) {
    super(`Error de datos: ${message}`, 400);
  }
}

```

### 2. `src/services/legacyServiceRefactored.js`

```javascript
import fs from 'node:fs/promises';
import { InvalidDataError, ServiceNotFoundError } from '../errors/customErrors.js';

export async function cargarServicios(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new ServiceNotFoundError(filePath);
    }
    if (error instanceof SyntaxError) {
      throw new InvalidDataError('El archivo de datos contiene JSON inválido.');
    }
    throw error;
  }
}

```

---

## Bloque 3: Arquitectura de Servicios — Sistema de Reservas 

### Ejercicio 3.1: Construcción del `ServiceManager`

**Objetivo:** Aplicar principios de Clean Code, modulación ESM y lógica de negocio asíncrona para un administrador de servicios.

**Estructura de archivos propuesta:**

```bash
src/
├── services/
│   └── serviceManager.js
├── data/
│   └── services.json
├── errors/
│   └── customErrors.js
└── index.js

```

**Consigna para el alumno:**
Implementa la clase `ServiceManager` en `src/services/serviceManager.js` con las siguientes especificaciones:

1. **`obtenerServicioPorId(id)`**: Busca un servicio en `services.json`. Si no existe, debe simular un retardo de red (100ms) y lanzar una excepción de negocio.
2. **`reservarServicio(idServicio, usuarioId)`**:
* Verifica la disponibilidad del servicio.
* Si está disponible, cambia su estado a `"reservado"` y actualiza de forma asíncrona y segura el archivo `services.json`.
* Utiliza concurrencia segura simulando tiempo de procesamiento mediante `setTimeout` promisificado.



```javascript
// src/services/serviceManager.js
import fs from 'node:fs/promises';

export class ServiceManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async getAll() {
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  async obtenerServicioPorId(id) {
    const servicios = await this.getAll();
    const servicio = servicios.find(s => s.id === id);
    if (!servicio) {
      throw new Error(`El servicio con ID ${id} no fue encontrado.`);
    }
    return servicio;
  }

  async reservarServicio(idServicio, cliente) {
    // TODO: Implementar la validación y persistencia
  }
}

```


### `src/services/serviceManager.js`

```javascript
import fs from 'node:fs/promises';
import { ServiceNotFoundError, InvalidDataError } from '../errors/customErrors.js';

export class ServiceManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw new InvalidDataError('No se pudo leer la base de datos de servicios.');
    }
  }

  async obtenerServicioPorId(id) {
    // Simular latencia de red/I/O de 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));

    const servicios = await this.getAll();
    const servicio = servicios.find((s) => s.id === id);

    if (!servicio) {
      throw new ServiceNotFoundError(id);
    }

    return servicio;
  }

  async reservarServicio(idServicio, cliente) {
    const servicios = await this.getAll();
    const index = servicios.findIndex((s) => s.id === idServicio);

    if (index === -1) {
      throw new ServiceNotFoundError(idServicio);
    }

    if (servicios[index].estado === 'reservado') {
      throw new InvalidDataError(`El servicio "${servicios[index].nombre}" ya está reservado.`);
    }

    // Actualizar estado
    servicios[index].estado = 'reservado';
    servicios[index].reservadoPor = cliente;
    servicios[index].updatedAt = new Date().toISOString();

    // Persistir de forma asíncrona
    await fs.writeFile(this.filePath, JSON.stringify(servicios, null, 2), 'utf-8');

    return servicios[index];
  }
}

```


---

## Bloque 4: Sprint de Optimización y Concurrencia 

### Ejercicio 4.1: Live Debugging y Bloqueo del Event Loop

**Objetivo:** Diagnosticar una ruta/función que bloquea el servidor backend y solucionar la sobrecarga de CPU.

**Código con cuello de botella (Problemático):**

```javascript
import http from 'node:http';

// Función con carga de CPU pesada que bloquea el Event Loop
function calcularEstadisticasPesadas() {
  let count = 0;
  for (let i = 0; i < 5e9; i++) {
    count += i;
  }
  return count;
}

const server = http.createServer((req, res) => {
  if (req.url === '/heavy') {
    const result = calcularEstadisticasPesadas(); // BLOQUEANTE
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end(`Resultado: ${result}`);
  }

  if (req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('pong');
  }
});

server.listen(3000, () => console.log('Servidor en puerto 3000'));

```

**Desafío para la clase:**

1. Abre dos pestañas o terminales. Haz una petición a `/heavy` e inmediatamente otra a `/ping`. ¿Qué sucede con la petición a `/ping`? ¿Por qué se congela si Node.js es "asíncrono"?
2. **Solución en vivo:** Refactorizar la tarea pesada utilizando el módulo **`node:worker_threads`** o **`node:cluster`** para liberar la hebra principal del servidor.

***

```js
import http from 'node:http';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';

const ITERACIONES = 5e9; // ajustalo para que tarde 3-5 segundos en tu máquina

const calculoPesado = `
  const { parentPort } = require('node:worker_threads');
  let suma = 0;
  for (let i = 0; i < ${ITERACIONES}; i++) suma += i;
  parentPort.postMessage(suma);
`;

http.createServer(async (req, res) => {
  // Bloqueante: el cálculo corre en el hilo principal
  if (req.url === '/heavyBlocker') {
    let suma = 0;
    for (let i = 0; i < ITERACIONES; i++) suma += i;
    return res.end(`Resultado (bloqueante): ${suma}`);
  }

  // No bloqueante: el cálculo corre en un worker thread
  if (req.url === '/heavy') {
    const worker = new Worker(calculoPesado, { eval: true });
    const [resultado] = await once(worker, 'message');
    return res.end(`Resultado (worker): ${resultado}`);
  }

  if (req.url === '/ping') return res.end('pong');

  res.writeHead(404).end('Not Found');
}).listen(3000, () => console.log('http://localhost:3000'));
```

**Demostración en clase:**

1. Abrí `/heavyBlocker` y, mientras carga, abrí `/ping` en otra pestaña. `/ping` queda colgado hasta que termina el cálculo, porque el event loop está ocupado.
2. Repetí con `/heavy` y luego `/ping`. Ahora `/ping` responde al instante, porque el cálculo corre en otro hilo.

Para hacerlo más visual desde la terminal, podés lanzar ambas peticiones juntas y medir tiempos:

```bash
# Bloqueante: /ping tarda varios segundos
curl http://localhost:3000/heavyBlocker & time curl http://localhost:3000/ping

# No bloqueante: /ping responde de inmediato
curl http://localhost:3000/heavy & time curl http://localhost:3000/ping
```

Un detalle para tener en cuenta: los navegadores a veces serializan peticiones a la misma URL o reutilizan conexiones, así que `curl` suele dar una demostración más limpia que las pestañas.
