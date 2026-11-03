# Dominando la Arquitectura Backend - Routers y Controllers.

## 1. Refactorización Avanzada: De Monolito a Arquitectura Modular

### ¿Qué es y Por qué?

* **Qué es:** Es el proceso de reorganizar una aplicación en la cual el enrutamiento, la lógica de negocio y el acceso a datos residen en un único archivo secuencial (comúnmente llamado *God File*), hacia un diseño estructurado por capas cohesivas y desacopladas (típicamente Router, Controlador, Servicio/Manager).
* **Por qué:** Mantener todo en un solo bloque viola el Principio de Responsabilidad Única (SRP). Un diseño monolítico aumenta la complejidad ciclomática, vuelve virtualmente imposible el testing unitario aislado y genera conflictos continuos en sistemas de control de versiones cuando operan equipos de desarrollo grandes.

### ¿Cómo funciona internamente? (Mecanismos y Modelos Mentales)

El modelo mental detrás de esta refactorización es migrar de un flujo de "Script Procesal" al patrón **Front Controller** en conjunto con un **Dispatcher**.

1. **Front Controller (El Servidor):** Un punto único recibe todas las peticiones HTTP crudas entrantes.
2. **Dispatcher (El Router):** Actúa como un conmutador semántico. Compara la URL y el verbo HTTP contra una tabla de reglas y despacha el control al manejador adecuado, limpiando el camino.
3. **Handler (El Controlador):** El nodo terminal de red que traduce los datos del contexto web antes de invocar la maquinaria de la aplicación.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "Big Ball of Mud":** Mezclar conexiones de bases de datos, validación de contraseñas y envío de correos electrónicos directamente dentro de la definición de la ruta.
* **Mejor Práctica (Abstracción de Inyección):** Los enrutadores modernos deben delegar las tareas invocando referencias a métodos (o utilizando inyección de dependencias), aislando la capa HTTP para que no necesite saber *cómo* se ejecuta una tarea.
* **Tip Práctico:** Al refactorizar un monolito, la estrategia más segura es operar de "afuera hacia adentro": extrae primero la declaración de las rutas a su propio archivo, luego crea controladores para gestionar las peticiones/respuestas, y como último paso, extirpa la lógica de datos hacia un servicio puro.

---

## 2. Jerarquía de Rutas y Diseño RESTful

### ¿Qué es y Por qué?

* **Qué es:** Es el diseño e implementación de Identificadores de Recursos Uniformes (URIs) que reflejan relaciones lógicas de pertenencia y jerarquía entre entidades de dominio (por ejemplo, el encadenamiento relacional en `/negocios/:id/sucursales/:id/reservas`).
* **Por qué:** Establece un contrato semántico claro y predecible (basado en el patrón REST). Permite a los clientes de la API inferir la topología y modelo de los datos del sistema, asegurando la trazabilidad de los recursos dependientes.

### ¿Cómo funciona internamente? (Mecanismos y Modelos Mentales)

Este enrutamiento emplea el modelo de **Árbol de Recursos (Resource Tree)** acoplado a la propagación de contexto.

* **Encapsulamiento de Alcance (Scope Merging):** Cuando un sistema anida rutas, utiliza un mecanismo que hereda los identificadores de los nodos superiores. Al alcanzar el último segmento (`reservas`), el controlador recibe de manera transparente los IDs de `negocios` y `sucursales`, asegurando que la reserva consultada pertenezca axiomáticamente a esa rama del árbol y previniendo el acceso no autorizado a través de identificadores de otra entidad.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "Deep Nesting" (Anidamiento Profundo):** Construir URIs con más de dos o tres niveles de recursos anidados. Produce URLs frágiles, difíciles de leer y acopla de manera muy severa la API al diseño tabular de la base de datos subyacente.
* **Mejor Práctica (Shallow Routing):** Si un sub-recurso tiene un ID con unicidad global (UUIDs o claves primarias irrepetibles), evite rutas largas para consultas directas. En lugar de forzar `GET /negocios/1/sucursales/2/reservas/99`, utilice un enrutamiento plano `GET /reservas/99`. Resérvese la jerarquía completa únicamente para la creación (`POST /sucursales/2/reservas`) o filtrado masivo de colecciones.

