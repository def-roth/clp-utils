const {
	socket, processServerData, changeX, cleanupChannel
} = require("./handlers");
const {randString, controlledFileStream, fileUpload, runArbitraryFunctionsOnFile} = require("./request-helper/fileHelper");
const {sendCurrentPositionInGrid, formFileCallback} = require("./routs");


const createEmptyObject = (workDirectory, email, publicQuery, apiSetter) => {
	let position = {
		workDirectory, values: {}, type: "create",
		email, public: publicQuery, uri: apiSetter, elon: true
	};
	changeX(sendCurrentPositionInGrid, position);
}


const initEmpty = (workDirectory, email, publicQuery, apiSetter) => {
	return new Promise((resolve, reject) => {
		socket.on(formFileCallback, (dataIn) => {
			dataIn = processServerData(dataIn);
			resolve(dataIn);
		});
		createEmptyObject(workDirectory, email, publicQuery, apiSetter)
	});
}


const getNewCreatedId = async (workDirectory, email, publicQuery, apiSetter) => {
	let data = await initEmpty(workDirectory, email, publicQuery, apiSetter);
	cleanupChannel(formFileCallback);
	return data;
}


const createObjectWithValues = (workDirectory, email, publicQuery, apiSetter, values) => {
	let position = {
		workDirectory, values: values||{}, type: "create",
		email, public: publicQuery, uri: apiSetter, elon: true
	};
	changeX(sendCurrentPositionInGrid, position);
}


const initWithValues = (workDirectory, email, publicQuery, apiSetter, values) => {
	return new Promise((resolve, reject) => {
		socket.on(formFileCallback, (dataIn) => {
			dataIn = processServerData(dataIn);
			resolve(dataIn);
		});
		createObjectWithValues(workDirectory, email, publicQuery, apiSetter, values)
	});
}



const getNewCreatedIdWithValues = async (workDirectory, email, publicQuery, apiSetter, values) => {
	let data = await initWithValues(workDirectory, email, publicQuery, apiSetter, values);
	cleanupChannel(formFileCallback);
	return data;
}





const updateEntryPromise = (_id, workDirectory, valueObj, email, publicQuery, apiSetter) => {
	const _callbackChannel = Math.random().toString(36);

	return new Promise((resolve, reject) => {
		socket.on(_callbackChannel, (dataIn) => {
			dataIn = processServerData(dataIn);
			resolve(dataIn);
		});
		let payload = {
			itemId: _id,
			workDirectory: workDirectory,
			values: valueObj,
			type: "update",
			email: email,
			public: publicQuery,
			uri: apiSetter,
			_callbackChannel
		};
		changeX(sendCurrentPositionInGrid, payload);

	});
}


const updateValues = async (_id, workDirectory, values, cfg={}) => {
	const {
		email, publicQuery, apiSetter
	} = cfg;
	await updateEntryPromise(
		_id, workDirectory, values,  email, publicQuery, apiSetter
	)
}

const deleteEntryPromise = (
	_id, workDirectory, email, publicQuery, apiSetter
) => {
	const _callbackChannel = Math.random().toString(36);

	return new Promise((resolve, reject) => {
		socket.on(_callbackChannel, (dataIn) => {
			dataIn = processServerData(dataIn);
			resolve(dataIn);
		});
		let payload = {
			itemId: _id,
			workDirectory: workDirectory,
			type: "delete",
			email: email,
			public: publicQuery,
			uri: apiSetter,
			_callbackChannel
		};

		changeX(sendCurrentPositionInGrid, payload);
	});
}


