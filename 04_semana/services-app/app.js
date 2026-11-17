import express from 'express'
import healthRouter from './src/routes/status.router.js'
import config from './src/config/env.config.js'

import baseRouter from './src/routes/baseRouter.js'
import ServiceController from './src/controllers/serviceController.js'
import ServiceManager from './src/managers/ServiceManager.js'

import globalErrorHandler from './src/middleware/errorHandler.js'
import loggerHandler from './src/middleware/loggerHandler.js'

const app = express()

const serviceManager = new ServiceManager(config.servicesDbPath)
const serviceController = new ServiceController(serviceManager)

app.use(express.json())
app.use(loggerHandler)


app.use(healthRouter)
app.use('/api/v1/services', baseRouter(serviceController))
// app.use('/api/v1/bookings', apiBookingsRouter)

//middleware de salida de tracking de error
app.use(globalErrorHandler)

export default app