---

## 3. Inyección de Lógica y Controladores Flacos (Slim Controllers)

### ¿Qué es y Por qué?

* **Qué es:** Un principio de arquitectura donde el Controlador ejerce una responsabilidad hermética: traducir la petición (Request) y formular la respuesta (Response). Toda la lógica de algoritmos, reglas de negocio y mutaciones de persistencia se delega a una capa inferior de Servicio o Manager.
* **Por qué:** Aislar la lógica central de la capa de transporte permite reutilizarla en interfaces diversas (HTTP, WebSockets, gRPC, Cron jobs) sin duplicar código. Facilita las pruebas de unidad sobre el corazón de la aplicación, abstrayéndose por completo de la necesidad de levantar un servidor HTTP.

### ¿Cómo funciona internamente? (Mecanismos y Modelos Mentales)

El Controlador implementa el patrón **Director de Orquesta**:

1. **Parseo y Extracción:** Desempaca cabeceras, rutas y cuerpos estructurados.
2. **Transformación y Delegación:** Traduce los datos dependientes de la web a estructuras primitivas puras, usualmente instanciando **DTOs (Data Transfer Objects)**, entregando estas instrucciones neutras a la capa de Servicios.
3. **Resolución de Transporte:** Recibe el resultado nativo (o excepciones lanzadas) por los Servicios y las formatea de vuelta al protocolo de red pertinente, asignando el código de estado adecuado.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "Fat Controller":** Controladores plagados de iteraciones, condiciones compuestas para determinar acceso, y llamadas directas a sistemas de persistencia.
* **Tip Práctico:** Si en el bloque de código de su controlador existen bucles repetitivos (`for`, `while`) estructurando datos o más de dos niveles de condiciones `if` evaluando reglas de negocio, está violando la premisa del controlador flaco.

---

## 4. Patrones de la Industria en Escala (Ej. Stripe y Netflix)

### ¿Qué es y Por qué?

A nivel empresarial, las decisiones de enrutamiento van más allá de agrupar archivos; son estrategias para mantener millones de integraciones vivas y garantizar resiliencia ante picos de red.

### ¿Cómo funciona internamente?

#### A. Versionamiento Constante (Modelo Stripe)

Empresas como Stripe tratan la compatibilidad hacia atrás (*Backward Compatibility*) como una métrica crítica e inquebrantable.

* **Mutación Transparente:** Mientras que arquitecturas comunes usan rutas explícitas (`/v1/`, `/v2/`), sistemas avanzados permiten anclar la versión en un *Header* HTTP y la mantienen en la base de datos de la cuenta [cite: 1.1.2].
* El núcleo del sistema siempre procesa la lógica en la última versión, pero un grupo de middlewares (filtros de salida) "retro-mutan" la respuesta al esquema o contrato anterior antes de devolverlo al cliente heredado, evitando el versionamiento forzado en las integraciones cliente.

#### B. API Gateway y Enrutamiento Dinámico (Modelo Netflix)

Netflix, gestionando más de mil dispositivos diferentes, migró del enrutamiento monolítico a un proxy inteligente usando la arquitectura Zuul.

* **Edge Routing:** El enrutador no es una carpeta dentro del backend, es un microservicio perimetral propio (Gateway).
* **Enrutamiento Condicional Dinámico:** En lugar de apuntar estáticamente `/api/video` a un único cluster, el Gateway evalúa firmas de dispositivos. Si la solicitud proviene de un decodificador antiguo versus un Smart TV 4K moderno, muta la dirección de enrutamiento al vuelo entregando cargas de datos asimétricas ajustadas a la capacidad de procesamiento de ese dispositivo.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Mejor Práctica (Expansión sobre Mutación):** Cuando se necesita cambiar una estructura, evite alterar o borrar atributos existentes, y agregue en cambio campos opcionales [cite: 1.1.1]. Si debe romper compatibilidad, cree una ruta versionada `v2` paralela, marcando con banderas de deprecación la versión antigua mediante cabeceras antes del retiro final.

---

## 5. Ciclo de Vida de una Petición HTTP

