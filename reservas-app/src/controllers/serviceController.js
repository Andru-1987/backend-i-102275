import ApiResponse from "../utils/apiResponse.js";
import {NotFoundError} from "../errors/appErrors.js";

export default class ServiceController {
    
    constructor(serviceManager) {
        console.log('ServiceController inicializado', serviceManager)
        this.serviceManager = serviceManager
    }

    getAll = async (request, response) => {
        let services = await this.serviceManager.getServices()
        const { category, available } = request.query

        if (category) {
            services = services.filter(s => s.category.toLowerCase() === category.toLowerCase())
        }

        if (available !== undefined) {
            const isAvailable = available === 'true'
            services = services.filter(s => s.available === isAvailable)
        }

        return ApiResponse.sendSuccess(response, services, 'Servicios obtenidos correctamente')
    }

    getById = async (request, response) => {
        const serviceId = Number(request.params.sid)
        const serviceItem = await this.serviceManager.getServiceById(serviceId)

        if (!serviceItem) throw new NotFoundError('Servicio no encontrado')

        return ApiResponse.sendSuccess(response, serviceItem, 'Servicio obtenido correctamente')
    }

    create = async (request, response) => {
        const { name, description, duration, price, category, available } = request.body
        const newService = await this.serviceManager.addService({
            name,
            description,
            duration,
            price,
            category,
            available
        })
        return ApiResponse.sendCreated(response, newService, 'Servicio creado correctamente')
    }

    update = async (request, response) => {
        const serviceId = Number(request.params.sid)
        const updateServiceFields = request.body
        const updatedService = await this.serviceManager.updateService(serviceId, updateServiceFields)

        if (!updatedService) throw new NotFoundError('Servicio no encontrado')

        return ApiResponse.sendUpdated(response, updatedService, 'Servicio actualizado correctamente')
    }

    delete = async (request, response) => {
        const serviceId = Number(request.params.sid)
        const deletedService = await this.serviceManager.deleteService(serviceId)

        if (!deletedService) throw new NotFoundError('Servicio no encontrado')

        return ApiResponse.sendDeleted(response, deletedService, 'Servicio eliminado correctamente')
    }
}


