## Ejercicio

* **Nombre de la clase**: Sesión en Vivo: Consolidación de Fundamentos Backend con Node.js.
* **Temario a ver (Temas a cubrir)**:
  * **Revisión de Arquitectura**: Estándar ESM vs. CommonJS (`"type": "module"`, extensión `.js` obligatoria) y rol del punto de entrada (`app.js` / `server.js`).
  * **Lógica Asíncrona**: Manejo avanzado de `async/await` en servicios de backend.
  * **Persistencia Inicial**: Desafíos y buenas prácticas al interactuar con el sistema de archivos (`fs.promises`).
  * **Integración y Seguridad**: Uso de variables de entorno como *Single Source of Truth* para evitar hardcodear credenciales o secretos.
  * **Rendimiento del Event Loop**: Impacto negativo y riesgos de bloquear el hilo principal en una API de reservas.
* **Ejercicios y actividades**:
  * **Misión: Debugging de Servicios Asíncronos **:
    * *Setup*: Análisis de una función de 'Servicio de Reservas' que falla silenciosamente al intentar escribir datos en el disco.
    * *Ejecución*: Los estudiantes deben identificar la causa raíz del fallo (problemas de permisos, errores en la construcción de rutas mediante strings manuales vs. `path.join`, o falta de `await`/unhandled promise rejections).
    * *Cierre*: Resolución del bug aplicando `path.join`, bloques `try/catch` y `fs.promises`.
  * **Debate: Arquitectura de Carpetas Pro **:
    * *Dinámica*: Presentación de 3 formas distintas de organizar el directorio `src/` y `config/`.
    * *Acción*: Discusión en sub-salas sobre cuál esquema resulta más mantenible a medida que el proyecto escala.
    * *Cierre*: Síntesis del instructor sobre los beneficios de la arquitectura modular estructurada por sobre la organización plana.

