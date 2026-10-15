// const getServices = () => { }
// const addservices = () => { }
// const updateServices = () => { }
// const deleteservices = () => { }

// export {
//     getServices
//     , addservices
//     , updateServices
//     , deleteservices
// }

import { log } from 'node:console'
import { readFile, writeFile } from 'node:fs/promises'

const REQUIRED_FIELDS = [
    "name"
    , "description"
    , "duration"
    , "price"
    , "category"
    , "available"
]


export default class ServiceManager {
    constructor(databasePath) {
        this.databasePath = databasePath
    }

    /**
     * Metodos que se encargue de hacer el crud
    */

    // #save(services)
    async #save(services) {
        await writeFile(this.databasePath, JSON.stringify(services, null, 2))
    }

    async getServices() {
        const data = await readFile(this.databasePath, 'utf8')
        return JSON.parse(data)
    }

    //CRUD
    async getServiceById(idService) {
        const data = await this.getServices()
        return data.find(service => service.id === idService) ?? null // ===(valor y dType) ==(valor)

    }

    async addService(serviceData) {
        for (const field of REQUIRED_FIELDS) {
            if (serviceData[field] === undefined || serviceData[field] === null) {
                throw new Error(`El campo ${field} -> esta faltante`)
            }
        }

        const data = await this.getServices()

        const id = data.length > 0 ? Math.max(...data.map(service => service.id)) + 1 : 1
        const newService = { ...serviceData, id }

        data.push(newService)
        await this.#save(data)

        return { payload: newService, status: 'ok' }
    }

    async updateService(idService, updatedServiceData) {
        const searchedService = await this.getServiceById(idService)
        
        console.log(searchedService)

        if (!searchedService) { return { payload: searchedService, status: 'notOk' } }

        const services = await this.getServices()

        services[idService] = { ...searchedService, ...updatedServiceData }

        await this.#save(services)
        return { payload: services[idService], status: 'ok' }
    }

    async deleteService(idService) {
        const services = await this.getServices()

        const filteredServices = services.filter(service => service.id !== idService)

        if (services.length === filteredServices.length) return { payload: idService, status: 'notOk', message: 'notFoundedService' }

        this.#save(filteredServices)

        return {
            payload: idService,
            status: 'ok'
        }
    }


}




