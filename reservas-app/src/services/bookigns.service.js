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

    for (const field of [clientName, clientEmail, date, time]) {
      if (typeof field !== "string" || !field.trim()) {
        throw ValidationError("Faltan campos obligatorios en la reserva");
      }
    }

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

  async addServiceToBooking(bookingId, serviceId) {
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
        service: Number(serviceId),
        quantity: 1,
      });
    }
    return await this.bookingsRepository.update(bookingId, updetedBooking);
  }
}
