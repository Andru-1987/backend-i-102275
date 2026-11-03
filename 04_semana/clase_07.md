# Dominando la arquitectura 
## 1. Refactorización Avanzada: Erradicación del "Código Espagueti"

### ¿Qué es y Por qué?

* **Qué es:** Es la técnica de reestructuración de sistemas donde el flujo de control está altamente acoplado y entrelazado (espagueti), hacia un diseño ortogonal donde cada componente tiene límites claros. Específicamente en el enrutamiento, implica separar la declaración de la topología de red de la ejecución algorítmica.
* **Por qué:** El código espagueti eleva la carga cognitiva a niveles insostenibles, haciendo imposible predecir los efectos secundarios de un cambio. Aislar la lógica previene regresiones y permite escalar el software a nivel empresarial.

### ¿Cómo funciona internamente? (Mecanismos y Patrones)

Se fundamenta en el patrón **Dispatcher** y la **Inversión de Control (IoC)**:

* **Desacoplamiento Estructural:** En lugar de que la definición de la ruta contenga un bloque de ejecución anónimo (closure o función lambda), la ruta actúa como un simple mapa de punteros.
* **Evaluación Diferida:** El enrutador solo empareja expresiones regulares contra la URI entrante. Cuando hay un "match", transfiere el hilo de ejecución a un puntero de memoria (el Controlador), logrando que el mapa de rutas sea un simple archivo de configuración declarativo en lugar de un script procesal.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "God Handler":** Funciones de enrutamiento que abren transacciones de base de datos, mutan el estado, envían correos electrónicos y construyen respuestas HTTP simultáneamente.
* **Mejor Práctica (Patrón Strangler Fig):** Para desarmar el código espagueti sin romper producción, no reescriba todo a la vez. Extraiga primero la lógica más profunda hacia una función pura (ej. cálculos), luego la interacción de datos, dejando el enrutador cada vez más delgado hasta que quede como un simple delegador.

---

## 2. Diseño por Capas (N-Tier Architecture)

### ¿Qué es y Por qué?

* **Qué es:** Una topología arquitectónica que divide las preocupaciones del software en estratos horizontales aislados (típicamente Presentación/Red, Aplicación/Negocio, y Acceso a Datos).
* **Por qué:** Garantiza la **Ortogonalidad**. Si el equipo decide cambiar la base de datos subyacente (de relacional a documental) o el protocolo de entrada (de HTTP a gRPC), solo la capa respectiva debe ser modificada, dejando el núcleo de negocio intacto.

### ¿Cómo funciona internamente? (El Flujo de la Petición)

El ciclo de vida se orquesta bajo el patrón **Pipes and Filters**:

1. **Recepción (Router):** Actúa como el filtro perimetral. Clasifica la intención del estímulo externo.
2. **Orquestación (Controller):** Traduce el estímulo de red a parámetros nativos. Es el punto de inyección hacia la lógica pura.
3. **Procesamiento (Service/Domain):** Ejecuta algoritmos, validaciones de estado y reglas de negocio, siendo completamente ciego (agnóstico) a la existencia de Internet o protocolos.
4. **Persistencia (Repository/DAO):** Materializa los cambios de estado en un medio de almacenamiento.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "Abstracción Permeable" (Leaky Abstraction):** Ocurre cuando un error de la base de datos (como un fallo de restricción única SQL) se propaga directamente hasta el Controlador, o cuando el Servicio recibe objetos `Request` o `Response` atados al protocolo HTTP.
* **Regla de Oro (Dependencia Unidireccional):** Las capas superiores solo pueden llamar a las capas inferiores. Un Servicio jamás debe invocar a un Controlador.

---

## 3. Principio de Responsabilidad Única (SRP) en Controladores

### ¿Qué es y Por qué?

* **Qué es:** La "S" de los principios SOLID. Dicta que un módulo o clase debe tener una, y solo una, razón para cambiar. Aplicado a una API, significa que un Controlador solo debe cambiar si cambia el contrato de entrada/salida (la firma de la API), no si cambian las reglas de negocio o los esquemas de datos.
* **Por qué:** Un controlador altamente cohesivo es trivial de documentar, probar y mantener.

### ¿Cómo funciona internamente?

El Controlador se convierte en un **Adaptador de Interfaz**:

