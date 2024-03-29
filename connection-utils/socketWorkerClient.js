const {version, domain} = require("../config/config");
const {io} = require("socket.io-client");


const _versionControl = version;
const _address = domain;

// we can go for immediate websocket on server side
const transports = ["websocket", "polling" ];
const upgrade = true;
const query = { w: 100, h: 100, v: _versionControl };


class PacketContainer {
    constructor() {
        this._config = {};
        this._packets = {};


    }
    _registerPacket = (action, channel, id) => {
        if (!this._config[id]) {
            this._config[id] = {action, channel};
            this._packets[id] = [];
        }
    }
    _finalize = (id, packetAmount) => {
        this._config[id].finalized = true;
        this._config[id].totalAmount = packetAmount;

    }
    _addPacket = (packetLoad, packetNumber, id) => {
        this._packets[id].push({packetNumber, packetLoad});
    }
    _cleanUp = (id) => {
        this._config[id] = null;
        this._packets[id] = null;
        delete this._config[id];
        delete this._packets[id];
    }
    _merge = (id) => {
        if (this._config[id].finalized) {
            const arrived = this._packets[id].length;
            const totalAmount = this._config[id].totalAmount;
            if (arrived === totalAmount) {
                const sortedPackages = this._packets[id].sort((a,b)=>a.packetNumber-b.packetNumber);
                let data = "";
                sortedPackages.forEach(chunk => {
                    data += chunk.packetLoad;
                });
                const {action, channel} = this._config[id];
                postMessage({data: {action, channel, data}});
                this._cleanUp(id);
            }
            // else final packet received before last data packet
        }
    }
}

class SocketWorker {
    constructor(transports=["websocket", "polling" ]) {
        const ioParams = { query, upgrade, transports };

        this.socket = io(_address, ioParams);
        this.listeners = {};
        this.packetContainer = new PacketContainer();
        this.on("connected", (data) => {
            postMessage({action: "connection"})
        });
        this.on("disconnected", (data) => {
            postMessage({action: "disconnected"})
        });
    }
    connect = () => {
        this.socket.connect();
    }
    disconnect = () =>  {
        this.socket.disconnect();
    }
    on = (channel, cb) => {
        this.socket.off(channel);
        this.socket.on(channel, cb);
    }
    once = (channel, cb) => {
        this.socket.once(channel, cb);
    }
    off = (channel) => {
        this.socket.off(channel);
    }
    emit = (channel, data) => {

        this.socket.emit(channel, data);
    }

    checkPayload = (action, channel, data) => {
        let isChunk = false;

        if (data) {
            if (data.length >= 37) {
                const firstCheck = data[0];
                const padStartAmount = 9;
                const secondCheck = data[padStartAmount+1];
                const objectidLength = 24;
                const idEnd = padStartAmount+1 + objectidLength + 1;
                const thirdCheck = data[idEnd];

                if (firstCheck === "$" && secondCheck === firstCheck && thirdCheck === firstCheck) {
                    isChunk = true;
                    const packet = data.slice(1,padStartAmount+1);

                    const id = data.slice(padStartAmount+1,idEnd);
                    const packetLoad = data.slice(idEnd+1);

                    this.packetContainer._registerPacket(action, channel, id);

                    if (packet === "finalized") {
                        const packetAmount = parseInt(packetLoad);
                        this.packetContainer._finalize(id, packetAmount);
                    }
                    else {
                        const packetNumber = parseInt(packet, 36);
                        this.packetContainer._addPacket(packetLoad, packetNumber, id)
                    }

                    this.packetContainer._merge(id);
                }
            }
        }

        if (!isChunk) {

            postMessage({data: {action, channel, data}})
        }
    }

    onmessage = e => {
        const {action, channel, data} = e.data;

        if (action === "emit") {
            if (data) {
                this.emit(channel, data);
            } else {
                this.emit(channel);
            }
        }

        else if (action === "on") {
            this.listeners[channel] = (data)=> { this.checkPayload(action, channel, data) };
            this.on(channel, this.listeners[channel]);
        }

        else if (action === "off") {
            this.off(channel, this.listeners[channel]);
            this.listeners[channel] = null;
            delete this.listeners[channel];
        }

        else if (action === "once") {
            this.once(channel, (data)=> {
                this.checkPayload(action, channel, data)
            });
        }

        else if (action === "connect") {
            this.connect();
        }

        //	else if (action === "disconnect") {
        //		this.disconnect();
        //	}

    }
}
const socketWorker = new SocketWorker();

onmessage = socketWorker.onmessage;

