const {processServerData, socket} = require("./handlers");
const {EventEmitter} = require("./EventEmitter");

const listener = new EventEmitter();

socket.on("receiveCurrentPositionsInGrid", (data) => {
	data = processServerData(data);
	if (typeof data.workDirectory === "string") {
		if (listener.rawListeners(data.workDirectory)) {
			listener.emit(data.workDirectory, data);
		}
	}
})

const registerListener = (workDirectory) => {
	return (cb) => listener.on(workDirectory, cb);
}

const unregisterListener = (workDirectory) => {
	listener.removeAllListeners(workDirectory);
}


module.exports = {
	listener,
	registerListener,
	unregisterListener,
}
