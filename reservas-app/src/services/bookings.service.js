import { NotFoundError, ValidationError } from "../errors/appErrors.js";

export default class BookingsService {
  constructor(bookingsRepository, servicesRepository) {
    this.bookingsRepository = bookingsRepository;
    this.servicesRepository = servicesRepository;
  }

  async getBookings() {
    return await this.bookingsRepository.getAll();
  }
  async getBookingById(id) {
    return await this.bookingsRepository.getById(id);
  }
  async createBooking(bookingData) {
    const { clientName, clientEmail, date, time } = bookingData ?? {};

    // for (const field of [clientName, clientEmail, date, time]) {
    //   if (typeof field !== "string" || !field.trim()) {
    //     throw new ValidationError("Faltan campos obligatorios en la reserva");
    //   }
    // }

    const newBooking = {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      date,
      time,
      status: "pending",
      services: [],
    };
    return await this.bookingsRepository.create(newBooking);
  }

  // http POST http://127.0.0.1:3000/api/v1/bookings/:bid/services/:sid bid==6afee9470f87b084b7239451 sid==6afc4ef9016fad99c9f5d017
  // http POST http://127.0.0.1:3000/api/v1/bookings/6afee9470f87b084b7239451/services/6afc4ef9016fad99c9f5d017 bid==6afee9470f87b084b7239451 sid==6afc4ef9016fad99c9f5d017

  async addServiceToBooking(bookingId, serviceId) {
    console.log(bookingId, serviceId)
    const booking = await this.bookingsRepository.getById(bookingId);
    if (!booking) throw new NotFoundError("Reserva no encontrada");

    const service = await this.servicesRepository.getById(serviceId);
    if (!service) throw new NotFoundError("Servicio no encontrado");

    const updetedBooking = {
      ...booking,
      services: booking.services.map((item) => ({ ...item })),
    };

    const existingService = updetedBooking.services.find(
      (item) => item.service === serviceId,
    );
    if (existingService) {
      console.log(existingService);
      existingService.quantity++;
      console.log(existingService);
    } else {
      updetedBooking.services.push({
        service: serviceId,
        quantity: 1,
      });
    }
    return await this.bookingsRepository.update(bookingId, updetedBooking);
  }
}
