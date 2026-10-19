### 4. Contenido de la segunda sesión: Temario a ver y ejercicios

* **Nombre de la clase**: Sesión en Vivo: Consolidación de Servidores con Express y API REST.
* **Temario a ver**:
  * **Arquitectura RESTful**: Análisis crítico del uso de verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`) e idempotencia.
  * **Gestión de datos**: Uso adecuado de `req.params`, `req.query` y `req.body` según el propósito de la consulta.
  * **Middlewares de Poder**: Implementación de lógica transversal y middlewares de validación.
  * **Respuestas Semánticas**: Aplicación estricta de códigos de estado (`200`, `201`, `400`, `404`, `500`) para garantizar previsibilidad.
* **Ejercicios y actividades**:
  * **Live Debugging: El Código Roto (25 min)**: Análisis colectivo de un servidor Express con malas prácticas (verbos incorrectos, respuestas 200 en casos de error y falta de validaciones) con refactorización en tiempo real.
  * **Workshop: Diseño de Contratos de API (25 min)**: Ejercicio grupal donde se recibe un requerimiento del negocio (ej. sistema de reserva de turnos médicos) y se define la estructura de las URLs, métodos HTTP, datos por `params`/`query`/`body` y los códigos HTTP de respuesta.

