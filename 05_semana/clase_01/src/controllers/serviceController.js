import ApiResponse from "../utils/apiResponse.js";
import { NotFoundError } from "../errors/appErrors.js";

export default class ServiceController {
  constructor(servicesService) {
    this.servicesService = servicesService;
  }

  getAll = async (request, response) => {
    const { category, available } = request.query;
    const services = await this.servicesService.getServices({
      category,
      available,
    });

    return ApiResponse.sendSuccess(
      response,
      services,
      "Servicios obtenidos correctamente",
    );
  };

  getById = async (request, response) => {
    const serviceId = Number(request.params.id);
    
    const serviceItem = await this.servicesService.getServiceById(serviceId);

    if (!serviceItem) throw new NotFoundError("Servicio no encontrado");

    return ApiResponse.sendSuccess(
      response,
      serviceItem,
      "Servicio obtenido correctamente",
    );
  };

  create = async (request, response) => {
    const newService = await this.servicesService.createService(request.body);
    return ApiResponse.sendCreated(
      response,
      newService,
      "Servicio creado correctamente",
    );
  };

  update = async (request, response) => {
    const serviceId = Number(request.params.id);
    const updatedService = await this.servicesService.updateService(
      serviceId,
      request.body,
    );

    if (!updatedService) throw new NotFoundError("Servicio no encontrado");

    return ApiResponse.sendUpdated(
      response,
      updatedService,
      "Servicio actualizado correctamente",
    );
  };

  delete = async (request, response) => {
    const serviceId = Number(request.params.sid);
    const deletedService = await this.servicesService.deleteService(serviceId);

    if (!deletedService) throw new NotFoundError("Servicio no encontrado");

    return ApiResponse.sendDeleted(
      response,
      deletedService,
      "Servicio eliminado correctamente",
    );
  };
}
