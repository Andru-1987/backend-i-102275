### Contenido de la pre entrega: consignas

* **Nombre de la actividad**: Actividad Pre entrega: Administrador de servicios (Node.js).
* **Objetivo**: Crear un proyecto Node.js estructurado con ESM que implemente la clase `ServiceManager` para administrar los servicios de un sistema de turnos y reservas.
* **Estructura obligatoria del repositorio público de GitHub**:
  ```bash
  src/
  ├── config/
  │   └── env.config.js
  ├── managers/
  │   └── ServiceManager.js
  ├── data/
  │   └── services.json
  └── app.js
  package.json
  .env.example
  .gitignore
  README.md
  ```
* **Criterios de aceptación**:
  1. **Configuración del proyecto**: `package.json` con `"type": "module"`, librería `dotenv` instalada y configurada, archivo local `.env` con `PORT=8080` y `NODE_ENV=development` (no subido a Git), plantilla `.env.example` en la raíz, validación Fail-Fast en `src/config/env.config.js`, y `.gitignore` ignorando `node_modules` y `.env`.
  2. **Implementación de `ServiceManager`**:
     * **Estructura del recurso Servicio**: `{ id, name, description, duration, price, category, available }`.
     * **Métodos requeridos**:
       * `getServices()`: Devuelve todos los servicios.
       * `getServiceById(id)`: Devuelve el servicio por ID o un mensaje de error/null.
       * `addService(serviceData)`: Agrega un nuevo servicio. Genera el `id` de forma autoincremental/interna (nunca recibido externamente) y valida los campos obligatorios (`name`, `description`, `duration`, `price`, `category`, `available`).
       * `updateService(id, updatedData)`: Actualiza un servicio existente sin permitir la modificación de la propiedad `id`.
       * `deleteService(id)`: Elimina el servicio correspondiente por su `id`.
  3. **Documentación (`README.md`)**: Debe incluir el nombre del proyecto, descripción general, instrucciones de instalación y ejecución, variables de entorno requeridas, descripción del recurso `services` y ejemplos prácticos de uso de cada método de `ServiceManager`.
* **Qué evitar**: Subir carpetas `node_modules` o archivos `.env` a GitHub, recibir el `id` como parámetro en `addService`, o mezclar la lógica de negocio de `ServiceManager` con los archivos de configuración de entorno.

