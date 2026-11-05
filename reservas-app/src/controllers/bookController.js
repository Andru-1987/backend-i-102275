import ApiResponse from "../utils/apiResponse.js";
import { NotFoundError } from "../errors/appErrors.js";

export default class BookingController {
    constructor(bookingManager, serviceManager) {
        console.log('BookingController inicializado', bookingManager, serviceManager)
        this.bookingManager = bookingManager
        this.serviceManager = serviceManager
    }

    getAll = async (request, response) => {

        const bookings = await this.bookingManager.getBookings();

        if (!bookings || bookings.length === 0) throw new NotFoundError('No se encontraron reservas');

        return ApiResponse.sendSuccess(response, bookings, 'Reservas obtenidas correctamente');
    }

    getById = async (request, response) => {
        const bookingId = Number(request.params.bid);
        const bookingItem = await this.bookingManager.getBookingById(bookingId);

        if (!bookingItem) throw new NotFoundError('Reserva no encontrada');

        return ApiResponse.sendSuccess(response, bookingItem, 'Reserva obtenida correctamente');
    }

    create = async (request, response) => {
        const { clientName, clientEmail, date, time } = request.body;
        const newBooking = await this.bookingManager.createBooking({
            clientName,
            clientEmail,
            date,
            time,
        });

        return ApiResponse.sendCreated(response, newBooking, 'Reserva creada correctamente');
    }

    addServiceToBooking = async (request, response) => {
        const bookingId = Number(request.params.bid);
        const serviceId = Number(request.params.sid);

        const booking = await this.bookingManager.getBookingById(bookingId);

        if (!booking) throw new NotFoundError('Reserva no encontrada');

        const serviceItem = await this.serviceManager.getServiceById(serviceId);
        if (!serviceItem) throw new NotFoundError('Servicio no encontrado');

        const updatedBooking = await this.bookingManager.addServiceToBooking(
            bookingId,
            serviceId
        );
        return ApiResponse.sendSuccess(response, updatedBooking, 'Servicio agregado a la reserva correctamente');
    }

}