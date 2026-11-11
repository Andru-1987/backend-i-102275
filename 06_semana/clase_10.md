## 3. Contenido de la Primera Sesión

* **Nombre de la clase**: Sesión en Vivo: Dominando MongoDB Atlas y Mongoose.
* **Temario a ver**:
  * Arquitectura real y modelado de esquemas complejos en Mongoose para sistemas de reservas y pagos.
  * Configuración avanzada y seguridad en MongoDB Atlas (más allá del nivel gratuito M0, administración de clusters e IP Whitelisting).
  * Escalabilidad e infraestructura: Mecanismos de alta disponibilidad mediante *Replica Sets*, *Sharding* y límites BSON (el límite técnico de 16MB por documento que determina el uso de referencias frente a documentos embebidos).
  * Middlewares de Mongoose (hooks `pre` y `post`), discriminadores y lógica preventiva.
  * Troubleshooting avanzado de errores de red, permisos de IP y validaciones de Schema.
  * Optimización y análisis de rendimiento de consultas mediante MongoDB Compass.
* **Ejercicios y actividades**:
  1. **Challenge de Conectividad y Debugging Atlas (15 min)**:
     * *Dinámica*: Trabajo en parejas o tríos dentro de *breakout rooms*. Se entrega un código de conexión a Mongoose roto (errores de IP no autorizada, credenciales inválidas o base de datos mal indicada en la cadena de conexión). Los estudiantes diagnostican y corrigen la falla usando el panel de Atlas y MongoDB Compass.
  2. **Modeling Workshop: Sistema Escolar Real (30 min)**:
     * *Dinámica*: Diseño grupal (3 integrantes) de la estructura de "Pagos y Matrículas" para un sistema escolar. Se debaten campos obligatorios, manejo de estados (`pendiente`, `pagado`) y la decisión entre referenciar o embeber documentos.
     * *Demostración*: El instructor muestra la implementación de un Mongoose Middleware (`.pre('save')`) para la actualización automática del estado de la transacción.
  3. **Live Debugging**: Análisis colectivo de fallos en validaciones de Mongoose y corrección inmediata mediante middlewares.