* **Mapeo de DTOs (Data Transfer Objects):** El controlador extrae el cuerpo de la petición y lo convierte en una estructura de datos inmutable y purificada (DTO). Esta estructura viaja al servicio. El controlador no toma decisiones lógicas con estos datos; su única responsabilidad es la transcripción bilingüe (Red <-> Dominio).

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "Lógica Condicional de Negocio":** Si un controlador contiene estructuras condicionales (if/switch) para verificar saldos, validar stock o calcular descuentos, está violando el SRP.
* **Tip Práctico:** Un controlador "Slim" perfecto tiene exactamente tres pasos lógicos: Extraer (Parse), Delegar (Call Service), y Empacar (Formatear Respuesta/Status Code).

---

## 4. Escalabilidad y Trabajo en Equipo (Ley de Conway y Git)

### ¿Qué es y Por qué?

* **Qué es:** La aplicación de arquitectura para optimizar no solo el hardware, sino la topología de la organización humana. La Ley de Conway establece que los sistemas diseñados por organizaciones reflejan inevitablemente sus estructuras de comunicación.
* **Por qué:** En archivos monolíticos, múltiples desarrolladores trabajando en distintas características generarán colisiones constantes en los sistemas de control de versiones (Git Merge Conflicts), bloqueando el despliegue continuo y degradando la moral del equipo.

### ¿Cómo funciona internamente?

* **Modularización por Dominio (Feature Slicing):** En lugar de agrupar todo por tipo (todos los controladores juntos, todos los modelos juntos), los sistemas escalables adoptan conceptos de *Domain-Driven Design (DDD)*. Se crean módulos verticales aislados (ej. Módulo "Reservas", Módulo "Facturación").
* **Resolución de Conflictos Aislada:** Al tener árboles de archivos independientes, un equipo puede alterar el dominio de "Reservas" sin tocar un solo byte de memoria del dominio de "Facturación", erradicando las dependencias inter-equipos a nivel de control de versiones.

---

## 5. Análisis Teórico de Actividades Prácticas

### A. Clasificación de Responsabilidades: "¿Router o no router?"

Para resolver discusiones arquitectónicas, la industria utiliza matrices de decisión estrictas. A continuación, la clasificación teórica estándar:

| Acción Analizada | Capa Responsable | Justificación Teórica |
| --- | --- | --- |
| **Validación de JWT / Sesión** | **Middleware (Gateway/Filtro)** | Patrón *Intercepting Filter*. La seguridad perimetral debe abortar peticiones no autorizadas antes de consumir ciclos de CPU en enrutamiento profundo. |
| **Mapeo de URLs a Funciones** | **Router** | Responsabilidad exclusiva de topología y direccionamiento (Patrón *Dispatcher*). |
| **Formateo a Estructura JSON** | **Controller** | Responsabilidad de presentación y adaptador de interfaz. El núcleo no conoce el protocolo de serialización web. |
| **Consulta a Base de Datos** | **Repository / Service** | Aislamiento de persistencia. Permite cambiar el motor de almacenamiento sin alterar los contratos de red. |

### B. Diseño de una API por Capas (Caso: Reservas de Vuelos)

Esquematizando un sistema complejo mediante fronteras lógicas:

1. **Frontera de Pasajeros (Users/Passengers):** Gestiona identidad y perfiles.
2. **Frontera de Inventario (Flights):** Gestiona aeronaves, rutas y disponibilidad de asientos en tiempo real (alta concurrencia).
3. **Frontera de Transacciones (Bookings):** Capa de coordinación que requiere inyectar transacciones atómicas (ACID) combinando disponibilidad de vuelos y fondos del usuario.
*El diseño exige que el `BookingsController` no interactúe con el repositorio de `Flights` directamente, sino que delegue a un `BookingsService`, el cual se comunica con el `FlightsService` para solicitar reserva de inventario, manteniendo el desacoplamiento.*

### C. Live Refactoring: Adiós al Espagueti

La teoría detrás de transformar una mega-función de 100 líneas (mencionada como archivo "Express") hacia un esquema de 5 líneas radica en la **Declaratividad**:

* El archivo de red pasa de ser un documento de instrucciones imperativas a un documento declarativo (un índice).
* El código espagueti se disecciona extrayendo primero la validación sincrónica hacia middlewares, y luego el acceso a disco/red hacia servicios asincrónicos, dejando en el archivo original únicamente la firma arquitectónica de la aplicación.
