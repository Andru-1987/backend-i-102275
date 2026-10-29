import {  Router } from 'express'

import config from '../config/env.config.js'
import Service from '../managers/ServiceManager.js'


const router = new Router()
const service = new Service(config.dbPath)


/**
 * ?category=**&available=bool
 * 
 */
router.get('/', async (request, response) => {
    try {
        let services = await service.getServices()
        const { category, available } = request.query

        if (category) {
            services = services.filter(s => s.category.toLowerCase() === category.toLowerCase())
        }

        if (available !== undefined) {
            const isAvailable = available === 'true'
            services = services.filter(s => s.available === isAvailable)
        }

        return response.status(200).json({ status: 'success', payload: services })
    }
    catch (e) {
        return response.status(500).json({ status: 'error', message: e.message })
    }
})

// obtener el recurso por id
router.get('/:sid', async (request, response) => {
    try {
        const serviceId = Number(request.params.sid)
        const serviceItem = await service.getServiceById(serviceId)

        if (!serviceItem) return response.status(404).json({ status: 'error', message: 'Servicio no encontrado' })

        return response.status(200).json({ status: 'succes', payload: serviceItem })

    } catch (e) {
        return response.status(500).json({ status: 'error', message: e.message })
    }

})

// crear el servicio
router.post('/', async (request, response) => {
    try {
        const { name
            , description
            , duration
            , price
            , category
            , available } = request.body

//Migre la validacion el manager.
        const newService = await service.addService({
            name
            , description
            , duration
            , price
            , category
            , available
        })

        return response.status(201).json({
            status: 'success',
            payload: newService
        })

    } catch (e) {

        if(e.code === "VALIDATION_ERROR"){
            return response.status(400).json({
                status:"bad_request",
                message: e.message
            })
        }
        console.log(e)
        return response.status(500).json({ status: 'error', message: e.message })

    }
})

// actualizar un servicio || patch
router.put('/:sid', async (request, response) => {
    try {
        const serviceId = Number(request.params.sid)
        const updateServiceFields = request.body
        const updatedService = await service.updateService(serviceId, updateServiceFields)

        if (!updatedService) return response.status(400).json({ status: 'error', message: 'Servicio no encontrado' })

        return response.status(204).json({ status: 'updated', payload: updatedService })

    } catch (e) {
        return response.status(204).json({ status: 'updated', payload: updatedService })

    }
})

// eliminar el servicio
router.delete('/:sid', async (request, response) => {
    try {
        const serviceId = Number(request.params.sid)
        const deletedService = await service.deleteService(serviceId)

        console.log(deletedService);
        

        if (!deletedService) return response.status(400).json({ status: 'error', message: 'Servicio no encontrado' })
            //Cambio 204 por 200 para poder enviar un cuerpo en la respuesta
        return response.status(200).json({ status: 'deleted', message: 'Servicio borrado', payload: deletedService })

    } catch (e) {
 console.log(e)
        return response.status(500).json({ status: 'error', message: e.message })

    }
})


export default router