const {logInRouteListener} = require("../connection-utils/routs");
const {socket, processServerData, loginSocket} = require("../connection-utils/handlers");

/**
 *
 * @param email {string}
 * @param password {string}
 * @return {Promise<Session>}
 */
const loginCredentials = async (
	email, password
) => {
	return new Promise(async (resolve, reject) => {
		
		
		socket.on(logInRouteListener, async (data) => {
			data = processServerData(data);
			
			let {
				firstName,
				lastName,
				username,
				verified,
				activeIps,
				activeIDs,
				email,
				id,
				company,
				webtoken,
			} = data;
			
			
			let missingUsername = typeof username !== "string";
			
			let session = {
				firstName,
				lastName,
				username,
				verified,
				missingUsername,
				activeIps,
				activeIDs,
				email,
				id,
				company,
				webtoken,
			};
			resolve(session);
		});
		loginSocket(email, password);
		
	});
}


/**
 *
 * @param token {string}
 * @return {Promise<Session>}
 */
const loginToken = async (
	token
) => {
	return new Promise(async (resolve, reject) => {
		
		
		socket.on(logInRouteListener, async (data) => {
			data = processServerData(data);
			
			let {
				firstName,
				lastName,
				username,
				verified,
				activeIps,
				activeIDs,
				email,
				id,
				company,
				webtoken,
			} = data;
			
			
			let missingUsername = typeof username !== "string";
			
			let session = {
				firstName,
				lastName,
				username,
				verified,
				missingUsername,
				activeIps,
				activeIDs,
				email,
				id,
				company,
				webtoken,
			};
			
			resolve(session);
		});
		
		tokenLogin(token);
		
		
	});
}


module.exports = {
	loginCredentials,
	loginToken,
}
