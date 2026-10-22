import app from './app.js'
import config from './src/config/env.config.js'


app.listen(
    config.port,
    () => console.log(`Server listening at http://127.0.0.1:${config.port}`)
)