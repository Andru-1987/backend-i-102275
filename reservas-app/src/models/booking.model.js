import { Schema, model } from 'mongoose'
import { bookingMaxDuration, bookingStatus } from '../config/constants.js'


const bookingSchema = new Schema({
    clientName: { type: String, trim: true, required: true },
    clientEmail: { type: String, trim: true, lowercase: true },
    date: { type: Date, required: true, default: Date.now }, // pesado que guardar un tipo date   
    time: { type: Number, required: true, min: 0, max: bookingMaxDuration, validate: { validator: Number.isInteger } },
    status: { type: String, enum: bookingStatus, default: "pending" },
    services: [{
        _id: false, service: { type: Schema.Types.ObjectId, ref: "Service", required: true }, quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }]
})

export default model("Booking", bookingSchema)