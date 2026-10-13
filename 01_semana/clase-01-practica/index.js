// import fs from 'node:fs';

// // console.log("Hola mundo desde node.js")

// console.log('1. Inicio del script');

// setTimeout(() => {
//   console.log('2. setTimeout (0ms)');
// }, 0);

// setImmediate(() => {
//   console.log('3. setImmediate');
// });

// Promise.resolve().then(() => {
//   console.log('4. Promesa resuelta (Microtask)');
// });
// j
// process.nextTick(() => {
//   console.log('5. process.nextTick');
// });

// fs.readFile(import.meta.filename, () => {
//   console.log('6. Lectura de archivo completada (I/O Callback)');
// });

// console.log('7. Fin del script');


// Services 

// import fs from 'node:fs/promises';

// class FileService {
//     //CONSTRUCTOR
//   constructor(filePath) {
//     // RUTA DEL ARCHIVO
//     this.filePath = filePath;
//   }

//   async readFile() {
//     const data = await fs.readFile(this.filePath, 'utf-8');
//     const parsedData = await JSON.parse(data);
//     return parsedData.items;
//   }

// }



// const dragonBallService = new FileService('./database/dragonBall.json');


// dragonBallService
//     .readFile()
//     .then((items) => console.log(items))
//     .catch((error) => console.error(error));


import http from 'node:http';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';


const ITERACIONES = 5e9 //5x10**9

const calcular = (iteraciones) => {
    let contador = 0;
    for (let i = 0; i < iteraciones; i++) {
        contador += 1;
    }
    return contador;
}



http.createServer(async (req, res) => {
    if (req.url === '/heavyBlocker') {
        const resultado = calcular  (ITERACIONES);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end(`Resultado: ${resultado}`);
    }

    if (req.url === '/heavy') {
        const worker = new Worker(
            `
            const {parentPort} = require('node:worker_threads');
            let contador = 0;
            for (let i = 0; i < ${ITERACIONES}; i++) {
                contador += 1;
            }
            parentPort.postMessage(contador);
            `,
            { eval: true }
        )

        const [resultado] = await once(worker, 'message');
        return res.end(`Resultado: ${resultado}`);
    }


    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('pong');
    }


}).listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));