### ¿Qué es y Por qué?

* **Qué es:** El flujo determinista, secuencial y en forma de tubería que atraviesa un estímulo de red desde su interceptación por el sistema operativo, hasta la serialización binaria de la respuesta.
* **Por qué:** Dominar este ciclo es fundamental para determinar con exactitud técnica dónde inyectar un paso de validación, dónde inicializar una conexión de base de datos o interceptar de manera temprana un ataque cibernético perimetral, previniendo así un consumo de hardware innecesario.

### ¿Cómo funciona internamente? (Flujo y Patrones)

Se fundamenta en los patrones **Chain of Responsibility** y **Pipeline**:

1. **Inbound Listener:** El servicio perimetral traduce los datos de conexión TCP en una estructura manejable (Objeto Request).
2. **Filtros Globales (Middlewares Iniciales):** Decodificadores de JSON y protectores de cabeceras de red.
3. **Resolución de Enrutamiento:** Un motor compara topologías y expresiones regulares contra la URI para asignar un destino lógico.
4. **Guards de Ruta (Filtros Específicos):** Verificación de identidad (Auth), Autorización por roles y validación de tipos de datos de entrada.
5. **Ejecución del Nodo (Controller):** Interacción directa con los Casos de Uso (Servicios/Dominio).
6. **Outbound Output:** La respuesta se ensambla, adjuntando metadatos y empacando el bloque TCP final de vuelta.

### Tips Prácticos, Anti-patrones y Mejores Prácticas

* **Anti-patrón "Tubería Rota":** Un middleware que procesa datos pero olvida "pasar la batuta" (delegar explícitamente el flujo hacia el siguiente nivel), lo que ocasiona que el hilo del programa quede congelado hasta agotar el *timeout*.
* **Mejor Práctica:** Integre un mecanismo colector de excepciones genéricas o manejador de errores en el último eslabón de la cadena de enrutamiento. Esto garantiza que cualquier interrupción subyacente termine en una respuesta estructurada elegante (`HTTP 500`) en lugar de generar una caída de servicio (crash).

---

## 6. Análisis Teórico de Actividades Prácticas

### Desafío de Refactorización de Monolito

El ejercicio de extraer rutas mixtas de un archivo de 100 líneas aborda directamente el concepto arquitectónico de **Separación de Preocupaciones (Separation of Concerns)**. Demuestra prácticamente cómo la eliminación del acoplamiento entre el protocolo web y la base de datos permite la escalabilidad del equipo, asegurando que un desarrollador modifique consultas mientras otro altera dominios HTTP, sin colisionar el repositorio central.

### Versionamiento Estratégico (Split firstName/lastName)

Este ejercicio ilustra la inviolabilidad de los **Contratos de Interfaz** [cite: 1.1.1]. Cuando se separan las variables de nombre [cite: 1.1.3], se modifica el DTO y se corrompen los sistemas descendentes no actualizados. La orquestación correcta (`v1Router` versus `v2Router`) permite montar ambas implementaciones simultáneas en el sistema de enrutamiento [cite: 1.1.3], evitando tiempos de inactividad mientras se traslada la responsabilidad migratoria al cliente.

### Debate del Principio Fail-Fast: ¿Dónde va la validación?

Este debate suele resolverse bifurcando la naturaleza de la validación, ubicándola en la arquitectura con reglas distintas:

| Tipo de Validación | Ubicación Arquitectónica | Explicación |
| --- | --- | --- |
| **Sintáctica y Estructural** | Rutas o Gateways (Middlewares) | Valida "La Forma" (ej: *¿Es un correo estructurado válidamente? ¿El ID es alfanumérico?*). Aplica el principio **Fail-Fast**: protege la aplicación de malformaciones al nivel más superficial de la red, devolviendo un error HTTP 400 sin siquiera tocar ciclos costosos de CPU ni el Controlador. |
| **Semántica y de Negocio** | Capa de Servicio / Gestor de Datos | Valida "El Estado" (ej: *¿Tiene fondos suficientes? ¿El correo ya se encuentra registrado?*). Requiere acceso profundo a repositorios lógicos. Es ajeno a la web y debe vivir en el núcleo. |
