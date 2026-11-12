import { readFile, writeFile } from "node:fs/promises";

// El DAO (Data Acces Object) se encarga de leer y escribir los servicios en el archivo JSON

export default class ServicesDAO {
  constructor(databasePath) {
    this.databasePath = databasePath;
  }

  async #save(services) {
    await writeFile(this.databasePath, JSON.stringify(services, null, 2));
  }

  async #read() {
    const data = await readFile(this.databasePath, "utf8");

    return JSON.parse(data);
  }

  async getAll() {
    return await this.#read();
  }

  async getById(id) {
    const services = await this.#read();
    return services.find((service) => service.id === id) ?? null;
  }

  async create(serviceData) {
    const services = await this.#read();

    const id =
      services.length > 0
        ? Math.max(...services.map((service) => service.id)) + 1
        : 1;
    const newService = { ...serviceData, id };

    services.push(newService);
    await this.#save(services);

    return newService;
  }

  async update(id, updatedData) {
    const services = await this.#read();

    const index = services.findIndex((service) => service.id === id);
    if (index === -1) return null;

    services[index] = { ...services[index], ...updatedData, id };
    await this.#save(services);
    return services[index];
  }

  async delete(id) {
    const services = await this.#read();
    const index = services.findIndex((service) => service.id === id);

    if (index === -1) {
      return null;
    }

    const [deletedService] = services.splice(index, 1);

    await this.#save(services);
    return deletedService;
  }
}
