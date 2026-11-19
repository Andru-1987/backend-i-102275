import { bookingsRepository, servicesRepository } from "../repositories/index.js";
import ServicesService from "./services.service.js";
import BookingsService from "./bookings.service.js";

const servicesService = new ServicesService(servicesRepository)
const bookingsService = new BookingsService(bookingsRepository, servicesRepository)

export { servicesService, bookingsService }
