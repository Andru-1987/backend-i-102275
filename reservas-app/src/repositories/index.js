import { servicesDAO, bookingsDAO, servicesMongoDAO, bookingsMongoDAO } from "../dao/index.js";
import ServicesRepository from "./services.repository.js";
import BookingsRepository from "./bookings.repository.js";

const servicesRepository = new ServicesRepository(servicesMongoDAO)
const bookingsRepository = new BookingsRepository(bookingsMongoDAO)

export { servicesRepository, bookingsRepository }