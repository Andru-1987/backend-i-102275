const { PORT, NODE_ENV } = process.env

// fail fast
if (!PORT || !NODE_ENV) throw new Error('Algunas variables faltan -> revisar el .env file')

export default {
    port: Number(PORT),
    nodeEnv: NODE_ENV
}