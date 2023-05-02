const {_updateEntry, _uploadSingleFile} = require("../connection-utils/requests");


/**
 *
 * @param _id {string}
 * @param workDirectory {string}
 * @param values {object}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<void>}
 */
const UPDATE = async (
	_id,
	workDirectory,
	values,
	email="",
	publicQuery=false,
	apiSetter=""
) => {
	return await _updateEntry(
		_id, workDirectory, values, email, publicQuery, apiSetter
	)
}

/**
 *
 * @param _id {string}
 * @param workDirectory {string}
 * @param column {number}
 * @param file {file}
 * @param functions {array}
 * @param functions.element {function}
 * @param successCallback {function}
 * @return {Promise<unknown>}
 */
const UPDATE_FILE = async (
	_id,
	workDirectory,
	column,
	file,
	functions=undefined,
	successCallback = undefined
) => {
	return await _uploadSingleFile(
		workDirectory,
		null,
		null,
		_id,
		column,
		file,
		functions,
		successCallback
	)
}

module.exports = {
	UPDATE,
	UPDATE_FILE
}
