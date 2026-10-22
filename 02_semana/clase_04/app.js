import express from 'express'
import healthRouter from './src/routes/status.router.js'
import apiServicesRouter from './src/routes/api.router.js'

const app = express()

app.use(express.json())
app.use(
    (request, _, next) => {
        const isoTime = new Date().toISOString()
        console.log(`[${request.method}]\t[${isoTime}] ->${request.url}`);
        next()
    }
)

app.use(healthRouter)
app.use('/api/v1/services', apiServicesRouter)

//middleware de salida de tracking de error
app.use((error, _, response, next) => {
    response.status(error.status || 500).json(
        { error: error.messaje || 'Error interno del server' }
    )
})

export default app
