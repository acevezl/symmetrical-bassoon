/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./public/js/idb.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/js/idb.js":
/*!**************************!*\
  !*** ./public/js/idb.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let idb;\n\n// Establish connetion with local IndexedDB to store data locally when offline\nconst request = indexedDB.open('symmetrical_bossoon', 1);\n\n// event to emit if database version changes\nrequest.onupgradeneeded = function( event ) {\n    \n    // save ref to database\n    const db = event.target.result;\n\n    // create an object store called new_trx + autoinc of sorts\n    db.createObjectStore('new_trx', { autoIncrement : true });\n}\n\n// event to emit upon successful database creation\nrequest.onsuccess = function( event ) {\n\n    // when database is successfully created with its object store (from upgradeneeded event above)\n    // or simply established connection, save reference to database in global var\n    db = event.target.result;\n\n    // check if app is online, if so - run uploadTrx() to send all local data to API\n    if ( navigator.onLine ) {\n        uploadTrx();\n    }\n\n}\n\n// event to emit upon error - just logging error for now\nrequest.onerror = function( event ) {\n    // log into console\n    console.log(event.target.errorCode);\n}\n\n// function to call if we attempt to submit a new trx\nfunction saveTrx( trx ) {\n    \n    // open new transaction with the database with read/write permish\n    const transaction = db.transaction([`new_trx`], 'readwrite');\n\n    // access the object store for `new_trx`\n    const trxObjectStore = transaction.objectStore(`new_trx`);\n\n    // add trx record to the store with add method\n    trxObjectStore.add( trx );\n\n}\n\n// function to upload local data to API\nfunction uploadTrx() {\n\n    // open new transaction with the database with read/write permish\n    const transaction = db.transaction([`new_trx`], 'readwrite');\n\n    // access the object store for `new_trx`\n    const trxObjectStore = transaction.objectStore(`new_trx`);\n\n    // get all the trx in the local database - this will return a promise to catch on success\n    const getAll = trxObjectStore.getAll();\n\n    // if data collected, then push to API via fetch\n    getAll.onsuccess = function() {\n        \n        // if there was data in indexDB's store `new_trx`, push it up to API server\n        if ( getAll.result.length > 0 ) {\n            fetch('/api/transaction', {\n                method: 'POST',\n                body: JSON.stringify(getAll.result),\n                headers: {\n                    Accept: 'application/json, text/plain, */*',\n                    'Content-Type': 'application/json'\n                }\n            })\n            .then( response => response.json() )\n            .then( serverResponse => {\n                if( serverResponse.message ) {\n                    // if the server response comes with a message it means something went wrong\n                    throw new Error(serverResponse);\n                }\n                // if no error, then...\n                // open one more transaction\n                const transaction = db.transaction(`new_trx`, 'readwrite');\n\n                // access the new_trx object store\n                const trxObjectStore = transaction.objectStore(`new_trx`);\n\n                // clear all the items in the store, because those have been submitted to the API already\n                trxObjectStore.clear();\n\n                alert ('All transactions saved offline have been submitted');\n            })\n            .catch( err => {\n                console.log(err);\n            });\n        }\n    }\n}\n\n// listen for app coming back online - when it comes back online, upload locally-stored trx\nwindow.addEventListener('online', uploadTrx);   \n\nmodule.exports = {\n    saveTrx\n}\n\n//# sourceURL=webpack:///./public/js/idb.js?");

/***/ })

/******/ });