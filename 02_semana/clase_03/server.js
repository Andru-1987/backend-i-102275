import app from './app.js'


app.listen(
    3000,
    '0.0.0.0',
    () => { console.log(`Bienvenido a nuestro primer servidor web -> Listening at port 3000 -> host '0.0.0.0'`) }
)