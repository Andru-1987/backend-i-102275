# El gran cambio de paradigma en el backend

### Puntos principales

* **El gran cambio de paradigma en el backend**:
  * **Modelo tradicional vs. Node.js**: Los entornos tradicionales (PHP, Java) utilizaban un modelo multi-hilo y bloqueante donde cada petición consumía un hilo de ejecución completo. Node.js introduce un modelo de **E/S (Entrada/Salida) no bloqueante y orientado a eventos**, diseñado para gestionar miles de conexiones concurrentes de forma eficiente sin bloquear el servidor.
* **Pilares de Node.js**:
  * **Motor V8**: Compilador JIT (Just-In-Time) escrito en C++ por Google que traduce el código JavaScript a código máquina de alto rendimiento.
  * **libuv**: Biblioteca nativa de C++ encargada de la gestión del sistema operativo (lectura de archivos, conexiones de red y pool de hilos), haciendo posible el comportamiento no bloqueante.
* **El Event Loop (Bucle de Eventos)**:
  * **Concurrencia en un solo hilo**: Delega las operaciones pesadas de E/S al sistema operativo/libuv y atiende los callbacks cuando dichas tareas finalizan.
  * **Fases del ciclo**: Se dividen en *Timers* (`setTimeout`, `setInterval`), *Pending Callbacks*, *Poll* (sondeo de I/O), *Check* (`setImmediate`) y *Close*.
  * **Microtareas**: Métodos como `process.nextTick()` añaden callbacks a una cola inmediata que se procesa justo después de la operación actual, antes de continuar a la siguiente fase del Event Loop.
* **Diferencias críticas entre Navegador y Backend**:
  * Cambio de objeto global (`window` en Frontend vs. `global` en Node.js).
  * Acceso directo al sistema de archivos (`fs`), gestión de procesos del sistema operativo (`process`) y ausencia de elementos DOM/BOM (`document`, `alert`).
* **Configuración inicial y ESM (ECMAScript Modules)**:
  * Activación de módulos ES modernos incluyendo `"type": "module"` en el archivo `package.json`.
  * Obligatoriedad de incluir la extensión `.js` en las importaciones locales (ejemplo: `import { app } from './app.js'`).
  * Creación de scripts de ejecución (`"start"` y `"dev"` con `node --watch`).
* **Estructura modular de carpetas**:
  * Organización basada en la separación de responsabilidades creando carpetas como `src/`, `config/`, `routes/`, `controllers/`, `services/`, `repositories/`, `dao/`, `models/`, `middlewares/` y `utils/`.
  * Separación clave entre `app.js` (configuración del sistema) y `server.js` (punto de entrada que levanta el servidor).
* **Gestión segura de variables de entorno con `dotenv`**:
  * Aplicación de la metodología **12-Factor App** para separar el código fuente de la configuración y credenciales.
  * Uso de `.env` para credenciales locales (añadido en `.gitignore`) y `.env.example` como plantilla para el repositorio.
  * Validación **Fail-Fast** en `src/config/env.config.js` para detener la aplicación si faltan variables críticas al iniciar.

***

