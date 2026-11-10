import ServicesRepository from "../repositories/services.repository.js";
import ServicesService from "./services.service.js";
import { servicesDAO } from "../dao/index.js";

// Creamos una instancia del repositorio y le inyectamos el DAO.
// El repositorio se encargará de comunicarse con la capa de datos.
const servicesRepository = new ServicesRepository(servicesDAO);

// Creamos una instancia del servicio y le inyectamos el repositorio.
// El servicio se encargará de las validaciones y la lógica de negocio.
const servicesService = new ServicesService(servicesRepository);

// Exportamos la instancia para utilizarla desde el controller.
export { servicesService };