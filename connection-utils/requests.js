const {socket, processServerData, changeX, cleanupChannel} = require("./handlers");
const {randString, controlledFileStream, fileUpload, runArbitraryFunctionsOnFile} = require("./request-helper/fileHelper");
const {sendCurrentPositionInGrid, formFileCallback} = require("./routs");


const createEmptyObject = (workDirectory, email, publicQuery, apiSetter) => {x
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
			data = JSON.parse(data);
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
	return new Promise((resolve, reject) => {
		socket.on("MoarDataz", data => {
			resolve(data)
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
			resolve(data);
		})
		
		changeX("requestHTML", payload);
	})
}



module.exports = {
	_updateEntry: updateEntryPromise,
	_uploadSingleFile : uploadSingleFile,
	_deleteEntryPromise: deleteEntryPromise,
	_getNewCreatedIdWithValues: getNewCreatedIdWithValues,
	_deleteFile: deleteFile,
	_get: get,
	_getS3File: getS3File
}
