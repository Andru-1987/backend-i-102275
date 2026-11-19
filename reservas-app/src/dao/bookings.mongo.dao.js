import BookingModel from '../models/booking.model.js'
import { isValidId, normalizeDoc, sanitizeUpdatePayload } from '../utils/mongoUtils.js'

export default class BookingMongoDAO {
    #normalizeBookings(doc) {
        const normalized = normalizeDoc(doc)
        if (!normalized) return null

        return {
            ...normalized,
            services: (normalized.services ?? []).map(item => ({ ...item, service: String(item.service) }))
        }
    }


    async getAll() {
        const docs = await BookingModel.find().lean()
        return docs.map(doc => this.#normalizeBookings(doc))
    }
    async getById(id) {
        if (!isValidId(id)) return null
        const doc = await BookingModel.findById(id).lean()
        return this.#normalizeBookings(doc)
    }
    async create(bookingData) {
        const createdBooking = await BookingModel.create(bookingData)
        return createdBooking.toObject()
    }
    async update(id, udpatedData) {
        if (!isValidId(id)) return null
        const updateData = await BookingModel.findByIdAndUpdate(
            id,
            sanitizeUpdatePayload(udpatedData),
            { new: true, runValitadors: true }
        ).lean()
        return this.#normalizeBookings(updateData)
    }
    async delete(id) {
        if (!isValidId(id)) return null
        const deletedData = await BookingModel.findByIdAndDelete(id).lean()
        return this.#normalizeBookings(deletedData)

    }
}