import config from "../config/env.config.js";
import ServicesDAO from "./services.dao.js";
const servicesDAO = new ServicesDAO(config.servicesDbPath);

export { servicesDAO };
