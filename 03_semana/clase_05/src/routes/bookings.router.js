import { Router} from "express"
import config from "../config/env.config.js"
import BookingManager from "../managers/BookingManager.js"
import ServiceManager from "../managers/ServiceManager.js"

const router = new Router()

const bookingManager = new BookingManager(config.bookingsDbPath)
const serviceManager = new ServiceManager(config.dbPath)


router.get("/", async(request, response) =>{
    try{
        const bookings = await bookingManager.getBookings()
        return response.status(200).json({
            status: "succes",
            payload: bookings
        })

    }
    catch(error){
return response.status(500).json({
    status: "error",
    message: "No se pudo consultar las reservas"
})
    }
})
router.post("/", async (request, response)=>{
    try{
        const {clientName, clientEmail, date, time} = request.body
        const newBooking= await bookingManager.createBooking({
            clientName,
            clientEmail,
            date,
            time
        })
        return response.status(201).json({
            status: "succes",
            payload: newBooking
        })
    }
    catch(error){
return response.status(500).json({
    status: "error",
    message: "No se pudo crear la reserva"
})
    }
})


export default router