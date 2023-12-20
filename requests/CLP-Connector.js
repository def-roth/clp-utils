const {DELETE, DELETE_FILE} = require("./delete");
const {loginCredentials: credentialLogin, loginToken: tokenLogin} = require("../auth/auth");
const {UPDATE, UPDATE_FILE} = require("./update");
const {CREATE, CREATE_FILE} = require("./create");
const {READ, READ_FILE} = require("./read");
const {LISTEN, UNLISTEN} = require("./listen");
const handlers = require("../connection-utils/handlers");
const requests = require("../connection-utils/requests");

class CLP {
	loginCredentials = credentialLogin
	loginToken = tokenLogin

	create = CREATE
	createFile = CREATE_FILE

	read = READ
	readFile = READ_FILE

	update = UPDATE
	updateFile = UPDATE_FILE

	delete = DELETE
	deleteFile = DELETE_FILE

	listen = LISTEN
	unlisten = UNLISTEN


	socket = handlers.socket;
	changeX = handlers.changeX;
	emit = handlers.changeX;
	decode = handlers.processServerData;
	processServerData = handlers.processServerData;

	query = requests.query;
	getOne = requests.getOne;
	getSocket = requests.getSocket;
	postSocket = requests.postSocket;
	uploadSingleFile = requests._uploadSingleFile;
	updateValues = requests.updateValues;
	getPresignedUrl = requests.getPresignedUrl;
	getPresignedHistoryUrl = requests.getPresignedHistoryUrl;
	initWithValues = requests.initWithValues;
	createObjectWithValues =  requests.createObjectWithValues;
	loginSocket = handlers.loginSocket;

}


module.exports = {
	CLP
}
