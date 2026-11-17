import config from "../config/env.config.js";
import ServicesDAO from "./services.dao.js";
import BookingDAO from "./bookings.dao.js";
const servicesDAO = new ServicesDAO(config.servicesDbPath);
const bookingsDAO = new BookingDAO(config.bookingsDbPath)

export { servicesDAO,bookingsDAO };
