# cloudplication utils

Programmatic API for the frontend database www.cloudplication.com

## Installation
* npm
  ```sh
   npm i https://github.com/def-roth/clp-utils#master
  ```
  
## Usage

If you like a class based approach more, there is one.
```js
   const {CLP} = require("clp-utils");
   
   const myClass = new CLP();
   
   myClass.loginCredentials();
   myClass.loginToken();
   
   myClass.create();
   myClass.createFile();
   myClass.read();
   myClass.readFile();
   myClass.update();
   myClass.updateFile();
   myClass.delete();
   myClass.deleteFile();
   
   myClass.listen();
   myClass.unlisten();
```

### Auth Handling

loginCredentials Login with credentials
```js
   const {loginCredentials} = require("clp-utils");
   
   const email = 'myemail@provider.com';
   const password = 'my_secret_password';
   const session = await loginCredentials(email, password);
```


loginToken Login with token from previous login

```js
   const {loginToken} = require("clp-utils");
   
   const token = 'token';
   const session = await loginToken(token);
```



### CRUD

CREATE Create new record
```js
   const {CREATE} = require("clp-utils");
   
   const workDirectory = 'workDirectory';
   const values = {};
   const createdRecord = await CREATE(workDirectory, values);
```



CREATE_FILE Create new record and upload file
```js
   const {CREATE_FILE} = require("clp-utils");
   const fs = require("fs").promises;
   
   const filepath = "/some/path/to/file"
   const file = await fs.readFile(filepath);
   const workDirectory = 'workDirectory';
   const column = 0;
   const createdRecord = await CREATE_FILE(workDirectory, column, file);
```

READ Pagination based search queries
```js
   const {READ} = require("clp-utils");
   
   const queryArray = []; // query all data
   
   const columnToQuery = 0;
   const searchValue = "Tom";
   const secondSearchValue = "Tim";
   const mustMatchAll = false;
   const negate = false;
   
   const sampleQuery = [
        columnToQuery, searchValue, mustMatchAll, negate
   ];
   const secondSampleQuery = [
        columnToQuery, secondSearchValue, mustMatchAll, negate
   ]
   queryArray.push(sampleQuery);
   
   const workDirectory = 'workDirectory';
   const page = 0; // default 0
   const queryAmount = 10; // value between 0 and 100
   
   const dataHandler = await READ(queryArray, workDirectory, page, queryAmount);
   const {
     data,  // records [array]
     p,     // current page [number]
     count, // toal data count [number]
     no     // query amount [number]
   } = dataHandler;
   
```
READ_FILE Read file
```js
   const {READ_FILE} = require("clp-utils");

   // read file from record
   const workDirectory = 'workDirectory';
   const column = 1;
   const _id = 'id';
   const filename = 'billing.pdf';
   const filetype = 'application/pdf';
   const resourcesId = 'resourcesIdf';
   
   const downloadlink = await READ_FILE(workDirectory, column, _id, filename, filetype, resourcesId);
```

UPDATE Update records
```js
   const {UPDATE} = require("clp-utils");
   
   const workDirectory = 'workDirectory';
   const _id = "id";
   const update = {0: "Tom"}
   const updatedRecord = await UPDATE(_id, workDirectory, values);
```
UPDATE_FILE Update Files
```js
   const {UPDATE_FILE} = require("clp-utils");
   const fs = require("fs").promises;
   
   const filepath = "/some/path/to/file"
   const file = await fs.readFile(filepath);
   
   const workDirectory = 'workDirectory';
   const _id = "id";
   const column = 0;
   
   const updatedRecordWithDownloadLink = await UPDATE_FILE(_id, workDirectory, column, file);
```

DELETE Delete records
```js
   const {DELETE} = require("clp-utils");
   
   const workDirectory = 'workDirectory';
   const _id = "id";
   const deletedRecord = await DELETE(_id, workDirectory);
```
DELETE_FILE Delte Files
```js
   const {DELETE_FILE} = require("clp-utils");
   
   
   const workDirectory = 'workDirectory';
   const _id = "id";
   
   const fname = "billing.pdf";
   const resourcesId = "resourcesId";
   const column = 0;
   
   const deletedFile = await DELETE_FILE(fname, resourcesId, _id, column, workDirectory);
```

### Listen
LISTEN Register listener to database changes
```js
   const {LISTEN} = require("clp-utils");
   
   const unlistenId = "unlistenId";
   const workDirectory = 'workDirectory';
   const {success, listen, unlisten} = await LISTEN(workDirectory);
   if (success && listen) {
   // invoke listen with your function
   // listen(fn) e.g.
    listen((data) => {
      const positions = data.positions;
      for (const change of positions) {
        const {values, id, type} = change
        if (type === "update") {
          // do something with values
        } else if (type === "create") {
          // do something with values
        } else if (type === "delete") {
          // do something with id
          id (id === unlistenId) {
            unlisten();
          }
        }
      }
    });
   }
   
```
UNLISTEN Unregister listener from database changes
```js
   const {UNLISTEN} = require("clp-utils");
   
   const workDirectory = 'workDirectory';
   const {success} = await UNLISTEN(workDirectory);
```
