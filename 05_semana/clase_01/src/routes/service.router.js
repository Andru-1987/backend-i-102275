import baseRouter from './baseRouter.js'
import ServiceController from '../controllers/serviceController.js'
import { servicesService } from '../services/index.js'
const serviceController = new ServiceController(servicesService)

export default baseRouter(serviceController)
    .put('/:id', serviceController.update)
    .delete('/:id', serviceController.delete)