import mongoose from 'mongoose'
import config from '../config/env.config.js'


const mongoConnect = async () => {

    await mongoose.connect(config.uriMongoDb)
    console.log('Conectado a MongoDB Atlas')

}


export default mongoConnect