// import { log } from 'node:console'
// import fs from 'node:fs'
// import { readFile } from 'node:fs/promises'
// import path from 'node:path'
// import { getServices as managerService } from 'src/services/Servicemanager.js'

// // const readFirstByte = (route) => {
// //     const fd = fs.openSync(route, 'r')
// //     const buffer = Buffer.alloc(1)

// //     fs.readSync(fd,buffer,0,1,0)
// //     return buffer[0]
// // }


// // for(let i=0; i<1e5; i++){
// //     readFirstByte(import.meta.filename)
// // }


// // const readFileLocal = async(route) => readFile(route,'utf8')
// // readFileLocal(import.meta.filename)

// // mal!
// // const uri = `${import.meta.dirname}/src/data/services.json`  

// const FILE_NAME = 'services.json'
// const uri = path.join(import.meta.dirname, 'src', 'data', FILE_NAME)

// try {
//     const fileData = await readFile(uri, 'utf8')
//     console.log(fileData)
// } catch (error) {
//     console.error({ error });

// }

// // manager.getServices()
// // managerService()

// // TDD  -> Test Development Driven (???)

// // Un archivo de pruebas --> [check]


import path from 'node:path'
import envConfig from "./src/config/env.config.js";
import ServiceManager from "./src/managers/ServiceManager.js";
import { log } from 'node:console';

const DATABASE_NAME = 'services.json'
const databasePath = path.join(import.meta.dirname, 'src', 'data', DATABASE_NAME)

const manager = new ServiceManager(databasePath)

console.log({'services': await manager.getServices()})
console.log("\nBusqueda de servicio\n")
console.log({'service # 2': await manager.getServiceById(2)})

const newService={
    name: "Corte de pelo alta gama",
    description: "Sesion que lleva 20 mins",
    duration: 29,
    price: 20_000,
    category: "Bienestar",
    available: true
}


console.log("\nAgregado de servicio\n")
const serviceCreated = await manager.addService(newService)
console.log("New Service", serviceCreated);

console.log("\nUpdate de servicio\n")
console.log("Update Service", await manager.updateService(serviceCreated.payload.id, {category:"HairCut"}));

console.log("\Delete de servicio\n")
console.log("Deleted:", await manager.deleteService(1))
console.log(`Environment: ${envConfig.nodeEnv} | PORT Available: ${envConfig.port}\n`)