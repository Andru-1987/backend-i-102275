## Contenido de la Segunda Sesión

* **Nombre de la clase**: Sesión en Vivo: Consolidación: MongoDB Atlas y Mongoose.
* **Temario a ver**:
  * Desglose y distinción de responsabilidades de las 3 capas del stack: **MongoDB Atlas** (Infraestructura DBaaS en la nube), **MongoDB** (Motor de base de datos) y **Mongoose** (ODM / Director de orquesta desde Node.js).
  * Modelado estratégico: Criterios para elegir entre documentos embebidos o referenciados en función de los patrones de acceso y restricciones de tamaño.
  * Patrones de uso: Validaciones avanzadas, middlewares de Mongoose y consumo correcto del método `.populate()`.
  * Debugging forense de errores en la cadena de conexión, modelos y consultas.
* **Ejercicios y actividades**:
  1. **Mapa Mental: Las 3 Capas de la Persistencia NoSQL (15 min)**:
     * *Dinámica*: Construcción colaborativa sobre un lienzo en blanco para definir el flujo de responsabilidades, concluyendo en el diagrama de arquitectura: `App → Mongoose → DB Engine → Cloud Infrastructure`.
  2. **Laboratorio de Errores Intencionales / Forensics (25 min)**:
     * *Dinámica*: Análisis de 3 casos reales de falla (bloqueo de IP en el Whitelist de Atlas, error de tipos de datos en un Schema de Mongoose y error de valor `undefined` por un `populate` con referencia inválida). La clase diagnostica en qué capa específica se origina el problema.
  3. **Desafío de Modelado: ¿Embeber o Referenciar? (30 min)**:
     * *Dinámica*: Trabajo en equipos ajustando el diseño del esquema para un sistema de "Reservas de Turnos" (Servicios, Clientes y Profesionales), debatiendo los pros y contras de la redundancia frente a la integridad de los datos según los requerimientos del negocio.
