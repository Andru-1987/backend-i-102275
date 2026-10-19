# 1. Contenido teórico: Puntos principales

## 1.1 Introducción a Express

### 1.1 Introducción a Express

#### 1. Fundamentos Teóricos y Mecanismos Internos

Express es un framework web minimalista construido sobre el servidor HTTP de Node.js. Su propósito no es reemplazar HTTP, sino proporcionar una capa de abstracción sobre él: enruta peticiones, compone procesamiento mediante middlewares y estandariza la construcción de respuestas. [expressjs](https://expressjs.com/en/4x/guide/writing-middleware/)

El modelo mental central es una **cadena de procesamiento**:

```text
Cliente
  ↓ Petición HTTP
Servidor HTTP de Node.js
  ↓
Express Application / Router
  ↓
Middleware 1 → Middleware 2 → ... → Route Handler
  ↓
Respuesta HTTP
```

Internamente, Express mantiene una lista ordenada de *layers*: middlewares globales, middlewares de router y handlers de ruta. Cuando llega una petición, el framework compara método HTTP y patrón de URL con cada capa registrada; la primera coincidencia entra en ejecución. Si esa capa no finaliza la respuesta, debe transferir el control a la siguiente mediante `next()`. [expressjs](https://expressjs.com/en/4x/guide/writing-middleware/)

Express añade sobre los objetos nativos de Node.js dos abstracciones principales:

- `req`: representación estructurada de la petición entrante.
- `res`: constructor de la respuesta saliente.

Esto permite que el desarrollador se concentre en el dominio —por ejemplo, reservas, servicios o usuarios— en lugar de gestionar manualmente sockets, cabeceras, parseo y enrutamiento.

#### 2. Patrones, Alternativas y Trade-offs

| Enfoque | Ventajas | Desventajas | Casos de uso |
|---|---|---|---|
| Servidor HTTP nativo | Control total del protocolo, cero dependencias, menor superficie de abstracción | Enrutamiento, parseo y composición deben implementarse manualmente | Proxies, servidores muy específicos o aprendizaje profundo de HTTP |
| Express | Modelo sencillo, ecosistema maduro, middlewares componibles, ideal para APIs REST | La flexibilidad puede producir estructuras inconsistentes si no hay convenciones | APIs HTTP, backends modulares, prototipos y servicios de tamaño medio |
| Frameworks con estructura opinionada | Convenciones fuertes, menos decisiones repetidas, estructura predecible | Menor libertad y posible complejidad innecesaria | Equipos grandes, aplicaciones completas con convenciones compartidas |
| Arquitectura sin framework | Máximo control y mínimas dependencias | Alto costo de mantenimiento y riesgo de reinventar mecanismos probados | Sistemas con restricciones extremas de rendimiento o dependencias |

#### 3. Tips Prácticos, Anti-patterns y Buenas Prácticas

**Buenas Prácticas:**
- Tratar Express como una capa de entrega HTTP, no como el dominio de negocio.
- Separar rutas, controladores, servicios y acceso a datos.
- Definir convenciones tempranas para nombres de rutas, validación, errores y respuestas.
- Mantener los handlers delgados: reciben la petición, delegan y responden.

**Anti-patterns a Evitar:**
- Implementar lógica de negocio directamente dentro del handler de ruta.
- Duplicar configuración de middlewares en cada ruta cuando es transversal.
- Acoplar el formato interno de la base de datos al contrato HTTP.
- Usar Express como contenedor de toda la lógica de la aplicación.

**Recomendación de Industria:** usa Express cuando necesites una API HTTP flexible y explícita; establece una arquitectura en capas desde el inicio para evitar que la simplicidad del framework se convierta en acoplamiento.

***

## 1.2 Diseño y principios de una API REST

### 1.2 Diseño y principios de una API REST

#### 1. Fundamentos Teóricos y Mecanismos Internos

REST, *Representational State Transfer*, es un estilo arquitectónico basado en recursos identificables mediante URIs. Un recurso es una abstracción del dominio —por ejemplo, `services`, `bookings` o `users`— no una acción ni una tabla de base de datos. [learn.microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

El principio esencial es:

```text
URI       = sustantivo / identidad del recurso
Método    = verbo / intención sobre el recurso
Cuerpo    = representación o datos necesarios
Status    = resultado semántico de la operación
```

Por ello, una API REST bien diseñada separa **qué recurso** se manipula de **qué operación** se realiza:

```text
Colección:      /api/services
Recurso único:  /api/services/:sid
Crear:          POST   /api/services
Leer:           GET    /api/services/:sid
Reemplazar:     PUT    /api/services/:sid
Editar parcial: PATCH  /api/services/:sid
Eliminar:       DELETE /api/services/:sid
```

Las URI deben usar sustantivos y, para colecciones, normalmente sustantivos en plural; el verbo lo aporta el método HTTP.  Esto genera un contrato predecible: un cliente puede inferir operaciones sin aprender una nomenclatura arbitraria por endpoint. [learn.microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

REST también favorece una interfaz uniforme: recursos identificables, representaciones explícitas, mensajes autodescriptivos y ausencia de estado de sesión en el servidor entre peticiones. El estado necesario para una petición debe viajar en la propia solicitud, normalmente mediante credenciales, tokens o parámetros.

#### 2. Patrones, Alternativas y Trade-offs

| Estilo | Ventajas | Desventajas | Casos de uso |
|---|---|---|---|
| REST orientado a recursos | Contrato predecible, cacheable, amplio soporte HTTP, bajo acoplamiento cliente-servidor | Puede requerir varias peticiones para casos complejos | APIs públicas, integraciones, CRUD y servicios web |
| RPC sobre HTTP | Operaciones de negocio explícitas, útil para acciones complejas | Menos uniforme, puede derivar en URIs con verbos y acoplamiento | Acciones como `approve`, `cancel` o procesos de workflow |
| GraphQL | El cliente define la forma exacta de los datos | Complejidad de caché, autorización por campo y consultas costosas | Clientes con necesidades de datos muy variables |
| Event-driven / mensajería | Desacoplamiento temporal y escalabilidad | Consistencia eventual, trazabilidad y depuración más complejas | Integraciones asíncronas y sistemas distribuidos |

#### 3. Tips Prácticos, Anti-patterns y Buenas Prácticas

**Buenas Prácticas:**
- Modelar entidades de negocio, no tablas: `/bookings`, no `/bookings_table`.
- Usar sustantivos en plural para colecciones: `/api/services`.
- Identificar recursos individuales con un identificador estable: `/api/services/:sid`.
- Usar métodos HTTP para expresar la intención.
- Mantener versionado explícito cuando el contrato pueda romperse, por ejemplo mediante un prefijo de versión.

**Anti-patterns a Evitar:**
- URIs orientadas a acciones: `/api/createService`, `/api/deleteBooking`.
- Exponer detalles de implementación: `/api/getUsersFromMySQL`.
- Mezclar identidades de recursos con acciones: `/api/services/:sid/delete`.
- Diseñar endpoints alrededor de pantallas de frontend en lugar de recursos del dominio.

**Recomendación de Industria:** usa REST como contrato por defecto para recursos; reserva operaciones tipo RPC para acciones de dominio que no representan una manipulación directa de un recurso, documentando siempre la diferencia.

***

## 1.3 Métodos HTTP principales

### 1.3 Métodos HTTP principales

#### 1. Fundamentos Teóricos y Mecanismos Internos

Los métodos HTTP expresan la semántica de la operación sobre un recurso. Según RFC 9110, `GET` transfiere una representación actual del recurso, `POST` ejecuta procesamiento específico del recurso y `PUT` reemplaza todas las representaciones actuales del recurso con el contenido recibido. [rfc-editor](https://www.rfc-editor.org/info/rfc9110/)

Dos propiedades fundamentales son **seguridad** e **idempotencia**:

- **Safe:** no se espera que modifique el estado del servidor; `GET` es seguro.
- **Idempotente:** repetir la misma petición produce el mismo efecto observable; `PUT` y `DELETE` son idempotentes, mientras que `POST` no lo es. [iana](https://www.iana.org/assignments/http-methods)

```text
Método   Semántica principal              Safe     Idempotente
GET      Leer recurso o colección          Sí       Sí
POST     Crear / procesar                  No       No
PUT      Reemplazo completo del recurso    No       Sí
PATCH    Cambio parcial del recurso        No       No garantizado
DELETE   Eliminar recurso                  No       Sí
```

`PUT` transmite una representación completa: el cliente define el estado final deseado. `PATCH` transmite un conjunto de cambios: el servidor aplica una transformación parcial. Esta diferencia importa porque `PUT` reemplaza el recurso, mientras que `PATCH` modifica campos seleccionados.

#### 2. Patrones, Alternativas y Trade-offs

| Método | Ventajas | Desventajas | Caso de uso |
|---|---|---|---|
| `GET` | Cacheable, seguro, idempotente, fácil de depurar | No debe usarse para cambios de estado | Listar servicios, obtener una reserva |
| `POST` | Permite creación y procesos no idempotentes | Reintentos pueden duplicar efectos | Crear una reserva, iniciar un pago |
| `PUT` | Semántica clara de reemplazo e idempotencia | Exige enviar la representación completa | Actualizar configuración completa de un recurso |
| `PATCH` | Eficiente para cambios parciales | Semántica depende del formato de parche y puede no ser idempotente | Cambiar estado o un campo de una reserva |
| `DELETE` | Intención directa y idempotente | Puede requerir borrado lógico por auditoría | Eliminar un servicio o cancelar un recurso |

#### 3. Tips Prácticos, Anti-patterns y Buenas Prácticas

**Buenas Prácticas:**
- Usar `GET` solo para consultas; no debe producir efectos secundarios relevantes.
- Usar `POST` para creación y para operaciones no idempotentes.
- Usar `PUT` cuando el cliente envía el estado completo y el resultado debe ser idempotente.
- Usar `PATCH` para actualizaciones parciales, definiendo claramente qué campos acepta.
- Usar `DELETE` para eliminación, considerando borrado lógico si se requiere historial o auditoría.

**Anti-patterns a Evitar:**
- Usar `GET` para crear, modificar o eliminar datos.
- Usar `POST` para todo por comodidad.
- Confundir `PUT` con actualización parcial.
- Implementar `DELETE` sin definir si es físico, lógico o una transición de estado.
- Ignorar reintentos: un `POST` duplicado puede crear recursos duplicados.

**Recomendación de Industria:** define una matriz de métodos por recurso antes de implementar rutas; documenta idempotencia y efectos secundarios, especialmente para `POST` y `PATCH`.

***

## 1.4 El flujo Request / Response (`req`, `res`)

### 1.4 El flujo Request / Response (`req`, `res`)

#### 1. Fundamentos Teóricos y Mecanismos Internos

El ciclo HTTP en Express es una tubería de transformación: la petición entra como `req`, atraviesa middlewares y termina en una respuesta construida con `res`. Express proporciona `req`, `res` y `next` a cada middleware y handler dentro del ciclo petición-respuesta. [expressjs](https://expressjs.com/en/4x/guide/writing-middleware/)

```text
Petición HTTP
  ├── Método: GET / POST / PUT / PATCH / DELETE
  ├── URL: /api/services/:sid?status=active
  ├── Headers
  └── Body

req
  ├── req.method
  ├── req.url
  ├── req.headers
  ├── req.params  → valores dinámicos de ruta
  ├── req.query   → parámetros de consulta
  └── req.body    → datos del cuerpo

Handler / Middleware
  ↓
res
  ├── res.status(...)
  └── res.json(...)
  ↓
Respuesta HTTP
```

- `req.params` contiene valores extraídos de segmentos dinámicos de ruta, como `:sid`; representa la **identidad** del recurso.
- `req.query` contiene parámetros opcionales posteriores a `?`; representa **filtros, paginación u ordenamiento**.
- `req.body` contiene el cuerpo de la petición; representa el **estado o datos** enviados por el cliente.
- `res.status()` establece el código HTTP semántico.
- `res.json()` serializa un objeto a JSON y envía la respuesta con el tipo de contenido correspondiente.

El modelo mental correcto es:

```text
params  → ¿qué recurso?
query   → ¿cómo filtrar, paginar u ordenar?
body    → ¿qué datos envía el cliente?
status  → ¿qué ocurrió?
json    → ¿qué representación devuelvo?
```

#### 2. Patrones, Alternativas y Trade-offs

| Fuente de datos | Uso correcto | Ventajas | Riesgos |
|---|---|---|---|
| `req.params` | Identificar un recurso: `:sid` | URI estable y semánticamente clara | Validar existencia y formato del identificador |
| `req.query` | Filtros, paginación, orden | No modifica la identidad del recurso | Puede volverse complejo y requerir validación estricta |
| `req.body` | Crear o actualizar datos | Permite payloads estructurados | Debe validarse; no confiar en tipos ni campos |
| `res.status` + `res.json` | Respuesta explícita y estructurada | Contrato claro para clientes | Mezclar códigos incorrectos confunde al consumidor |

#### 3. Tips Prácticos, Anti-patterns y Buenas Prácticas

**Buenas Prácticas:**
- Validar `params`, `query` y `body` antes de acceder al dominio.
- Tratar todo dato entrante como no confiable.
- Responder con una estructura de error consistente.
- Usar códigos HTTP para el resultado y el cuerpo para detalles accionables.
- Mantener una separación entre transporte HTTP y modelo interno.

**Anti-patterns a Evitar:**
- Usar `req.body` para identificar recursos cuando corresponde `req.params`.
- Enviar filtros críticos en el cuerpo de un `GET`.
- Devolver siempre `200` incluso ante errores de validación o recursos inexistentes.
- Exponer objetos internos de base de datos directamente en `res.json()`.
- Confiar en que el cliente enviará únicamente campos permitidos.

**Recomendación de Industria:** define un contrato de entrada y salida por endpoint; valida en el límite del sistema y convierte los datos a un modelo interno antes de ejecutar reglas de negocio.

***

## 1.5 Middlewares en Express

### 1.5 Middlewares en Express

#### 1. Fundamentos Teóricos y Mecanismos Internos

Un middleware es una función con acceso a `req`, `res` y `next`, insertada en el ciclo petición-respuesta antes de que la petición llegue al handler final. Su función es transformar, validar, autenticar, registrar, limitar o enriquecer la petición. [expressjs](https://expressjs.com/en/4x/guide/writing-middleware/)

El patrón es una **cadena de responsabilidad**:

```text
Request
  ↓
Middleware: logging
  ↓ next()
Middleware: parseo JSON
  ↓ next()
Middleware: autenticación
  ↓ next()
Middleware: validación
  ↓ next()
Route Handler
  ↓
Response
```

Cada middleware tiene tres salidas posibles:

```text
1. Llama next()        → continúa la cadena
2. Termina con res     → finaliza el ciclo
3. Llama next(error)   → transfiere el control al manejo de errores
```

Si un middleware no finaliza la respuesta ni invoca `next()`, la petición queda suspendida.  Por eso `next()` no es opcional: es el mecanismo que transfiere el control a la siguiente capa. [developer.mozilla](https://developer.mozilla.org/es/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/Introduction)

El orden de registro define el comportamiento. Un parser de cuerpo JSON debe ejecutarse antes de los handlers que leen `req.body`; si se registra después, esos handlers recibirán un cuerpo no parseado. Express ejecuta los middlewares en el orden en que fueron añadidos a la aplicación. [expressjs](https://expressjs.com/en/guide/using-middleware/)

```text
Correcto:

app.use(parseJSON)
app.use(authenticate)
app.use(routes)

Incorrecto:

app.use(routes)
app.use(parseJSON)   → demasiado tarde
```

#### 2. Patrones, Alternativas y Trade-offs

| Patrón | Ventajas | Desventajas | Caso de uso |
|---|---|---|---|
| Middleware global | Aplica una preocupación transversal a todas las rutas | Puede añadir costo o comportamiento innecesario a rutas que no lo requieren | Logging, parsing, manejo global de errores |
| Middleware por router | Aísla reglas por módulo o recurso | Puede duplicar configuración si se abusa | Rutas de `/admin`, `/api/services`, `/api/bookings` |
| Middleware por ruta | Máximo control y claridad | Más repetición y riesgo de inconsistencia | Validación específica o autorización fina |
| Cadena de validación | Reutilización y composición de reglas | Puede ocultar el orden real de ejecución | Validar cuerpo, permisos y formato antes del handler |
| Manejador central de errores | Respuestas de error consistentes | Debe registrarse al final para capturar errores previos | Errores no controlados y errores propagados con `next(error)` |

#### 3. Tips Prácticos, Anti-patterns y Buenas Prácticas

**Buenas Prácticas:**
- Registrar primero los middlewares de infraestructura: parsing, logging, correlación y seguridad.
- Registrar después autenticación, autorización y validación.
- Registrar el manejador de errores al final de la cadena.
- Mantener cada middleware con una única responsabilidad.
- Usar `next(error)` para errores en lugar de responder ad hoc desde cada middleware.

**Anti-patterns a Evitar:**
- Declarar el parser JSON después de las rutas que necesitan `req.body`.
- Olvidar `next()` y dejar peticiones colgadas.
- Realizar múltiples responsabilidades no relacionadas en un mismo middleware.
- Usar middlewares globales para reglas que solo aplican a una ruta.
- Capturar errores silenciosamente sin registrarlos ni propagarlos.

**Recomendación de Industria:** diseña el pipeline como una secuencia explícita de responsabilidades: *observabilidad → parsing → seguridad → validación → negocio → errores*. Documenta el orden porque constituye parte del comportamiento del sistema.

***

## 1.6 Códigos de respuesta HTTP semánticos

### 1.6 Códigos de respuesta HTTP semánticos

#### 1. Fundamentos Teóricos y Mecanismos Internos

Un código de estado HTTP es un número de tres dígitos que describe el resultado de la petición y la semántica de la respuesta, incluyendo si fue exitosa y qué contenido contiene.  Es parte del contrato entre cliente y servidor: permite que proxies, navegadores, SDKs y sistemas de monitoreo interpreten el resultado sin conocer la lógica interna. [rfc-editor](https://www.rfc-editor.org/info/rfc9110/)

```text
2xx  Éxito
4xx  Error del cliente
5xx  Error del servidor
```

| Código | Nombre | Significado arquitectónico | Ejemplo |
|---|---|---|---|
| `200 OK` | OK | La petición se procesó correctamente y se devuelve una representación | `GET /api/services/:sid` retorna el servicio |
| `201 Created` | Created | Se creó un nuevo recurso | `POST /api/bookings` crea una reserva |
| `400 Bad Request` | Bad Request | La petición es inválida: formato, campos faltantes o reglas incumplidas | Falta `customer_id` en el cuerpo |
| `404 Not Found` | Not Found | El recurso solicitado no existe o no es accesible | `GET /api/services/999` no encuentra el ID |
| `500 Internal Server Error` | Internal Server Error | Falla no controlada en el servidor | Excepción inesperada en la capa de datos |

La distinción clave es la **responsabilidad del fallo**:

```text
400 → El cliente envió algo incorrecto.
404 → El recurso identificado no existe.
500 → El servidor no pudo completar una operación válida.
```

Un `400` no debe usarse para errores internos, y un `500` no debe usarse para validaciones predecibles. Esta separación permite diagnóstico, alertas y comportamiento correcto de clientes.

#### 2. Patrones, Alternativas y Trade-offs

| Estrategia de errores | Ventajas | Desventajas | Caso de uso |
|---|---|---|---|
| Códigos HTTP semánticos | Interoperabilidad, monitoreo y contratos claros | Requiere disciplina para no mezclar responsabilidades | APIs REST y sistemas integrados |
| Código único `200` con estado en el cuerpo | Simplifica algunos clientes | Rompe semántica HTTP, dificulta caché, reintentos y alertas | No recomendado como diseño general |
| Errores detallados en desarrollo, genéricos en producción | Balance entre depuración y seguridad | Requiere configuración por entorno | APIs expuestas públicamente |
| Respuestas de error estandarizadas | Contrato predecible y fácil manejo en clientes | Requiere mantener un esquema común | Equipos y APIs con múltiples consumidores |

#### 3. Tips Prácticos, Anti-patterns y Buenas Prácticas

**Buenas Prácticas:**
- Retornar `201` tras crear un recurso, idealmente con su representación o identificador.
- Retornar `400` para validaciones de entrada.
- Retornar `404` cuando el recurso identificado no existe.
- Retornar `500` solo para fallos internos no anticipados.
- Incluir un cuerpo de error estable: código lógico, mensaje legible y detalles de validación cuando corresponda.

**Anti-patterns a Evitar:**
- Devolver `200 OK` con un cuerpo que indique error.
- Usar `500` para validaciones de negocio.
- Usar `400` para fallos de infraestructura.
- Exponer stack traces, consultas SQL o secretos en respuestas de producción.
- Inventar significados incompatibles para códigos estándar.

**Recomendación de Industria:** trata los códigos HTTP como contrato público. Usa errores estructurados, registra la causa interna en logs y expón al cliente únicamente la información necesaria para corregir o reintentar la solicitud.
