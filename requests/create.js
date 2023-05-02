const {_getNewCreatedIdWithValues} = require("../connection-utils/requests");
const {UPDATE_FILE} = require("./update");

/**
 *
 * @param workDirectory {string}
 * @param values {object}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<void>}
 * * @constructor
 */
const CREATE = async (
	workDirectory,
	values,
	email="",
	publicQuery=false,
	apiSetter=""
) => {
	return await _getNewCreatedIdWithValues(
		workDirectory, email, publicQuery, apiSetter, values
	);
}

/**
 *
 * @param workDirectory {string}
 * @param column {number}
 * @param file {file}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @param functions {array}
 * @param successCallback {function}
 * @return {Promise<*>}
 * @constructor
 */
const CREATE_FILE = async (
	workDirectory,
	column,
	file,
	email="",
	publicQuery=false,
	apiSetter="",
	functions=undefined,
	successCallback = undefined
) => {
	const empty = {}
	const newFile = await _getNewCreatedIdWithValues(
		workDirectory, email, publicQuery, apiSetter, empty
	);
	const {_id} = newFile;
	return await UPDATE_FILE(
		_id,
		workDirectory,
		column,
		file,
		functions,
		successCallback
	)
}


module.exports = {
	CREATE,
	CREATE_FILE,
}
