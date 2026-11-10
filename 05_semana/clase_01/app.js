import express from 'express'

// Routers
import healthRouter from './src/routes/status.router.js'
import serviceRouter from './src/routes/service.router.js'
import bookingRouter from './src/routes/booking.router.js'

// Middleware
import globalErrorHandler from './src/middleware/errorHandler.js'
import loggerHandler from './src/middleware/loggerHandler.js'

const app = express()


app.use(express.json())
app.use(loggerHandler)


app.use(healthRouter)
app.use('/api/v1/services', serviceRouter)
app.use('/api/v1/bookings', bookingRouter)

//middleware de salida de tracking de error
app.use(globalErrorHandler)

export default app
