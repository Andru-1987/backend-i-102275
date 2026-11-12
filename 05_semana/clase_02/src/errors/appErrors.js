export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Error de validación') {
        super(message, 422)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404)
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Solicitud incorrecta') {
        super(message, 400)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Prohibido') {
        super(message, 403)
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflicto') {
        super(message, 409)
    }
}