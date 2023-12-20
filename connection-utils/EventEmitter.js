
const cloneDeep = x => JSON.parse(JSON.stringify(x))
const wait = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(()=> {
            resolve(true)
        }, ms);
    })
}
export class EventEmitter {
    constructor(maxListeners) {
        this.id = Date.now().toString(36);
        this.events = {};
        this.maxListeners = maxListeners || 50;
    }

    listenerCount = () => {
        let count = 0;
        this.eventNames().forEach((eventName) => {
            count += this.events[eventName].length;
        });
        return count;
    }

    getMaxListeners = () => {
        return this.maxListeners;
    }

    canAddMore = () => {
        return this.listenerCount() <= this.getMaxListeners();
    }

    eventNames = () => {
        return Object.keys(this.events);
    }

    eventListeners = (eventName) => {
        return this.events[eventName] || [];
    }

    removeAllListeners = () => {
        delete this.events;
        this.events = null;
        this.events = {};
    }

    transformF = (f, once) => {
        return {
            f,
            once: typeof once === "boolean" ? once : false,
        };
    }

    on = (eventName, cb, once=false,) => {
        if (eventName && cb) {
            if (this.canAddMore()) {
                const f = this.transformF(cb, once);
                if (this.events[eventName]) {
                    this.events[eventName].push(f);
                } else {
                    this.events[eventName] = [f];
                }
            } else {
                console.warn("Max event listeners reached. Increase the limit. Did you forget to cleanup the listener?")
            }
        }
    }

    once = (eventName, cb) => {
        if (this.canAddMore()) {
            const f = this.transformF(cb, true);
            if (this.events[eventName]) {
                this.events[eventName].push(f);
            } else {
                this.events[eventName] = [f];
            }
        }
    }

    off = (eventName, cb) => {
        if (this.events[eventName] && cb) {
            const f = this.transformF(cb);
            this.events[eventName] = this.events[eventName].filter(
                (x) => x.f !== f.f
            );
        }
    }


    emit = (eventName, payload) => {
        if (this.events[eventName]) {
            let filterOnce = false;
            let i = 0;
            for (i;i<this.events[eventName].length;i+=1) {
                const event = this.events[eventName][i];

                if (!event.ignore) {
                    event.f(cloneDeep(payload));

                    if (event.once) {
                        event.ignore = true;
                        filterOnce = true;
                    }
                }
            }

            if (filterOnce) {
                this.events[eventName] = this.events[eventName].filter((x) => !x.once);
            }
        }
    }
    emitWait = async (eventName, payload, waitAmount=100) => {
        if (this.events[eventName]) {
            let filterOnce = false;
            let i = 0;
            for (i;i<this.events[eventName].length;i+=1) {
                const event = this.events[eventName][i];

                if (!event.ignore) {

                    event.f(cloneDeep(payload));

                    if (event.once) {
                        event.ignore = true;
                        filterOnce = true;
                    }
                    await wait(waitAmount);
                }

            }

            if (filterOnce) {
                this.events[eventName] = this.events[eventName].filter((x) => !x.once);
            }
        }
    }

    removeEventListener = (channel, cb) => {
        this.off(channel, cb);
    }

    addEventListener = (channel, cb, once) => {
        this.on(channel, cb, once);
    }
}

