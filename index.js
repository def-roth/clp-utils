const {CLP} = require("./requests/CLP-Connector");
const {CREATE, CREATE_FILE} = require("./requests/create");
const {READ, READ_FILE} = require("./requests/read");
const {UPDATE, UPDATE_FILE} = require("./requests/update");
const {DELETE, DELETE_FILE} = require("./requests/delete");
const {LISTEN, UNLISTEN} = require("./requests/listen");
const {loginCredentials, loginToken} = require("./auth/auth");
const handlers = require("./connection-utils/handlers");
const requests = require("./connection-utils/requests");


module.exports = {
    CLP,

    UNLISTEN,
    LISTEN,
    DELETE_FILE,
    DELETE,
    UPDATE_FILE,
    UPDATE,
    READ_FILE,
    READ,
    CREATE_FILE,
    CREATE,

    loginCredentials,
    loginToken,


    socket: handlers.socket,
    changeX: handlers.changeX,
    emit: handlers.changeX,
    decode: handlers.processServerData,
    processServerData: handlers.processServerData,

    query:  requests.query,
    getOne:  requests.getOne,
    getSocket:  requests.getSocket,
    postSocket:  requests.postSocket,
    uploadSingleFile:  requests._uploadSingleFile,
    updateValues:  requests.updateValues,
    getPresignedUrl:  requests.getPresignedUrl,
    getPresignedHistoryUrl:  requests.getPresignedHistoryUrl,
    initWithValues:  requests.initWithValues,
    createObjectWithValues:  requests.createObjectWithValues,
    loginSocket:  handlers.loginSocket,

}
