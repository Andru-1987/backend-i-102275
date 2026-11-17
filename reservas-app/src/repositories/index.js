import { servicesDAO, bookingsDAO, servicesMongoDAO} from "../dao/index.js";
import ServicesRepository from "./services.repository.js";
import BookingsRepository from "./bookings.repository.js";

const servicesRepository = new ServicesRepository(servicesMongoDAO)
const bookingsRepository = new BookingsRepository(bookingsDAO)

export {servicesRepository, bookingsRepository}