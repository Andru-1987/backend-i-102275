export default class BookingsRepository {
  constructor(bookingsDAO) {
    this.bookingsDAO = bookingsDAO;
  }

  async getAll() {
    return await this.bookingsDAO.getAll();
  }
  async getById(id) {
    return await this.bookingsDAO.getById(id);
  }
  async create(bookingData) {
    return await this.bookingsDAO.create(bookingData);
  }
  async update(id, updatedData) {
    return await this.bookingsDAO.update(id, updatedData);
  }
}
