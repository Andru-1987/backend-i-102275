# Routers - Controllers - Organizacion de la API


## 1. Del `app.js` monolítico a `express.Router()`

**Nivel de confianza:** Alta | **Fuentes:** Express.js Routing Guide [expressjs](https://expressjs.com/en/guide/routing/), MDN – Routes and controllers [developer.mozilla](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes)

### Fundamentos (qué y por qué)
- **El problema:** con todas las rutas en `app.js`, un solo archivo hace de todo. Ese archivo crece con cada endpoint, se vuelve difícil de leer y es fácil equivocarse (lo que Goldberg llama "spaghetti" de dependencias en Node.js Best Practices). [github](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/breakintcomponents.md)
- **Qué es un Router:** la documentación oficial lo describe como *"a complete middleware and routing system"*, llamado a menudo *"mini-app"*. Además, cada router puede tener sus propios middlewares. [expressjs](https://expressjs.com/en/guide/routing/)
- **Prefijos anidados:** el router solo conoce rutas relativas (`/`, `/:id`). La ruta completa se arma al montarlo en la app principal. [developer.mozilla](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes)

```
app.use('/api/services', servicesRouter)
                │
                └── router.get('/:sid')  ──►  GET /api/services/:sid
```

- **Parámetros del padre:** si el prefijo trae un parámetro (por ejemplo `/bookings/:bid/services`), el router hijo no lo ve. Para verlo hay que crearlo con la opción `mergeParams`. [expressjs](https://expressjs.com/en/5x/guide/routing/)

### Relaciones con otros conceptos
| Concepto | Relación con el Router |
|---|---|
| Middleware | Un Router es un middleware con rutas adentro |
| `app.route()` | Encadena varios verbos HTTP sobre una misma ruta y evita repetir el path [expressjs](https://expressjs.com/en/guide/routing/) |
| Modularidad / SRP | Un archivo de rutas por recurso |
| Recursos REST | Cada router suele corresponder a un recurso (`services`, `bookings`) |

### Cuándo usar y cuándo evitar
- **Cuándo usar:** siempre que haya más de un recurso, o middlewares que solo aplican a un grupo de rutas (por ejemplo, autenticación solo en `/bookings`).
- **Cuándo evitar:** anidar routers en muchos niveles. Cada nivel complica razonar sobre los parámetros y el orden de ejecución.

### Tips y anti-patrones
- ✅ Express ejecuta en el orden de registro. Declará las rutas fijas (`/search`) antes que las de parámetro (`/:id`), o `/:id` se va a "comer" la búsqueda. [codeforgeek](https://codeforgeek.com/expressjs-router-tutorial/)
- ✅ Montá el manejador de errores global al final, después de todos los routers.
- ❌ Repetir el prefijo adentro del router, por ejemplo definir `router.get('/api/services/...')`. El resultado sería `/api/services/api/services/...`.
- ❌ Un handler que no responde ni llama a `next()` deja la petición colgada.

---

## 2. Patrón Controller y separación de responsabilidades

**Nivel de confianza:** Alta (principio) / Media (límite de líneas) | **Fuentes:** Microsoft – ASP.NET Core MVC [learn.microsoft](http://www.learn.microsoft.com/en-us/aspnet/core/mvc/overview), Martin Fowler – Service Layer [martinfowler](https://martinfowler.com/eaaCatalog/serviceLayer.html), Jamis Buck – Skinny Controller [weblog.jamisbuck](https://weblog.jamisbuck.org/2006/10/18/skinny-controller-fat-model)

### Fundamentos
- **Router (el recepcionista):** solo asocia "método + URL" con una función. Es una tabla de despacho.
- **Controller (el camarero):** Goldberg lo define como un **adaptador**. Su trabajo es *"adapt the payload to the app format, including first validation, call the logic/domain layer and return a response… typically achieved with a few lines of code"*. [github](https://github.com/goldbergyoni/nodebestpractices/blob/c0b71ccf/sections/projectstructre/createlayers.md?plain=1)
- **Microsoft dice lo mismo:** los controllers *"shouldn't be overly complicated by too many responsibilities"* y la lógica de negocio debe salir del controller. [learn.microsoft](http://www.learn.microsoft.com/en-us/aspnet/core/mvc/overview)
- **Matiz importante:** el controller traduce entre HTTP y el dominio en ambas direcciones.
  - Hacia adentro: convierte `req` en datos simples.
  - Hacia afuera: convierte los errores del dominio en códigos HTTP. Por ejemplo, el service lanza "no encontrado" y el controller responde 404. [devcraftly](https://www.devcraftly.com/nodejs/layered-architecture/)

```
Controller (pseudocódigo)
  datos      ← extraer(req.params, req.body)
  resultado  ← manager.operacion(datos)      // nunca recibe req/res
  si error de dominio → mapear a 4xx
  responder status + JSON
```

### Relaciones con otros conceptos
| Concepto | Relación |
|---|---|
| God Controller | Es el anti-patrón del Slim Controller |
| Service Layer (Fowler) | Es la solución al God Controller: define *"an application's boundary… coordinates the application's response"* [martinfowler](https://martinfowler.com/eaaCatalog/serviceLayer.html) |
| Fat Model | Es el anti-patrón opuesto: la grasa pasa del controller al modelo [blog.appsignal](https://blog.appsignal.com/2020/08/05/introduction-to-ruby-on-rails-patterns-and-anti-patterns.html) |
| MVC | El controller viene de MVC, pero en una API REST no hay View: la "vista" es el JSON |

### Cuándo usar y cuándo evitar
- **Cuándo usar:** siempre que la lógica deba poder usarse desde otro lado (tests, tareas programadas con cron, CLI).
- **Cuándo evitar:** no crees un service vacío que solo reenvía la llamada. El propio Fowler prefiere *"the thinnest Service Layer you can, if you need one"*. [gist.github](https://gist.github.com/VimleshS/45d7cbf9c1c83ce981c52d581c9160f9)

### Tips y anti-patrones
- ✅ **Prueba de fuego:** si podés llamar a la lógica sin Express, la separación está bien.
- ✅ El límite de 10–15 líneas sirve como alarma, no como regla. Lo que importa es que el controller no tome decisiones de negocio.
- ❌ **Pasar `req`/`res` al manager o service:** Goldberg lo señala explícitamente, porque esa lógica queda inaccesible para tests y tareas programadas. [github](https://github.com/goldbergyoni/nodebestpractices/blob/c0b71ccf3a134443635da6886423b44e31e65a73/README.md)
- ❌ **God Controller:** un mismo método que valida, calcula, escribe el JSON y arma la respuesta.
- ❌ **Mass assignment:** guardar `req.body` tal cual. El cliente puede inyectar campos que no debería controlar. [cosmiclearn](https://www.cosmiclearn.com/designpatterns/service_layer_pattern.php)

---

## 3. Estructura modular y flujo de la petición

**Nivel de confianza:** Alta | **Fuentes:** Goldberg – Node.js Best Practices [github](https://github.com/goldbergyoni/nodebestpractices), Fowler – Repository [martinfowler](https://martinfowler.com/eaaCatalog/repository.html)

### Fundamentos
```
Cliente ─► Router ─► Controller ─► Manager ─► Persistencia (JSON)
            │           │             │
         despacha    traduce HTTP   lee/escribe datos
```
- **Qué es tu "manager":** cumple el rol del **Repository** de Fowler. Ofrece una interfaz parecida a una colección (`getAll`, `getById`, `create`) y oculta *cómo* se guardan los datos. [martinfowler](https://martinfowler.com/eaaCatalog/repository.html)
- **La ventaja:** si mañana cambiás los JSON por MongoDB, solo se reescribe el manager.
- **Regla de dependencias:** cada capa habla solo con la de abajo, nunca saltea dos niveles. [dev](https://dev.to/jefersoneiji/architecting-scalable-and-maintainable-nodejs-applications-best-practices-and-examples-o16)

### Organizar por tipo técnico o por feature
| Enfoque | Estructura | Pros | Contras |
|---|---|---|---|
| Por tipo técnico | `routes/`, `controllers/`, `managers/` | Simple y didáctico | Para cambiar un recurso hay que tocar 3 carpetas |
| Por feature | `services/{router,controller,manager}`, `bookings/{...}` | Cada módulo es autónomo | Más carpetas al principio |

Goldberg marca la organización por tipo técnico como "Bad" en proyectos medianos o grandes, y recomienda módulos por dominio, cada uno con sus 3 capas. [github](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/projectstructre/breakintcomponents.md)

### Cuándo usar y cuándo evitar
- **Cuándo usar 3 capas:** el propio Goldberg dice que logran la separación sin la complejidad de Clean Architecture. [github](https://github.com/goldbergyoni/nodebestpractices/blob/c0b71ccf/sections/projectstructre/createlayers.md?plain=1)
- **Cuándo evitar:** un script descartable de 3 rutas no necesita capas.

### Tips y anti-patrones
- ✅ Separá `app` (la configuración de Express) de `server` (el `listen`). Así podés testear la app sin abrir un puerto. [github](https://github.com/goldbergyoni/nodebestpractices/blob/master/README.indonesian.md)
- ✅ **Riesgo con JSON:** el ciclo "leer → modificar → escribir" no es atómico. Dos peticiones simultáneas pueden pisarse. Centralizar el acceso en el manager es el lugar natural para mitigarlo.
- ❌ Que el controller importe `fs` directamente: rompe la frontera con la persistencia.
- ❌ Crear carpetas sin respetar las fronteras: *"Separating code into folders does not automatically create modular architecture"*. [success-craft](https://success-craft.com/blog/node-js-architecture-best-practices/)

---

## 4. Relación entre bookings y services (referencias)

**Nivel de confianza:** Alta | **Fuentes:** MongoDB – Data Modeling Best Practices [mongodb](https://www.mongodb.com/docs/manual/data-modeling/best-practices/), MongoDB – Referencing [mongodb](https://www.mongodb.com/docs/manual/data-modeling/referencing/), Google Cloud – Normalization [cloud.google](https://cloud.google.com/discover/what-is-database-normalization)

### Fundamentos
- Guardar `{ service: id, quantity }` es **normalizar**: cada dato se guarda en un solo lugar.
- Si copiás el objeto completo del servicio y después cambia su nombre, quedan copias que no coinciden. Eso es una **anomalía de actualización**. [cloud.google](https://cloud.google.com/discover/what-is-database-normalization)
- MongoDB recomienda referenciar cuando:
  - la entidad hija *"can exist by itself without a parent"*;
  - la duplicación sería difícil de mantener. [mongodb](https://www.mongodb.com/docs/manual/data-modeling/best-practices/)
- Un servicio existe aunque nadie lo reserve, así que corresponde referenciarlo.

```
booking { id, services: [ {service: S1, quantity: 2}, {service: S3, quantity: 1} ] }
                                  │
                                  └──► services.json → S1 { nombre, precio, ... }

agregarServicio(booking, sid):
  si existe item con service == sid → item.quantity += 1
  si no                              → push {service: sid, quantity: 1}
```

Esta lógica de "si existe, incrementar" es una regla de negocio. Va en el manager o service, no en el controller.

### Relaciones con otros conceptos
| Concepto | Relación |
|---|---|
| Foreign key (SQL) | El `id` referenciado cumple ese rol |
| `$lookup` / populate | Es el costo de referenciar: hace falta una segunda lectura para resolver la referencia [mongodb](https://www.mongodb.com/docs/manual/data-modeling/referencing/) |
| Embedding | La alternativa: conviene cuando los datos se leen juntos, cambian poco y no crecen sin límite |

### Cuándo usar y cuándo evitar (pensamiento lateral)
- **Cuándo referenciar:** datos que cambian y viven por su cuenta (nombre, descripción del servicio).
- **Cuándo copiar a propósito:** el **precio al momento de reservar**. Si el precio del servicio sube después, la reserva histórica no debería cambiar. En ese caso la copia es correcta, porque es una "foto" del momento y no el dato vigente.
- **Costo de referenciar:** sin una base de datos de por medio, nada garantiza la integridad referencial. El código tiene que validar que el `id` exista.

### Tips y anti-patrones
- ✅ Antes de agregar un servicio a una reserva, validá que exista. Si no existe, el controller responde 404.
- ✅ Decidí qué hacer si se borra un servicio que está en reservas: bloquear el borrado, hacer un borrado lógico o limpiar las reservas.
- ❌ Guardar el objeto completo del servicio en la reserva, salvo los datos de "foto" mencionados arriba.
- ❌ Agregar el mismo servicio como entradas repetidas en lugar de incrementar `quantity`.

---

## Mapa general de conceptos

```text
Monolito en app.js ──resuelto por──► express.Router (modularidad)
God Controller     ──resuelto por──► Slim Controller + Service Layer (Fowler)
fs dentro del ctrl ──resuelto por──► Manager ≈ Repository (Fowler)
Objeto duplicado   ──resuelto por──► Referencia por id (normalización)
Carpetas técnicas  ──evoluciona a──► Módulos por feature (Goldberg)
```
