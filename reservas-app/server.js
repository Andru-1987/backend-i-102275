import app from './app.js'
import config from './src/config/env.config.js'
import mongoConnect from './src/tools/mongo.connection.js'


async function bootstrap() {
    await mongoConnect()

    const server = app.listen(
        config.port,
        () => console.log(`Server listening at http://127.0.0.1:${config.port}`)
    )

    const gracefulShutdown = (signal) => {
        console.log(`Received ${signal}, shutting down gracefully...`)
        server.close(() => {
            console.log('Server closed')
            process.exit(0)
        })
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}


bootstrap()
    .catch((error) => {
        console.error('Error during server bootstrap:', error)
        process.exit(1)
    })