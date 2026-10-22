const { PORT, NODE_ENV, DB_PATH } = process.env

if (!PORT || !NODE_ENV) throw new Error('Se requiere ambas variables')

export default { port: Number(PORT), nodeEnv: NODE_ENV, dbPath: DB_PATH }