Node.js no es “JavaScript más rápido”: es un **runtime de servidor** que combina el motor V8 con libuv para ejecutar JavaScript de forma orientada a eventos y con E/S no bloqueante. Su valor arquitectónico principal es manejar muchas conexiones concurrentes con pocos hilos, siempre que el trabajo dominante sea E/S y no cómputo intensivo. [nodejs](https://nodejs.org/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

## Modelo tradicional vs. Node.js

### Qué cambió

| Dimensión | Modelo tradicional por hilo | Modelo Node.js orientado a eventos |
|---|---|---|
| Unidad de concurrencia | Un hilo por conexión o petición | Un hilo principal de JavaScript más un pool de workers para tareas nativas |
| Espera de E/S | El hilo puede quedar bloqueado esperando disco, red o base de datos | La espera se delega al sistema operativo/libuv; el hilo JS continúa atendiendo otros eventos |
| Costo de muchas conexiones | Alto consumo de memoria y cambios de contexto | Bajo costo por conexión mientras las tareas sean mayormente E/S |
| Modelo mental | “Cada petición tiene su ejecución dedicada” | “Las peticiones producen eventos; los callbacks procesan sus resultados” |
| Riesgo principal | Agotamiento de hilos bajo carga | Bloqueo del event loop por código síncrono o CPU-bound |

En los entornos tradicionales, un servidor podía asignar un hilo a cada solicitud; si esa solicitud esperaba una consulta lenta, el hilo quedaba reservado durante la espera. Node.js invierte el modelo: registra interés en una operación asíncrona, libera el hilo de JavaScript y ejecuta el callback cuando el resultado está disponible. [nodejs](https://nodejs.org/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

### Cómo funciona internamente

- El código JavaScript se ejecuta en el **event loop**, no en un hilo por petición.
- Las operaciones de red, disco, timers y otros recursos se coordinan con libuv y el sistema operativo.
- Cuando una operación termina, su callback entra en una cola y el event loop lo ejecuta cuando corresponda.
- Node.js también dispone de un **worker pool** para ciertas tareas costosas, como parte del sistema de archivos, criptografía, compresión y procesos hijos. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)

### Trade-off fundamental

Node.js es excelente para workloads **I/O-bound**: APIs HTTP, proxies, gateways, WebSockets, integraciones con bases de datos y servicios externos. Es menos adecuado, sin adaptación, para tareas **CPU-bound** prolongadas —por ejemplo, procesamiento pesado de imágenes, cifrado masivo o transformaciones de datos— porque pueden retrasar todos los callbacks pendientes. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)

### Tips prácticos y buenas prácticas

- **Nunca** asumas que “Node es single-threaded” en sentido absoluto: JavaScript corre en un hilo principal, pero el runtime tiene workers nativos y mecanismos para paralelismo. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)
- Mantén cada callback, handler y middleware corto; si una operación tarda mucho, muévela a un worker, cola o proceso especializado. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)
- Evita APIs síncronas de E/S, compresión, criptografía o procesos hijos dentro del request path de un servidor. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)
- Diseña para **backpressure**: si el consumidor es más lento que el productor, no acumules datos indefinidamente en memoria.
- No confundas concurrencia con paralelismo: Node logra alta concurrencia con un hilo JS, pero el paralelismo real requiere workers o procesos.

## Pilares de Node.js: V8 y libuv

### Motor V8

