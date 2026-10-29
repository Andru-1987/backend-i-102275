import { readFile, writeFile } from "node:fs/promises";

const REQUIRED_FIELDS = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available",
];

function invalid(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

export default class ServiceManager {
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

  async getServices() {
    const data = await readFile(this.databasePath, "utf8");
    return JSON.parse(data);
  }

  async getServiceById(idService) {
    const data = await this.#read();
    return data.find((service) => service.id === idService) ?? null;
  }

  validate(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw invalid("La data tiene que ser un objeto JSON");
    }
    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null) {
        throw invalid(`El campo ${field} -> esta faltante`);
      }
    }
    if (typeof data.available !== "boolean") {
      throw invalid("El campo available debe ser True o False");
    }
  }

  async addService(serviceData) {
    this.validate(serviceData);
    const data = await this.#read();

    const id =
      data.length > 0 ? Math.max(...data.map((service) => service.id)) + 1 : 1;
    const newService = { ...serviceData, id };

    data.push(newService);
    await this.#save(data);

    return newService;
  }

  async updateService(idService, updatedServiceData) {
    const searchedService = await this.getServiceById(idService);

    console.log(searchedService);

    if (!searchedService) {
      return { payload: searchedService, status: "notOk" };
    }

    const services = await this.#read();

    services[idService] = { ...searchedService, ...updatedServiceData };

    await this.#save(services);
    return services[idService];
  }

  async deleteService(idService) {
    const services = await this.#read();
    // Buscamos la posicion del servicio comparando su ID
    const index = services.findIndex((service) => service.id === idService);

    //Si no existe, devolvemos null . El servidor responde 404
    if (index === -1) {
      return null;
    }

    // Eliminamos el servicio y guardamos el objeto eliminado
    const [deletedService] = services.splice(index, 1);
    //Guardamos
    await this.#save(services);
    return deletedService;
  }

  //   async deleteService(idService) {
  //     const services = await this.#read();

  //     const filteredServices = services.filter(
  //       (service) => service?.id !== idService,
  //     );

  //     await this.#save(filteredServices);

  //     return idService;
  //   }
}
