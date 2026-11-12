import baseRouter from '../routes/baseRouter.js'
import BookingController from '../controllers/bookController.js'
import { bookingsService} from '../services/index.js'

const bookingController = new BookingController(bookingsService)
const router = baseRouter(bookingController)

export default router.post('/:bid/services/:sid', bookingController.addServiceToBooking)
