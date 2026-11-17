import config from "../config/env.config.js";
import ServicesDAO from "./services.dao.js";
import BookingDAO from "./bookings.dao.js";

import ServiceMongoDAO from "./service.mongo.dao.js";

const servicesDAO = new ServicesDAO(config.servicesDbPath);
const bookingsDAO = new BookingDAO(config.bookingsDbPath)

const servicesMongoDAO = new ServiceMongoDAO();

export { servicesDAO,bookingsDAO, servicesMongoDAO };
