const {DELETE, DELETE_FILE} = require("./delete");
const {loginCredentials: credentialLogin, loginToken: tokenLogin} = require("../auth/auth");
const {UPDATE, UPDATE_FILE} = require("./update");
const {CREATE, CREATE_FILE} = require("./create");
const {READ, READ_FILE} = require("./read");
const {LISTEN, UNLISTEN} = require("./listen");

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
}


module.exports = {
	CLP
}
