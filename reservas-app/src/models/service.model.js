import { Schema, model } from 'mongoose'
import allowedCategories from '../config/constants.js'

// categorias puede tener mi servicios?


const serviceSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'El nombre del servicio debe tener al menos 3 caracteres']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'El valor del precio no puede ser negativo']
    },
    category: {
        type: String, // papa frita := tiene sentido? || servicios de reservas masajes, peliqueria, etc
        required: true,
        enum: allowedCategories
    },
    available: {
        type: Boolean,
        required: true
    }
})


// lo que llega  a la base de datos-> middleware de mongoos, que se validates!
// uso de expresiones regulares 
serviceSchema.pre("validate", function(){
    if (this.name){
        const cleanedName = this.name.replace(/\s+/g ,' ').trim()
        this.name = cleanedName.chartAt(0).toUpperCase() + cleanedName.slice(1)
    }
})

// a guardar informacion con reglas de negocio.
serviceSchema.pre("save", function(){
    if(this.price === 0 && this.available){
        this.avaible = false
    }
})



export default model('Service', serviceSchema)