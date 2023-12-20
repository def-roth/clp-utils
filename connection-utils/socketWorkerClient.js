const SocketWorker = require("./worker");

const socketWorker = new SocketWorker(postMessage);

onmessage = socketWorker.onmessage;

