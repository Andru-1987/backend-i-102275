import baseRouter from './baseRouter.js'
import { serviceManager } from '../managers/index.js'
import ServiceController from '../controllers/serviceController.js'
const serviceController = new ServiceController(serviceManager)

export default baseRouter(serviceController)
    .put('/:id', serviceController.update)
    .delete('/:id', serviceController.delete)