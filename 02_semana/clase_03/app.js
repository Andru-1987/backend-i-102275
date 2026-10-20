import express, { response } from 'express'

const API_VERSION = "/api/v1"
const app = express()
const users = [
    { id: 1, nombre: "Andru", email: "andru@example.com", activo: true },
    { id: 2, nombre: "María", email: "maria@example.com", activo: true },
    { id: 3, nombre: "Juan", email: "juan@example.com", activo: false }
];


app.use(express.json())

// nop hay track de seguimiento de este  error !

app.use((request, response, next) => {
    const isoTime = new Date().toISOString()
    console.log(`[${request.method}]\t${isoTime} -> ${request.url}`)
    next()
})

// enviar informacion sobre mi servidor
app.get("/health", (request, response) => response.json({ status: 'ok', serverName: 'AndruServer' }))

app.get(`${API_VERSION}/users`, (request, response) => {
    
    const { orderBy } = request.query
    const asc = Number(orderBy) === 1
    
    let orderedUsers = []

    if (asc) {
        console.log("lo toma como ascendente")
        orderedUsers = users.sort((a, b )=> a.nombre.localeCompare(b.nombre))
    } else {
        orderedUsers = users.sort((a, b) => b.nombre.localeCompare(a.nombre))
    }
    
    return response.status(200).json({
        error: false,
        message: "ordenado",
        payload: orderedUsers
    })

})

// enviar informacion sobre mis usuarios -> api /api/v1 
// app.get(`${API_VERSION}/users`, (request, response) => response.json({ status: 'ok', users }))

// enviar usuarios solo activos  --> params
app.get(`${API_VERSION}/users/:booleanParam`, (request, response) => {
    const isActiveParam = request.params.booleanParam

    if (!['active', 'not-active'].includes(isActiveParam)) { return response.status(400).json({ error: true, message: 'El parametro no es valido' }) }

    const isActive = isActiveParam === 'active'

    const filteredUsers = users.filter(user => user.activo === isActive)

    return response.status(200).json({ error: false, message: 'usuarios filtrados', payload: filteredUsers })

})

// creacion de un usuario
app.post(`${API_VERSION}/users`, (request, response) => {
    const { data } = request.body

    const newUser = { id: users.length + 1, ...data }

    users.push(newUser)

    response.status(201).json({
        error: false,
        message: `Se ha creado el siguiente record: ${newUser.id}`,
        payload: users
    })

})


app.use((error, request, response, next) => {
    response.status(error.status || 500).json(
        { error: error.messaje || 'Error interno del server' }
    )
})



export default app