V8 es el motor JavaScript y WebAssembly de Google, escrito en C++, utilizado por Chrome y Node.js. Se encarga de analizar y ejecutar JavaScript, administrar memoria de objetos y recolectar los objetos que ya no se usan. [v8](https://v8.dev/docs)

Su modelo JIT es progresivo:

1. El código se parsea y se transforma en bytecode.
2. El bytecode se interpreta inicialmente.
3. Las funciones “calientes” —ejecutadas muchas veces— se optimizan a código máquina.
4. Si las suposiciones de optimización dejan de cumplirse, V8 puede desoptimizar y volver a una ejecución menos optimizada. [v8](https://v8.dev/blog/background-compilation)

**Concepto clave:** V8 optimiza por observación del comportamiento real del programa. Código predecible, con tipos y formas de objetos estables, suele optimizarse mejor que código altamente dinámico y polimórfico.

### libuv

libuv es la capa de abstracción del sistema operativo que hace viable el modelo asíncrono de Node.js. Coordina event loops, timers, sockets, operaciones de sistema de archivos, procesos y un pool de hilos para tareas que el sistema operativo no expone de forma completamente asíncrona. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)

Su responsabilidad conceptual es separar dos mundos:

```bash
JavaScript (V8)
      |
      v
Node.js APIs / Event Loop
      |
      v
libuv  ---> Sistema operativo / red / disco / timers / worker pool
```

### Tips prácticos y buenas prácticas

- Piensa en V8 como el **ejecutor del lenguaje** y en libuv como el **integrador con el sistema operativo**.
- No atribuyas toda la concurrencia a V8: V8 ejecuta JavaScript; libuv y el sistema operativo participan en la E/S.
- Evita microoptimizaciones prematuras: primero elimina bloqueos del event loop y luego mide con perfiles reales.
- Usa estructuras de datos estables y evita cambios frecuentes de “forma” en objetos muy utilizados si el rendimiento es crítico.
- No realices trabajo pesado dentro de un callback de red: separa orquestación, cómputo y persistencia.

## El Event Loop

### Concurrencia en un solo hilo

El event loop es el mecanismo que permite a Node.js atender múltiples operaciones concurrentes sin crear un hilo JavaScript por conexión. El hilo principal ejecuta callbacks rápidamente; las esperas de E/S se externalizan y los resultados regresan como eventos. [nodejs](https://nodejs.org/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

El modelo mental correcto es:

```bash
Llega petición
   -> registrar operación asíncrona
   -> liberar hilo JS
   -> atender otras peticiones/eventos
   -> llega resultado de E/S
   -> ejecutar callback asociado
```

### Fases del ciclo

Node.js organiza los callbacks en fases; cada fase tiene una cola FIFO y se procesa hasta agotarla o alcanzar un límite antes de avanzar. [nodejs](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick)

| Fase | Propósito conceptual | Ejemplos |
|---|---|---|
| **Timers** | Ejecuta callbacks de temporizadores cuyo umbral ya venció | `setTimeout`, `setInterval` |
| **Pending callbacks** | Ejecuta callbacks de E/S diferidos de una iteración anterior | Ciertos errores o resultados del sistema |
| **Idle / prepare** | Uso interno del runtime | No es una fase de aplicación |
| **Poll** | Obtiene nuevos eventos de E/S y ejecuta la mayoría de sus callbacks; puede bloquear esperando trabajo si corresponde | Sockets, archivos, red |
| **Check** | Ejecuta callbacks de `setImmediate` | Tareas que deben correr después del poll |
| **Close** | Ejecuta callbacks de cierre | `socket.on('close', ...)` |

Los timers no garantizan ejecución exacta: `setTimeout(fn, 0)` significa “no antes de 0 ms”, no “exactamente a 0 ms”. La demora real depende de la carga del event loop y de las colas previas. [nodejs](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick)

### Microtareas

Las microtareas no son una fase del event loop: se drenan después del callback o fase actual, antes de que Node avance a la siguiente unidad de trabajo macro. `process.nextTick` tiene prioridad sobre las microtareas de promesas; ambas suelen ejecutarse antes que un `setTimeout` programado posteriormente. [paths.grasp](https://paths.grasp.study/modules/aa18ab5f-9e74-47c9-ab86-7f7fdeedd175/lessons/6e892eb6-0071-417d-b70d-6515028a53cf)

Orden conceptual simplificado:

```bash
Callback actual
  -> process.nextTick queue
  -> Promise microtask queue
  -> siguiente callback / fase del event loop
```

### Tips prácticos y buenas prácticas

- **Nunca** uses `process.nextTick` de forma recursiva sin límite: puede starving el event loop e impedir que avancen timers e I/O.
- Usa microtareas para continuar trabajo inmediato tras una operación asíncrona; usa timers para diferir trabajo a una iteración posterior.
- No uses `setTimeout(..., 0)` como mecanismo de prioridad: su semántica es de umbral mínimo, no de ejecución inmediata garantizada.
- Evita mezclar `setImmediate` y `setTimeout` esperando un orden universal en todos los contextos; el orden puede depender de dónde se programan.
- Diseña handlers idempotentes y tolerantes a reintentos: en sistemas orientados a eventos, un mismo evento puede procesarse más de una vez ante fallos.

## Diferencias críticas entre navegador y backend

### Cambio de entorno de ejecución

JavaScript es el lenguaje, pero el navegador y Node.js ofrecen **runtimes distintos**. El navegador provee DOM, BOM y APIs web; Node.js provee acceso al proceso, sistema de archivos, red, módulos y herramientas de servidor. [v8](https://v8.dev/docs)

| Concepto | Navegador | Node.js |
|---|---|---|
| Objeto global histórico | `window` | `global` |
| Ámbito superior de un módulo | Depende del sistema de módulos | No es el global; las declaraciones de módulo son locales al módulo |
| DOM | `document`, elementos, eventos de UI | No existe |
| BOM | `window`, `location`, `navigator`, `alert` | No existe |
| Sistema de archivos | Acceso restringido o mediado por APIs web | Acceso directo mediante el módulo `fs` |
| Proceso del sistema | Limitado | `process` expone información y control del proceso actual |
| Caso de uso principal | Interfaz e interacción del usuario | Servicios, APIs, automatización, integraciones |

En Node.js, `process` es un objeto global que ofrece información y control sobre el proceso actual, incluyendo argumentos, entorno, señales y streams estándar. [nodejs](https://nodejs.org/download/release/v4.2.2/docs/api/process.html)

### Tips prácticos y buenas prácticas

- **Nunca** escribas lógica de negocio que dependa de `window` o `document` si pensás reutilizarla en backend.
- Aísla el acceso a `process.env`, `fs` y `process` en una capa de configuración o infraestructura; el dominio debe permanecer agnóstico del runtime.
- No uses variables globales como estado compartido: en Node, cada módulo tiene su propio ámbito superior y el estado global dificulta pruebas y concurrencia. [nodejs](https://nodejs.org/download/release/v12.13.0/docs/api/globals.html)
- Tratá el filesystem como un recurso externo: valida rutas, permisos y tamaños; no confíes en entradas del usuario para construir rutas.
- Distingue entre errores de programación, errores operacionales y errores de entrada del usuario; cada categoría requiere una estrategia distinta.

## Configuración inicial y ESM

### Qué es ESM

ECMAScript Modules es el sistema de módulos estándar de JavaScript. En Node.js, el campo `"type": "module"` del `package.json` indica que los archivos `.js` del paquete deben interpretarse como módulos ES; sin ese campo, `.js` se trata como CommonJS por defecto. [nodejs](https://nodejs.org/api/packages.html)

### Resolución de importaciones

En ESM, las especificaciones relativas o absolutas deben incluir la extensión del archivo. Por ejemplo, una importación local debe referenciar explícitamente `./app.js`; no basta con `./app`. [beta.docs.nodejs](https://beta.docs.nodejs.org/esm.json)

```js
Correcto conceptualmente:
import { app } from './app.js'

Incorrecto en ESM Node:
import { app } from './app'
```

Esto ocurre porque el resolvedor de ESM no aplica la misma resolución implícita de extensiones e índices que CommonJS. [nodejs](https://nodejs.org/download/release/v12.0.0/docs/api/esm.html)

### Scripts de ejecución

Los scripts de `package.json` son el contrato de ejecución del proyecto. Conceptualmente:

- `start`: comando canónico para ejecutar la aplicación en su modo normal.
- `dev`: comando para desarrollo, idealmente con recarga ante cambios.
- `test`, `lint`, `build`: límites claros entre verificación, calidad y artefacto.

`node --watch` representa la idea de reiniciar el proceso al detectar cambios, útil en desarrollo pero no como sustituto de un supervisor de procesos en producción.

### Tips prácticos y buenas prácticas

- Elige un único sistema de módulos por paquete siempre que sea posible; mezclar ESM y CommonJS aumenta la complejidad de resolución.
- Usa extensiones explícitas en imports locales: hace el grafo de dependencias más claro y evita ambigüedades.
- Mantén `start` simple y determinista; la lógica compleja de arranque pertenece al código, no al script.
- No commits archivos `.env` reales; documenta las variables requeridas en `.env.example`.
- Separa dependencias de ejecución de dependencias de desarrollo; reduce superficie de ataque y tiempo de instalación.

## Estructura modular de carpetas

### Principio arquitectónico

La estructura de carpetas debe expresar **responsabilidades**, no solamente tipos de archivos. Una buena organización reduce acoplamiento, facilita pruebas y permite reemplazar infraestructura sin reescribir reglas de negocio.

```js
src/
  config/          Configuración y validación de entorno
  routes/          Definición de endpoints / contrato HTTP
  controllers/     Adaptación HTTP <-> aplicación
  services/        Casos de uso y reglas de aplicación
  repositories/    Abstracción sobre persistencia
  dao/             Acceso concreto a datos
  models/          Entidades, esquemas y reglas de dominio
  middlewares/     Preocupaciones transversales
  utils/           Funciones genéricas y reutilizables
```

### Separación de responsabilidades

| Capa | Responsabilidad | No debería hacer |
|---|---|---|
| Routes | Exponer el contrato externo | Contener reglas de negocio |
| Controllers | Traducir HTTP a llamadas de aplicación | Acceder directamente a la base de datos |
| Services | Orquestar casos de uso | Depender de detalles HTTP |
| Repositories / DAO | Abstraer persistencia | Decidir reglas de negocio |
| Models | Representar dominio y validaciones esenciales | Conocer detalles de transporte |
| Middlewares | Autenticación, logging, errores, límites | Acumular lógica de caso de uso |

### `app.js` vs. `server.js`

La separación entre configuración de aplicación y arranque del servidor es un patrón de testabilidad:

```bash
app.js
  - configura middlewares
  - registra rutas
  - define manejo de errores
  - exporta la aplicación

server.js
  - importa la aplicación
  - levanta el listener
  - maneja señales y apagado ordenado
```

**Por qué importa:** las pruebas pueden ejercitar `app.js` sin abrir un puerto real, mientras `server.js` queda como un borde delgado de infraestructura.

### Tips prácticos y buenas prácticas

- Prefiere límites por **dominio o feature** cuando el proyecto crece; una estructura por capas puede volverse difícil de navegar.
- Evita el anti-patrón “carpeta utils” como cajón de sastre: si algo tiene un propósito claro, dale un módulo con nombre explícito.
- No permitas que un controller importe un ORM directamente; pasa por service y repository.
- Mantén dependencias apuntando hacia el dominio: infraestructura depende de dominio, no al revés.
- Diseña cada módulo para poder probarse en aislamiento mediante interfaces y sustitutos, no mediante estado global.

## Gestión segura de variables de entorno

### Principio 12-Factor

La metodología Twelve-Factor establece que la configuración debe almacenarse en el entorno, no en el código. Todo lo que varía entre despliegues —URLs, credenciales, flags, conexiones a servicios— debe inyectarse como configuración externa. [pradeepl](https://pradeepl.com/blog/12-factor-cloud-native-apps/)

Esto permite que el mismo artefacto se promueva entre desarrollo, staging y producción cambiando únicamente su configuración.

### `.env`, `.env.example` y secretos

| Archivo | Propósito | Debe versionarse |
|---|---|---|
| `.env` | Valores locales reales, incluidos secretos | No |
| `.env.example` | Plantilla documentada de variables requeridas | Sí |
| Código fuente | Lógica y valores no sensibles por defecto | Sí |
| Gestor de secretos | Credenciales de producción | No, como archivo plano |

El archivo `.env` es una conveniencia de desarrollo; en producción, los secretos deberían provenir de un mecanismo seguro del entorno o plataforma, no de un archivo comprometido al repositorio. [pradeepl](https://pradeepl.com/blog/12-factor-cloud-native-apps/)

### Validación fail-fast

**Fail-fast** significa detectar configuración inválida al iniciar, no cuando la primera petición intente usar una variable faltante. La aplicación debe validar presencia, tipo y formato de las variables críticas antes de aceptar tráfico. [pradeepl](https://pradeepl.com/blog/12-factor-cloud-native-apps/)

```bash
Inicio
  -> cargar entorno
  -> validar esquema de configuración
  -> ¿config inválida?
       sí -> fallar con mensaje claro
       no -> inicializar dependencias y aceptar tráfico
```

### Tips prácticos y buenas prácticas

- Define un **esquema de configuración**: nombre, tipo, obligatoriedad, valor por defecto y formato.
- Falla al inicio con mensajes accionables; un error como “falta DATABASE_URL” es más útil que un fallo intermitente en runtime.
- No coloques secretos en logs, stack traces, métricas ni mensajes de error.
- Usa valores por defecto solo para configuración no sensible y no crítica.
- Separa configuración de “entorno” de configuración de “feature”: una cosa es la URL de la base de datos; otra, un flag temporal de funcionalidad.
- Nunca asumas que `.env` estará presente en producción: trátalo como una capa local de desarrollo.

## Síntesis arquitectónica final

Node.js introduce un modelo donde la concurrencia se logra mediante **eventos, callbacks y delegación de E/S**, no mediante un hilo por petición. V8 ejecuta y optimiza JavaScript; libuv integra el runtime con el sistema operativo y coordina la E/S; el event loop distribuye el trabajo entre fases y colas de microtareas. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)

Las decisiones de arquitectura más duraderas son:

- Mantener el event loop libre de trabajo CPU-bound.
- Separar HTTP, casos de uso, dominio y persistencia.
- Externalizar configuración y validarla al arranque.
- Tratar secretos, sistema de archivos y procesos como fronteras de infraestructura.
- Diseñar módulos con dependencias claras y reemplazables, no con estado global ni acoplamiento a detalles del runtime. [nodejs](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)
