import { servicesDAO, bookingsDAO } from "../dao/index.js";
import ServicesRepository from "./services.repository.js";
import BookingsRepository from "./bookings.repository.js";

const servicesRepository = new ServicesRepository(servicesDAO)
const bookingsRepository = new BookingsRepository(bookingsDAO)

export {servicesRepository, bookingsRepository}