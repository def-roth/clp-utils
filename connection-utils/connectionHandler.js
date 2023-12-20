// Detects if the code is running on the server or the client
// If it is running on the server, it will use the node:worker_threads module to load worker
const {version} = require("../config/config");
const {SocketWorker} = require("./worker");
const {EventEmitter} = require("./EventEmitter");
const {Worker} = require("node:worker_threads");


let socketWorker;
const isServer = typeof process !== 'undefined' &&
	!!process?.release?.name
	&& process?.release?.name?.search(/node|io.js/) !== -1;

let useclientworker = false;
let addListener;
if (isServer) {
	const { Worker, } = require('node:worker_threads');
	const workerPath = __dirname+'/socketWorker.js';
	socketWorker = new Worker(workerPath);
	addListener = (listner) => {
		socketWorker.on("message", listner)
	}
}
else if (useclientworker) {
	socketWorker = new Worker( new URL( "./socketWorkerClient.js", import.meta.url ), {type: "module"});
	// must add event listener here
	addListener = (listner) => {
		socketWorker.addEventListener("message", listner)
	}

}
else {

	const eventProxy = new EventEmitter();
	const toWorker = (data) => eventProxy.emit("to", {data});
	const fromWorker = (data) => eventProxy.emit("from", data);
	socketWorker = new SocketWorker(fromWorker);
	socketWorker.postMessage = toWorker;
	eventProxy.on("to", ({data}) => socketWorker.onmessage({data}));
	// must add event listener here
	addListener = (listner) => {
		eventProxy.on("from", listner)
	}

}

class ProxySocket {
	constructor() {
		this.onListener = {};
		this.onceListener = {};
		this.connected = true;
	}

	emit = (channel, data) => {
		const action = "emit";
		socketWorker.postMessage({action, channel, data});
	}

	once = (channel, callback) => {
		const action = "once";
		this.onceListener[channel] = data => callback(data);
		socketWorker.postMessage({action, channel});
	}

	on = (channel, callback) => {
		const action = "on";
		this.onListener[channel] = data => callback(data);
		socketWorker.postMessage({action, channel});
	}

	off = (channel) => {
		const action = "off";
		socketWorker.postMessage({action, channel});

		this.onListener[channel] = null;
		delete this.onListener[channel];
	}

	connect = () => {
		const action = "connect";
		socketWorker.postMessage({action});
	}

	disconnect = () => {
		const action = "disconnect";
		socketWorker.postMessage({action});
	}

	listner = e => {
		const {action, channel, data} = e.data;

		if (action === "on") {
			if (this.onListener[channel]) {
				this.onListener[channel](data);
			}
		} else if (action === "once") {
			if (this.onceListener[channel]) {
				this.onceListener[channel](data);
				this.onceListener[channel] = null;
				delete this.onceListener[channel];
			}
		} else if (action === "connection") {
			this.connected = true;
			this.disconnected = false;
		} else if (action === "disconnection") {
			this.connected = false;
			this.disconnected = true;
		}
	}
}

const proxySocket = new ProxySocket(socketWorker);

addListener(proxySocket.listner)

const deepCopy = x => JSON.parse(JSON.stringify(x))
const wait = async (ms) => {
	return new Promise((resolve) => {
		setTimeout(()=> {
			resolve(true)
		}, ms);
	})
}

function getCookieSid(cookie) {
	let sidKey = "auth="
	return getToken(cookie, sidKey, 10);
}

function getWebtoken(cookie) {
	let webtokenKey = "webtoken="
	return getToken(cookie, webtokenKey, 15);
}

function getToken(cookie, key, length) {
	let token = "";

	if (cookie.slice(0, length).includes(key)) {
		token = deepCopy(cookie.split(key)[1]);
	}

	return token;
}


export class ConnectionHandler {
	constructor() {
		this._versionControl = version;
		this.loginchannels = {
			cookieLoginRoute: true,
			dLink: true,
		}

		this.upgrade = true;
		this.query = { w: 0, h: 0, v: this._versionControl };

		this.socket = proxySocket;

		this.socket.on("disconnect", data => {
			setTimeout(async () => {
				await this.disconnectClient();
			}, 1000);
		});
	}

	processServerData = (payload) => {
		return JSON.parse(payload);
	}


	changeX = (channel, data) => {
		if ( this.socket.disconnected && !this.loginchannels[channel] ) {
			this.reconnectSocket()
				.then(async () => {
					await wait(1500);
					this.changeX(channel, data);
				});
		} else {
			if (data) this.socket.emit(channel, JSON.stringify(data));
			else this.socket.emit(channel);
		}
	}

	connectClient = async () => {
		await this.socket.connect();
	}
	disconnectClient = async() => {
		if (this.socket) {
			this.socket.disconnect();
		}
	}

	cleanupChannel = (name) => {
		this.socket.on(name,()=>{});
		this.socket.off(name,()=>{});
	}

	loginSocket = (email, password) => {
		if (this.socket.disconnected) {
			this.reconnectSocket().then(()=>this.socket.emit('login', JSON.stringify({email, password})));
		}
		else {
			if (this.socket) this.socket.emit('login', JSON.stringify({email, password}));
		}
	};

	tokenLogin = (webtoken) => {
		if (this.socket.disconnected) {
			this.reconnectSocket().then(()=>this.socket.emit("cookieLoginRoute", JSON.stringify({webtoken})));
		}
		else {
			this.socket.emit("cookieLoginRoute", JSON.stringify({webtoken}));
		}
	}

	sessionlogin = (reconnect) => {
		const cookies = JSON.parse(JSON.stringify(document.cookie)).split(';');
		let cookie = '';
		let webtoken = '';

		for (let i = 0; i < cookies.length; i++) {
			cookie = cookie || getCookieSid(cookies[i]);
			webtoken = webtoken || getWebtoken(cookies[i]);
		}


		if (cookie || webtoken) {
			this.changeX("cookieLoginRoute", {cookie, webtoken, reconnect: !!reconnect});
			return false;
		}
		return true;
	}
	reconnectSocket = async (cb) => {
		if (this.socket.disconnected) {
			await this.connectClient();
			await wait(1000);
		}
		if (cb) cb(this.socket.connected);
		this.sessionlogin(true);
	}
}


