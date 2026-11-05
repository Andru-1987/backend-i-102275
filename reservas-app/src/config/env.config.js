const { PORT, NODE_ENV, SERVICES_DB_PATH, BOOKINGS_DB_PATH } = process.env

if (!PORT || !NODE_ENV) throw new Error('Se requiere ambas variables')

export default { 
    port: Number(PORT),
    nodeEnv: NODE_ENV,
    servicesDbPath: SERVICES_DB_PATH,
    bookingsDbPath: BOOKINGS_DB_PATH 
}