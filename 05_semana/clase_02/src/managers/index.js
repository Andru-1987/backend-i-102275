import config from '../config/env.config.js'
import BookingManager from './BookingManager.js'
import ServiceManager from './ServiceManager.js'

const bookingManager = new BookingManager(config.bookingsDbPath)
const serviceManager = new ServiceManager(config.servicesDbPath)

export  {
    bookingManager,
    serviceManager
}