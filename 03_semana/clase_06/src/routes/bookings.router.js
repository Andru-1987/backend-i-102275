import { request, response, Router } from "express";
import config from "../config/env.config.js";
import BookingManager from "../managers/BookingManager.js";
import ServiceManager from "../managers/ServiceManager.js";

const router = new Router();

const bookingManager = new BookingManager(config.bookingsDbPath);
const serviceManager = new ServiceManager(config.dbPath);

router.get("/", async (request, response) => {
  try {
    const bookings = await bookingManager.getBookings();
    return response.status(200).json({
      status: "succes",
      payload: bookings,
    });
  } catch (error) {
    return response.status(500).json({
      status: "error",
      message: "No se pudo consultar las reservas",
    });
  }
});
router.post("/", async (request, response) => {
  try {
    const { clientName, clientEmail, date, time } = request.body;
    const newBooking = await bookingManager.createBooking({
      clientName,
      clientEmail,
      date,
      time,
    });
    return response.status(201).json({
      status: "succes",
      payload: newBooking,
    });
  } catch (error) {
    return response.status(500).json({
      status: "error",
      message: "No se pudo crear la reserva",
    });
  }
});
router.get("/:bid", async (request, response) => {
  try {
    const bookingId = Number(request.params.bid);
    const bookingItem = await bookingManager.getBookingById(bookingId);

    if (!bookingItem)
      return response
        .status(404)
        .json({ status: "error", message: "booking no encontrado" });
    return response
      .status(200)
      .json({ status: "succes", payload: bookingItem });
  } catch (error) {
    return response.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/:bid/services/:sid", async (request, response) => {
    try {
      const bookingId = Number(request.params.bid);
      const serviceId = Number(request.params.sid);

      const booking = await bookingManager.getBookingById(bookingId);

      if (!booking) {
        return response.status(404).json({
          status: "not found",
          message: "Reserva no encontrada",
        });
      }
      const serviceItem = await serviceManager.getServiceById(serviceId);
      if (!serviceItem) {
        return response.status(404).json({
          status: "not found",
          message: "Servicio no encontrado",
        });
      }

      const updatedBooking = await bookingManager.addServiceToBooking(
        bookingId,
        serviceId,
      );
      return response.status(200).json({
        status: "succes",
        payload: updatedBooking,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  });

export default router;
