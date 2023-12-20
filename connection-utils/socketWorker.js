const {
	parentPort
} = require('node:worker_threads');
const {SocketWorker} = require("./worker");


const socketWorker = new SocketWorker(x=>parentPort.postMessage(x));

parentPort.on("message", (data)=>socketWorker.onmessage({data}))
