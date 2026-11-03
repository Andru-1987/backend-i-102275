import { Router } from 'express'

export default function baseRouter(controller, router = new Router()) {
    router
        .get('/', controller.getAll)
        .get('/:id', controller.getById)
        .post('/', controller.create)
        .put('/:id', controller.update) //tiene que ser patch!!! 
        .delete('/:id', controller.delete)
    
    return router
}   