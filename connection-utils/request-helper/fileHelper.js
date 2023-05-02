const {changeX} = require("../handlers");
const {extendedData} = require("../routs");

const chunkSize = 1 * 1000 * 1000;



const randString = () => {
	return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
};


const runArbitraryFunctionsOnFile = async (
	file, asyncFunctions, eventObject, resolve
) => {
	
	
	
	if (Array.isArray(asyncFunctions)) {
		
		for (let i=0;i<asyncFunctions.length;i++) {
			
			let {passFunc, errFunc, conditionFunction} = asyncFunctions[i];
			
			let check = true;
			
			if (conditionFunction) {
				check = await conditionFunction(file, eventObject)
			}
			
			if (check && passFunc) {
				let res = await passFunc(file, eventObject);
				if (typeof res === "object") {
					if (res.override) file = res.override;
				}
			}
			else if (!check && errFunc) {
				let res = await errFunc(file, eventObject);
				if (typeof res === "object") {
					if (res.override) file = res.override;
				}
			}
			
			if (eventObject.break) {
				
				resolve(false);
			}
			
		}
		
	}
	return file;
}


function emitBuffer(bufferChunk, index, id, feId, _callbackChannel)  {
	
	let b64 = bufferChunk.toString("base64");
	
	let body;
	if (index === 0) {
		body = b64;
	}
	else {
		b64 = b64.split(",");
		body = b64[1] || b64[0];
	}
	
	let payload = {i: index, body: body, id: id, feId: feId, _callbackChannel};
	
	if (payload.body) changeX(extendedData, payload);
	
}


const controlledFileStream = async (file, sliceId, id, feId, arrPos, _callbackChannel) => {
	
	
	try {
		let buffer = file.buffer;
		const totalSize = buffer.length;
		let offsetIndex = sliceId;
		
		
		let stopUpload = false;
		if (stopUpload) {
		
		} else {
			
			const hashChunk = () => {
				let chunk = buffer.slice(offsetIndex * chunkSize, (1 + offsetIndex) * chunkSize);
				
				emitBuffer(chunk, offsetIndex, id, feId, _callbackChannel);
				offsetIndex += 1;
				
				if (offsetIndex < totalSize && offsetIndex < sliceId + 100) {
					
					chunk = buffer.slice(offsetIndex * chunkSize, (1 + offsetIndex) * chunkSize);
					if (chunk.size !== 0) hashChunk();
					
				}
			};
			
			hashChunk();
		}
	} catch (e) {
		console.log(e);
	}
	
};


const initFileStream = (file, wd, id, column, publicQuery, apiSetter, props) => {
	// this calls the upload api and initializes the file
	let payload = {
		init: Math.ceil(file.size/chunkSize),
		name: file.name,
		type: file.type,
		size: file.size,
		feId: file.feId
	};
	if (wd) {
		payload.wd = wd;
		payload.mid = id;
		payload.c = column;
	}
	if (publicQuery && apiSetter) {
		payload.public = publicQuery;
		payload.uri = apiSetter;
	}
	
	if (props) {
		if (props.gltfId && props.gltfLength) {
			payload.gltfId = props.gltfId;
			payload.gltfLength = props.gltfLength;
			
		}
		if (props.path) {
			payload.path = props.path;
		}
		if (props._callbackChannel) {
			payload._callbackChannel = props._callbackChannel;
		}
	}
	
	changeX(extendedData, payload);
};



const fileUpload = async (files, props,
                          workDirectory, _id, column,
                          publicQuery, apiSetter) => {
	let activeUploads = 0;
	for (let i=0; i<files.length; i++) {
		if (files[i].uploadId && !files[i].fin) {
			activeUploads++;
		}
	}
	
	for (let i=0; i<files.length; i++) {
		if (!files[i].uploadId && activeUploads < 4) {
			activeUploads++;
			// window[files[i].feId] = true;
			let usedProps;
			if (props) {
				usedProps = {...props};
				if (usedProps.gltfId) {
					usedProps.path = files[i].path;
				}
			}
			
			initFileStream(
				files[i], workDirectory, _id, column,
				publicQuery, apiSetter, usedProps
			);
		}
	}
};




module.exports = {
	randString,
	runArbitraryFunctionsOnFile,
	controlledFileStream,
	fileUpload,
}
