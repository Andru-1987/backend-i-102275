import { readFile, writeFile } from "node:fs/promises";

export default class BookingManager {
  constructor(databasePath) {
    this.databasePath = databasePath;
  }

  async #read() {
    const data = await readFile(this.databasePath, "utf8");
    return JSON.parse(data);
  }

  async #save(bookings) {
    await writeFile(this.databasePath, JSON.stringify(bookings, null, 2));
  }

  async getBookings() {
    const bookings = await this.#read();
    return bookings;
  }

  async getBookingById(idBooking) {
    const bookings = await this.#read();

    return bookings.find((booking) => booking.id === Number(idBooking)) ?? null;
  }

  // Crear una reserva nueva.

  async createBooking(bookingData) {
    const { clientName, clientEmail, date, time } = bookingData;

    if (
      typeof clientName !== "string" ||
      !clientName.trim() ||
      typeof clientEmail !== "string" ||
      !clientEmail.trim() ||
      typeof date !== "string" ||
      !date.trim() ||
      typeof time !== "string" ||
      !time.trim()
    ) {
      throw new Error("Faltan campos obligatorios en la reserva");
    }
    const bookings = await this.#read();
    //Generamos un ID numerico consecutivo
    const id =
      bookings.length > 0
        ? Math.max(...bookings.map((booking) => booking.id)) + 1
        : 1;

    const newBooking = {
      id,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      date,
      time,
      status: "pending",
      services: [],
    };
    bookings.push(newBooking);
    await this.#save(bookings);
    return newBooking;
  }

  //Agrega un servicio a una reserva o incrementa su cantidad.

  async addServiceToBooking(idBooking, idService) {
    const bookings = await this.#read();
    //Buscamos la reserva dentro del array
    const booking = bookings.find((item) => item.id === Number(idBooking));
    if (!booking) return null;

    const existingService = booking.services.find(
      (item) => item.service === Number(idService),
    );
    if (existingService) {
      existingService.quantity++;
    } else {
      booking.services.push({
        service: Number(idService),
        quantity: 1,
      });
    }
    await this.#save(bookings);
    return booking;
  }
}
