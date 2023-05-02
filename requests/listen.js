const {changeX, socket, processServerData} = require("../connection-utils/handlers");
const {unregisterListener, registerListener} = require("../connection-utils/listener");


/**
 * Returns an object with success property
 * if the listener event is successful listener and unlistener functions are added
 * in order to create the listening event you must invoke listen(fn),
 * to remove the listening event call unlisten(fn)
 * @param workDirectory {string}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<Object>} success, listen, unlisten
 * @constructor
 */
const LISTEN = async (
	workDirectory,
	email="",
	publicQuery=false,
	apiSetter=""
) => {
	return new Promise((resolve) => {
		const _callbackChannel = Math.random().toString(36);
		
		const timer = setTimeout(() => {resolve({success: false})}, 5000);
		socket.on(_callbackChannel, async (data) => {
			clearTimeout(timer);
			data = processServerData(data);
			if (data.success) {
				data.listen = registerListener(workDirectory);
				data.unlisten = async () => await UNLISTEN(workDirectory, email, publicQuery, apiSetter);
			}
			resolve(data);
		});
		let payload = {
			id: workDirectory,
			email,
			public: publicQuery,
			uri: apiSetter,
			_callbackChannel,
		};
		changeX("listen", payload);
	})
}

/**
 *
 * @param workDirectory {string}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<unknown>}
 * @constructor
 */
const UNLISTEN = async (
	workDirectory,
	email="",
	publicQuery=false,
	apiSetter=""
) => {
	return new Promise((resolve) => {
		const _callbackChannel = Math.random().toString(36);
		
		const timer = setTimeout(() => {resolve({success: false})}, 5000);
		socket.on(_callbackChannel, async (data) => {
			clearTimeout(timer);
			data = processServerData(data);
			if (data.success) {
				unregisterListener(workDirectory);
			}
			resolve(data);
		});
		let payload = {
			id: workDirectory,
			email,
			public: publicQuery,
			uri: apiSetter,
			_callbackChannel,
		};
		changeX("unlisten", payload);
	})
}


module.exports = {
	LISTEN,
	UNLISTEN
}
