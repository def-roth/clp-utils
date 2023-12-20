const {
	parentPort
} = require('node:worker_threads');
const SocketWorker = require("./worker");


const socketWorker = new SocketWorker(parentPort.postMessage);

parentPort.on("message", (data)=>socketWorker.onmessage({data}))
