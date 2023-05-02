// NODE ONLY
const { Worker, } = require('node:worker_threads');
const {development, version} = require("../config/config");
const workerPath = __dirname+'/socketWorker.js';

const socketWorker = new Worker(workerPath);

const proxySocket = {
	onListener: {},
	onceListener: {},
	
	connected: true,
	
	emit: (channel, data) => {
		const action = "emit";
		socketWorker.postMessage({action, channel, data});
	},
	
	once: (channel, callback) => {
		const action = "once";
		socketWorker.postMessage({action, channel});
		proxySocket.onceListener[channel] = data => callback(data);
	},
	
	on: (channel, callback) => {
		const action = "on";
		socketWorker.postMessage({action, channel});
		proxySocket.onListener[channel] = data => callback(data);
	},
	
	off: (channel) => {
		const action = "off";
		socketWorker.postMessage({action, channel});
		
		proxySocket.onListener[channel] = null;
		delete proxySocket.onListener[channel];
	},
	
	connect: () => {
		const action = "connect";
		socketWorker.postMessage({action});
	},
	
	disconnect: () => {
		const action = "disconnect";
		socketWorker.postMessage({action});
	},
	
}

socketWorker.on("message", e => {
	const {action, channel, data} = e.data;
	if (action === "on") {
		if (proxySocket.onListener[channel]) {
			proxySocket.onListener[channel](data);
		}
	}
	else if (action === "once") {
		if (proxySocket.onceListener[channel]) {
			proxySocket.onceListener[channel](data);
			proxySocket.onceListener[channel] = null;
			delete proxySocket.onceListener[channel];
		}
	}
	else if (action === "connection") {
		proxySocket.connected = true;
		proxySocket.disconnected = false;
	}
	else if (action === "disconnection") {
		proxySocket.connected = false;
		proxySocket.disconnected = true;
	}
})
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


class ConnectionHandler {
	constructor() {
		this._DEVELOPMENT = development;
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
		console.log(this.socket);
		
		if (this.socket) this.socket.emit('login', JSON.stringify({email, password}));
	};
	
	tokenLogin = (webtoken) => {
		this.socket.emit("cookieLoginRoute", JSON.stringify({webtoken}));
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


module.exports = {
	ConnectionHandler
}
