export default class ServicesRepository {
  constructor(servicesDAO) {
    this.servicesDAO = servicesDAO;
  }

  async getAll() {
    return await this.servicesDAO.getAll();
  }
  async getById(id) {
    return await this.servicesDAO.getById(id);
  }

  async create(serviceData) {
    return await this.servicesDAO.create(serviceData);
  }

  async update(id, updatedData) {
    return await this.servicesDAO.update(id, updatedData);
  }
  async delete(id) {
    return await this.servicesDAO.delete(id);
  }
}
