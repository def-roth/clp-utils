const {_get, _getS3File} = require("../connection-utils/requests");

/**
 *
 * @param queryArray {array}
 * @param workDirectory {string}
 * @param page {number}
 * @param queryAmount {number}
 * @param sorting {number}
 * @param sortByColumn {number}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<unknown>}
 * @constructor
 */
const READ = async (
	queryArray,
	workDirectory,
	page=0,
	queryAmount=10,
	sorting=-1,
	sortByColumn=undefined,
	email="",
	publicQuery=false,
	apiSetter="",
) => {
	const props = {
		queryAmount,
		sorting,
		sortByColumn,
		publicQuery,
		apiSetter,
	}
	return await _get(queryArray, workDirectory, page, props)
}


/**
 *
 * @param workDirectory {string}
 * @param column {number}
 * @param _id {string}
 * @param fn {string}
 * @param ft {string}
 * @param resourcesId {string}
 * @param email {string}
 * @param publicQuery {boolean}
 * @param apiSetter {string}
 * @return {Promise<unknown>}
 * @constructor
 */
const READ_FILE = async (
	workDirectory,
	column,
	_id,
	fn,
	ft,
	resourcesId,
	email,
	publicQuery,
	apiSetter,
) => {
	return await _getS3File(
		workDirectory,
		column,
		_id,
		fn,
		ft,
		resourcesId,
		email,
		publicQuery,
		apiSetter,
	)
}

module.exports = {
	READ,
	READ_FILE,
}
