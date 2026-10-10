*Sistema Backend usando NodeJs**
El trayecto abarca desde los fundamentos de la arquitectura no bloqueante de **Node.js** y la creación de servidores con **Express**, hasta la implementación de una **arquitectura en capas profesional** (Routers, Controllers, Services, Repositories y DAO). A lo largo del programa, la persistencia evoluciona desde archivos locales JSON con **FileSystem** hacia una base de datos NoSQL en la nube con **MongoDB Atlas y Mongoose**, integrando además **validaciones con Zod/Joi**, **vistas dinamizadas con Handlebars** y **comunicación en tiempo real con Socket.io**.

---

### Lista de módulos y clases del curso

1. **Semana 1: Fundamentos de JavaScript Backend y Node.js**
   * **Contenido principal:** Funcionamiento interno de Node.js (motor V8, libuv y la arquitectura orientada a eventos del Event Loop). Configuración de proyectos usando sintaxis moderna de módulos ECMAScript (ESM con `import`/`export`), gestión de variables de entorno con `dotenv` y estructura profesional de carpetas (`src/`, `config/`, `routes/`, etc.).
   * **Práctica integradora:** Construcción de un primer administrador de servicios (`ServiceManager`) en memoria para el sistema de reservas.

2. **Semana 2: Servidores con Express y API REST**
   * **Contenido principal:** Creación de servidores web con Express.js y fundamentos del diseño de APIs RESTful. Flujo de petición/respuesta (`req`/`res`), semántica de verbos HTTP (GET, POST, PUT, DELETE), códigos de estado y uso de middlewares como `express.json()`.
   * **Práctica integradora:** Diseño y construcción de los primeros endpoints REST para el recurso de servicios.

3. **Semana 3: Persistencia Inicial con FileSystem**
   * **Contenido principal:** Conceptos de persistencia de datos local en archivos JSON (`services.json` y `bookings.json`). Manejo asíncrono no bloqueante con el módulo nativo `fs.promises` (`readFile`, `writeFile`), serialización (`JSON.stringify`) y parseo (`JSON.parse`).
   * **Práctica integradora:** Transformación de `ServiceManager` y `BookingManager` para implementar un CRUD persistido en disco.

4. **Semana 4: Routers, Controllers y Organización de la API**
   * **Contenido principal:** Aplicación del principio de Separación de Responsabilidades (SoC) para evitar el "código espagueti" o controladores sobrecargados. Segmentación modular de rutas mediante `express.Router()` y aislamiento de la lógica de transporte HTTP en la capa de controladores.
   * **Práctica integradora:** Reorganización de la API separando los módulos de rutas y controladores para los recursos de servicios y reservas.

5. **Semana 5: Arquitectura en Capas: DAO y Repository**
   * **Contenido principal:** Introducción a la arquitectura en capas para preparar el código hacia escenarios escalables. Delimitación de funciones entre la capa **Service** (reglas y lógica de negocio), la capa **Repository** (abstracción del dominio) y la capa **DAO** (Data Access Object para operaciones técnicas de persistencia).
   * **Práctica integradora:** Refactorización del backend al flujo `router → controller → service → repository → DAO` manteniendo los endpoints existentes.

6. **Semana 6: MongoDB Atlas y Mongoose**
   * **Contenido principal:** Transición desde FileSystem hacia bases de datos NoSQL orientadas a documentos. Configuración de un cluster en la nube con MongoDB Atlas y conexión mediante el ODM Mongoose. Definición de `Schemas` (tipos, validaciones, timestamps, hooks) y `Models` para las colecciones `services`, `bookings` y `messages`.
   * **Práctica integradora:** Migración de la capa de persistencia DAO para operar directamente sobre colecciones en MongoDB Atlas.

7. **Semana 7: Vistas con Handlebars y WebSockets**
   * **Contenido principal:** Renderizado del lado del servidor (SSR) mediante el motor de plantillas Handlebars para presentar datos dinámicos en HTML. Implementación de comunicación bidireccional en tiempo real mediante WebSockets con Socket.io (eventos `socket.emit`, `io.emit`).
   * **Práctica integradora:** Creación de rutas de vistas server-side (`/views/services`, `/views/availability`) e integración de Socket.io para reflejar cambios de disponibilidad al instante sin recargar la página.

8. **Semana 8: Consultas Avanzadas, Validación y Populate**
   * **Contenido principal:** Optimización de consultas en MongoDB implementando filtros dinámicos por query params, paginación (`page`, `limit`, `skip`) y ordenamiento por precio. Blindaje del backend con esquemas de validación preventiva usando Zod o Joi en la capa de entrada. Gestión de relaciones mediante referencias de `ObjectId` y uso del método `.populate()` para consultar datos completos.
   * **Práctica integradora:** Incorporación de esquemas de validación Zod/Joi, respuesta con metadatos de paginación y popularización de servicios en las reservas.

9. **Semana 9: Proyecto Final: Sistema de Gestión de Reservas Profesional**
   * **Contenido principal:** Integración total de todos los componentes del sistema (arquitectura en capas, MongoDB, Zod/Joi, Handlebars y Socket.io). Prevención de problemas de concurrencia o sobrereservas (*race conditions*), configuración del entorno con variables `.env` y documentación técnica del repositorio en el archivo `README.md`.
   * **Práctica integradora:** Consolidación y publicación del proyecto final completo en un repositorio público de GitHub.
