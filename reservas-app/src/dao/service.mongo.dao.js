import ServiceModel from '../models/service.model.js'

export default class ServiceMongoDAO {
    async getAll() {
        return await ServiceModel.find().lean()
    }
    async getById(id) {
        return await ServiceModel.findById(id).lean()
    }

    async create(serviceData) {
        const service = await ServiceModel.create(serviceData)
        return service.toObject()
    }
    async update(id, updateData) {
        const updatedService = await ServiceModel.findByIdAndUpdate(id, updateData, { new: true }).lean()
        return updatedService
    }
    async delete(id) {
        return await ServiceModel.findByIdAndDelete(id).lean()
    }
}