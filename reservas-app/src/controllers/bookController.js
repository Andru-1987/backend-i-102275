import ApiResponse from "../utils/apiResponse.js";
import { NotFoundError } from "../errors/appErrors.js";

export default class BookingController {
  constructor(bookingService) {
    this.bookignsService = bookingService;
  }

  getAll = async (request, response) => {
    const bookings = await this.bookignsService.getBookings();

    if (!bookings || bookings.length === 0)
      throw new NotFoundError("No se encontraron reservas");

    return ApiResponse.sendSuccess(
      response,
      bookings,
      "Reservas obtenidas correctamente",
    );
  };

  getById = async (request, response) => {
    const bookingId = Number(request.params.id);
    const bookingItem = await this.bookignsService.getBookingById(bookingId);

    if (!bookingItem) throw new NotFoundError("Reserva no encontrada");

    return ApiResponse.sendSuccess(
      response,
      bookingItem,
      "Reserva obtenida correctamente",
    );
  };

  create = async (request, response) => {
    const newBooking = await this.bookignsService.createBooking(request.body)
    return ApiResponse.sendSuccess(response, newBooking, "Reserva creada correctamente")
  };

  addServiceToBooking = async (request, response) => {
    const bookingId = request.params.bid;
    const serviceId = request.params.sid;

    const booking = await this.bookignsService.addServiceToBooking(bookingId, serviceId)
    return ApiResponse.sendSuccess(response, booking, "Servicio agregado a la reserva correctamente")
  };
}
