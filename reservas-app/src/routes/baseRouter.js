import { Router } from 'express'

/**
 * Incorporacion futura de patron de decorador para agregar middlewares a las rutas
 */
export default function baseRouter(controller, router = new Router()) {
    router
        .get('/', controller.getAll)
        .get('/:id', controller.getById)
        .post('/', controller.create)
        
    return router
}   