import { readFile, writeFile } from "node:fs/promises";

export default class BookingDAO {
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

  async getAll() {
    return await this.#read();
  }

  async getById(id) {
    const bookings = await this.#read();

    return bookings.find((booking) => booking.id === Number(id)) ?? null;
  }

  async create(bookingData) {
    const bookings = await this.#read();
    //Generamos un ID numerico consecutivo
    const id =
      bookings.length > 0
        ? Math.max(...bookings.map((booking) => booking.id)) + 1
        : 1;

    const newBooking = { ...bookingData, id };
    bookings.push(newBooking);
    await this.#save(bookings);
  }

  async update(id, updatedData) {
    const bookings = await this.#read();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) return null;

    bookings[index] = { ...bookings[index], ...updatedData, id };
    await this.#save(bookings)
    return bookings[index]
  }
}
