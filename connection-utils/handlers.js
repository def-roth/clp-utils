const {ConnectionHandler} = require("./connectionHandler");


const socketConnectionHandler = new ConnectionHandler();

const {
	socket,
	processServerData,
	changeX,
	loginSocket,
	tokenLogin,
	reconnectSocket,
	cleanupChannel,
} = socketConnectionHandler;


module.exports = {
	socket,
	socketConnectionHandler,
	reconnectSocket,
	loginSocket,
	cleanupChannel,
	changeX,
	tokenLogin,
	processServerData,
}
