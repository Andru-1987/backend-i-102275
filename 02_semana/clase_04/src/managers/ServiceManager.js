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

    async #save(services) {
        await writeFile(this.databasePath, JSON.stringify(services, null, 2))
    }

    async #read() {
        const data = await readFile(this.databasePath, 'utf8')
        return JSON.parse(data)
    }

    async getServices() {
        const data = await readFile(this.databasePath, 'utf8')
        return JSON.parse(data)
    }

    async getServiceById(idService) {
        const data = await this.#read()
        return data.find(service => service.id === idService) ?? null
    }

    async addService(serviceData) {
        for (const field of REQUIRED_FIELDS) {
            if (serviceData[field] === undefined || serviceData[field] === null) {
                throw new Error(`El campo ${field} -> esta faltante`)
            }
        }

        const data = await this.#read()

        const id = data.length > 0 ? Math.max(...data.map(service => service.id)) + 1 : 1
        const newService = { ...serviceData, id }

        data.push(newService)
        await this.#save(data)

        return newService
    }

    async updateService(idService, updatedServiceData) {
        const searchedService = await this.getServiceById(idService)

        console.log(searchedService)

        if (!searchedService) { return { payload: searchedService, status: 'notOk' } }

        const services = await this.#read()

        services[idService] = { ...searchedService, ...updatedServiceData }

        await this.#save(services)
        return services[idService]
    }

    async deleteService(idService) {
        const services = await this.#read()

        const filteredServices = services.filter(service => service?.id !== idService)

        this.#save(filteredServices)

        return idService
    }

}




