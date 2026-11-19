// manejarlo directamente desde la base de datos -> joins con nuestros servicios.


const allowedCategories = [
    'masajes',
    'peluqueria',
    'spa',
    'estetica',
    'fitness',
    'yoga',
    'otros'
]

export const bookingMaxDuration = 1439

export const bookingStatus = ["pending", "confirmed", "cancelled", "completed"]

export default allowedCategories 