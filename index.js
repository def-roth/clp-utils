const {CLP} = require("./requests/CLP-Connector");
const {CREATE, CREATE_FILE} = require("./requests/create");
const {READ, READ_FILE} = require("./requests/read");
const {UPDATE, UPDATE_FILE} = require("./requests/update");
const {DELETE, DELETE_FILE} = require("./requests/delete");
const {LISTEN, UNLISTEN} = require("./requests/listen");
const {loginCredentials, loginToken} = require("./auth/auth");

exports.CLP = CLP;

exports.loginCredentials = loginCredentials;
exports.loginToken = loginToken;

exports.CREATE = CREATE;
exports.CREATE_FILE = CREATE_FILE;

exports.READ = READ;
exports.READ_FILE = READ_FILE;

exports.UPDATE = UPDATE;
exports.UPDATE_FILE = UPDATE_FILE;

exports.DELETE = DELETE;
exports.DELETE_FILE = DELETE_FILE;

exports.LISTEN = LISTEN;
exports.UNLISTEN = UNLISTEN;
