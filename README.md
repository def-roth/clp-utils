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

READ Pagination based search queries for equal queries
```js
   const {READ} = require("clp-utils");
   
   const queryArray = []; // query all data if empty
   
   const columnToQuery = 0; // must be the column or can be _id if the id is provided. may be used with searchType 1 to omit other query params
   const searchValue = "Tom";
   const secondSearchValue = "Tim"; // if an array or an object with coords property is provided see below, else this becomes an equal
   const mustMatchAll = false; // true if must match that query, false if OR query is desired
   const negate = false;
   
   const sampleQuery = [
        columnToQuery, searchValue, mustMatchAll, negate
   ];
   const secondSampleQuery = [
        columnToQuery, secondSearchValue, mustMatchAll, negate
   ]
   queryArray.push(sampleQuery);
   queryArray.push(secondSampleQuery);
   
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
READ Pagination based search queries for min,max,range queries
```js
   const {READ} = require("clp-utils");
   
   const queryArray = []; // query all data

   const type = "date"; // number or range
   const lower = new Date(); // null for greater search only
   const upper = new Date(); // null for lesser search only
   // lower === upper for equal search. which is the same as not using this syntax
   // if upper < lower, the query params switch

   const gt = false; // true for greater / less, false for greater equal / less equal
   const searchValue = [type, lower, upper, gt];


   const columnToQuery = 0;
   const mustMatchAll = false; // select if AND / OR - query for this query
   const negate = false;
   
   const sampleQuery = [
        columnToQuery, searchValue, mustMatchAll, negate
   ];
 
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

READ Pagination based search queries for geo queries
```js
   const {READ} = require("clp-utils");
   
   const queryArray = []; // query all data
   
   const columnToQuery = 0;

   const type = "near"; // intersect or within
   const lng = 52.1;
   const lat = 4.21;
   const coords = [[lng, lat]];  // takes the first entry if type is near. else must have at least 3 points, be a polygon and not self intersecting.

   const props = { // relevant for near. may be omitted if not necessary.
    low: 10,  // minimum distance in meters to look for
    high: 100, // maximum distance in meters to look for
    // if high < lower, the values switch
  }; 

   const searchValue = {type, coords, props};

   const mustMatchAll = false;
   const negate = false;
   
   const sampleQuery = [
        columnToQuery, searchValue, mustMatchAll, negate
   ];
  
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
