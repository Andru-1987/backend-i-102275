import baseRouter from '../routes/baseRouter.js'
import BookingController from '../controllers/bookController.js'
import { bookingManager , serviceManager} from '../managers/index.js'

const bookingController = new BookingController(bookingManager, serviceManager)
const router = baseRouter(bookingController)

export default router.post('/:bid/services/:sid', bookingController.addServiceToBooking)
