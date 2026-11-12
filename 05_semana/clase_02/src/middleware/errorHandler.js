import { AppError } from '../errors/appErrors.js'


export const globalErrorHandler = (error, request, response, next) => {
    if (response.headersSent) {
        return next(error)
    }
    
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: 'error',
            message: error.message,
            payload: error.payload || null
        })
    }

    console.error('Error no manejado:', error)  
    return response.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        payload: null
    })

}

export default globalErrorHandler