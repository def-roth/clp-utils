const {_deleteEntryPromise, _deleteFile} = require("../connection-utils/requests");


/**
 *
 * @param _id {string}
 * @param workDirectory {string}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<void>}
 */
const DELETE = async (
	_id,
	workDirectory,
	email="",
	publicQuery=false,
	apiSetter=""
) => {
	return await _deleteEntryPromise(
		_id, workDirectory, email, publicQuery, apiSetter
	)
}

/**
 *
 * @param fname {string}
 * @param resourcesId {string}
 * @param _id {string}
 * @param column {number}
 * @param workDirectory {string}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<*>}
 * @constructor
 */
const DELETE_FILE = async (
	fname,
	resourcesId,
	_id,
	column,
	workDirectory,
	email=undefined,
	publicQuery=undefined,
	apiSetter=undefined,
) => {
	return await _deleteFile(
		fname,
		resourcesId
		, _id,
		column,
		workDirectory,
		email,
		publicQuery,
		apiSetter,
		)
}

module.exports = {
	DELETE,
	DELETE_FILE,
}