const uploadSingleFile = async (

	workDirectory, publicQuery,
	apiSetter, _id, column,
	fileToUpload, asyncFunctions,
	successCallback
) => {
	return new Promise(async (resolve, reject) => {

		const _callbackChannel = Math.random().toString(36);
		const props = {
			_callbackChannel
		}

		let singleUpload = [fileToUpload];

		let uploadFiles = [];
		let file;
		for (let i = 0; i < singleUpload.length; i++) {
			file = singleUpload[i];

			let eventObject = {
				workDirectory,
				publicQuery,
				apiSetter,
				_id,
				column,
			};

			file = await runArbitraryFunctionsOnFile(file, asyncFunctions, eventObject, resolve);


			let obj = {
				buffer: file.buffer,
				name: file.name,
				file: file,
				type: file.type,
				size: file.size,
				feId: randString(),
				id: workDirectory,
			};
			uploadFiles.push(obj);
		}
		const callback = (dataIn) => {

			dataIn = processServerData(dataIn);

			let {id, i, db, init, feId} = dataIn

			let filePos = -1;

			for (let idx = 0; idx < uploadFiles.length; idx++) {
				if (feId === uploadFiles[idx].feId) {
					filePos = idx;
					break;
				}
			}
			if (filePos > -1) {
				if (init && id) {
					uploadFiles[filePos] = {...uploadFiles[filePos], ...{uploadId: id}};
					controlledFileStream(uploadFiles[filePos], 0, id, feId, filePos, _callbackChannel);
				} else if (i || i === 0) {
					controlledFileStream(uploadFiles[filePos], i, id, feId, filePos, _callbackChannel);
				}
				if (db && filePos > -1) {
					let merger = id ? {uploadId: id, progress: db} : {progress: db};
					uploadFiles[filePos] = {...uploadFiles[filePos], ...merger};
				}
				if (dataIn.e === "fin" && id) {
					uploadFiles[filePos] = {...uploadFiles[filePos], ...{uploadId: id, fin: true}};
					//fileUpload(uploadFiles.filter(x => !x.fin));
					if (successCallback) {
						try {
							successCallback(dataIn)
						} catch (err) {

						}
					}
					resolve(true)
				}
			}
			else {
				setTimeout(() => {
					resolve(dataIn.successful)
				}, 2000)
			}
		}

		socket.on(_callbackChannel, callback);

		if (file) {
			fileUpload(
				uploadFiles, props, workDirectory, _id, column, publicQuery, apiSetter
			).then(()=>{})
		}
	})
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
 * @return {Promise<unknown>}
 */
const deleteFile = async (
	fname,
	resourcesId
	, _id,
	column,
	workDirectory,
	email,
	publicQuery,
	apiSetter,
) => {
	return new Promise((resolve) => {

		const _callbackChannel = Math.random().toString(36);

		socket.on(_callbackChannel, data => {
			data = processServerData(data);
			resolve(data);
		})

		const payload = {
			fn: fname,
			resourcesId: resourcesId,
			itemId: _id,
			c: column,
			workDirectory: workDirectory,
			email: email,
			public: publicQuery,
			uri: apiSetter,
			_callbackChannel
		}
		changeX("deleteSpecialType", payload);
	})
}


const query  = async (payload) => {
	const _callbackChannel = (performance.now()+Math.random()).toString(36)
	payload._callbackChannel = _callbackChannel;
	payload.s._callbackChannel = _callbackChannel;
	return new Promise((resolve, reject) => {
		socket.on(_callbackChannel, data => {
			resolve(processServerData(data))
		});
		changeX("plsMoarSearch", payload)
	});
}

const get = async (queryArray, workDirectory, idx, props) => {

	let availableProps = props || {};
	let {
		queryAmount,
		sorting,
		sortByColumn,
		publicQuery,
		apiSetter,
		email,
		fromAdvancedSearch,
		searchType,
	} = availableProps;

	let o = sorting || -1;
	let p = idx || 0;
	let n = queryAmount || 1;
	let c = typeof sortByColumn === "number" ? sortByColumn :  "_id";

	let payload = {
		c,
		o,
		p,
		s: {
			id: workDirectory,
			fromAdvancedSearch: !!fromAdvancedSearch,
			fields: queryArray,
			n,
			searchType,
		},
		email,
		public: publicQuery,
		uri: apiSetter,
	}


	let result = await query(payload);

	try {
		result = JSON.parse(result);
	} catch (err) {

	}

	return result;
}

const getById = async (_id, workDirectory) => {
	const queryArray = [
		["_id", _id, true, false]
	]

	const queryAmount = 1;
	const idx = 0;

	const props = {
		queryAmount,
	}
	const res = await get(queryArray, workDirectory, idx, props);
	return res.data[0];
}

const getS3File = async (workDirectory, column, _id, fn, ft, resourcesId, email,
                         publicQuery,
                         apiSetter,) => {
	return new Promise((resolve, reject) => {
		//   const ft = "image/webp";

		const _callbackChannel = Math.random().toString(36);

		let payload = {
			workDirectory,
			_id,
			c: column,
			rId: resourcesId,
			fn,
			ft,
			email: email,
			public: publicQuery,
			uri: apiSetter,
			_callbackChannel,
			type: "db",
		}

		socket.on(_callbackChannel, data => {
			resolve(processServerData(data));
		})

		changeX("requestHTML", payload);
	})
}

/**
 *
 * @param queryArray {Array}
 * @param workDirectory {string}
 * @param idx {number}
 * @param props {Object}
 * @param props.queryAmount {number}
 * @param props.sorting {number}
 * @param props.sortByColumn {string}
 * @param props.publicQuery {boolean}
 * @param props.apiSetter {string}
 * @param props._callbackChannel {string}
 * @param props.searchType {string}
 * @return {Promise<unknown>}

 * */
const getSocket = async (
	queryArray, workDirectory, idx, props
) => {

	let availableProps = props || {};
	let {
		queryAmount,
		sorting,
		sortByColumn,
		publicQuery,
		apiSetter,
		_callbackChannel,
		searchType,
	} = availableProps;

	_callbackChannel = _callbackChannel || Date.now().toString(16)+(Math.random()*1e7).toString(16);


	let o = sorting || -1;
	let p = idx || 0;
	let n = queryAmount || 1;
	let c = sortByColumn || "_id";

	let payload = {
		c,
		o,
		p,
		s: {
			id: workDirectory,
			fromAdvancedSearch: !!availableProps.fromAdvancedSearch,
			fields: queryArray,
			n,
			_callbackChannel,
			searchType,
		},
		public: publicQuery,
		uri: apiSetter,
		_callbackChannel
	}


	let result = await query(payload);


	return result;
}


const getOne = async (queryArray, workDirectory,  props={}) => {
	const {data} = await getSocket(queryArray, workDirectory, 0, {...props, ...{queryAmount: 1}});
	if (data && data[0]) {
		return data[0];
	}
	return null;
};

const postSocket = async (channel, payload, cbChannel) => {
	const cb = cbChannel || channel;

	if (cbChannel && !payload._callbackChannel) {
		payload._callbackChannel = cbChannel;
	}


	return new Promise((resolve, reject) => {
		// timeout in case of no answer in 10s
		const timer = setTimeout(() => resolve(null), 10000);
		socket.on(cb, (dataIn) => {
			dataIn = processServerData(dataIn);
			// cleanup timer
			clearTimeout(timer);
			// cleanup socket
			socket.off(cb);
			// finally resolve
			resolve(dataIn);
		});

		changeX(channel, payload);
	});
}



const query  = async (payload) => {
	return await postSocket("plsMoarSearch", payload, payload._callbackChannel)

}

const queryComplexValue = (
	value, _id, type, column, publicQuery, apiSetter, workDirectory, cpx, _callbackChannel
) => {

	if (value) {
		let payload = {
			workDirectory,
			_id,
			c: parseInt(column),
			public: publicQuery,
			uri: apiSetter,
			rId: value.resourcesId,
			fn: value.fn,
			ft: value.ft,
			_callbackChannel: typeof _callbackChannel === "string"?_callbackChannel:null
		}
		if (cpx) {
			payload.cpx = cpx;
		}

		let query = false;

		if (type === "Text++") {
			if (!value.html) {
				// check if id exists
				if (value.resourcesId) {

					query = true;
					payload.type = "db";

				}
			}
		} else if (type === "Image++") {
			if (!value.img) {
				// img not loaded, query img
				// check if id exists
				if (value.resourcesId) {

					query = true;
					payload.type = "dbi";

				}
			}
		} else if (type === "GLTF++") {
			if (!value.img) {
				// img not loaded, query img
				// check if id exists
				if (value.resourcesId) {

					query = true;
					payload.type = "dbg";

				}
			}
		} else if (type === "HTML++") {
			if (!value.html) {
				if (value.resourcesId) {

					query = true;
					payload.type = type;

				}
			}
		} else if (type === "Video++") {
			// always load video file on click as the signed link may be dead and we need to replenish
			if (value.resourcesId) {

				query = true;
				payload.type = "dbv";

			}
		} else if (type === "Audio++") {
			// always load video file on click as the signed link may be dead and we need to replenish
			if (value.resourcesId) {
				query = true;
				payload.type = "dba";
			}
		} else if (type === "File++") {
			if (value.resourcesId) {
				query = true;
				payload.type = "dbf";
			}
		}

		if (query) {
			changeX("requestHTML", payload);
		}
	}
};

const getPresignedUrl = async (row, column, workDirectory, publicQuery, apiSetter,) => {
	const value = row[column];
	const _id = row[row.length-1];

	let callbackKey = "file";


	return new Promise((resolve) => {
		const _callbackChannel = randString();
		const cb = async (dataIn) => {
			dataIn = processServerData(dataIn);

			const preSignedUrl = dataIn[callbackKey];

			socket.off(_callbackChannel, cb);
			resolve(preSignedUrl);
		};
		socket.on(_callbackChannel, cb);
		queryComplexValue(
			value, _id, "File++", column, publicQuery, apiSetter, workDirectory, null, _callbackChannel
		);
	})
}

const getPresignedHistoryUrl = async (
	resourcesId, fname, column,
	workDirectory, _id,
	publicQuery, apiSetter,
) => {

	let callbackKey = "file";


	return new Promise((resolve) => {
		const _callbackChannel = randString();
		const cb = async (dataIn) => {
			dataIn = processServerData(dataIn);

			const preSignedUrl = dataIn[callbackKey];

			socket.off(_callbackChannel, cb);
			resolve(preSignedUrl);
		};
		socket.on(_callbackChannel, cb);
		downloadDBFile(workDirectory, {resourcesId}, column, fname, _id, _callbackChannel, publicQuery, apiSetter,);
	})
}

const downloadDBFile = (workDirectory, value, c, fName, _id, _callbackChannel, publicQuery=false, apiSetter="",) => {
	let payload = {
		_id,
		workDirectory,
		c,
		type: "dbf",
		rId: typeof value === "string" ? value : value.resourcesId,
		publicQuery,
		apiSetter,
		_callbackChannel: typeof _callbackChannel === "string"?_callbackChannel:null

	};
	if (fName) {
		payload.fn = fName;
	}
	changeX("requestHTML", payload);
};


module.exports = {
	_updateEntry: updateEntryPromise,
	_uploadSingleFile : uploadSingleFile,
	_deleteEntryPromise: deleteEntryPromise,
	_getNewCreatedIdWithValues: getNewCreatedIdWithValues,
	_deleteFile: deleteFile,
	_get: get,
	_getS3File: getS3File,
	query,
	getOne,
	getSocket,
	postSocket,


	// legacy
	initWithValues,
	createObjectWithValues,
	updateValues,
	getPresignedUrl,
	getPresignedHistoryUrl,
	queryComplexValue,
}

