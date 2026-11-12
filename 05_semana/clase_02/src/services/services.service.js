import { ValidationError } from "../errors/appErrors.js";

const REQUIRED_FIELDS = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available",
];

export default class ServicesService {
  constructor(servicesRepository) {
    this.servicesRepository = servicesRepository;
  }

  validate(data, partial = false) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new ValidationError("La data tiene que ser un objeto JSON");
    }
    // Para el metodo POST exigimos todos los campos. Para le PUT aceptamos campos parciales
    if (!partial) {
      for (const field of REQUIRED_FIELDS) {
        if (data[field] === undefined || data[field] === null) {
          throw new ValidationError(`El campo ${field} -> esta faltante`);
        }
      }
    } else if (Object.keys(data).length === 0) {
      throw new ValidationError(
        "Debe enviar al menos un campo para actualizar",
      );
    }

    //Validamos available solo si fue enviado. Permite actualizar otros campos sin enviar available.

    if (data.available !== undefined && typeof data.available !== "boolean") {
      throw new ValidationError("El campo available debe ser True o False");
    }
  }

  async getServices({ category, available } = {}) {
    let services = await this.servicesRepository.getAll();
    if (category) {
      services = services.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (available !== undefined) {
      const isAvailable = available === "true";
      services = services.filter((s) => s.available === isAvailable);
    }
    return services;
  }

  async getServiceById(id) {
    return await this.servicesRepository.getById(id);
  }
  async createService(serviceData) {
    this.validate(serviceData);
    return await this.servicesRepository.create(serviceData);
  }

  async updateService(id, updatedData) {
    this.validate(updatedData, true);
    this.servicesRepository.update(id, updatedData);
    return await this.servicesRepository.update(id, updatedData);
  }

  async deleteService(id) {
    return await this.servicesRepository.delete(id);
  }
}
