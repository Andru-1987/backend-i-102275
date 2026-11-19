import config from "../config/env.config.js";
import ServicesDAO from "./services.dao.js";
import BookingDAO from "./bookings.dao.js";

import ServiceMongoDAO from "./service.mongo.dao.js";
import BookingMongoDAO from "./bookings.mongo.dao.js"

const servicesDAO = new ServicesDAO(config.servicesDbPath);
const bookingsDAO = new BookingDAO(config.bookingsDbPath)

const servicesMongoDAO = new ServiceMongoDAO();
const bookingsMongoDAO = new BookingMongoDAO();

export { servicesDAO, bookingsDAO, servicesMongoDAO, bookingsMongoDAO };
