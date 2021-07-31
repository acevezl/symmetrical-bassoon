/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/js/idb.js":
/*!**************************!*\
  !*** ./public/js/idb.js ***!
  \**************************/
/***/ ((module) => {

eval("let db;\n\n// Establish connetion with local IndexedDB to store data locally when offline\nconst request = indexedDB.open('symmetrical_bossoon', 1);\n\n// event to emit if database version changes\nrequest.onupgradeneeded = function( event ) {\n    \n    // save ref to database\n    const db = event.target.result;\n\n    // create an object store called `new_trx` to store trx users try to save offline\n    db.createObjectStore('new_trx', { autoIncrement : true });\n\n}\n\n// event to emit upon successful database creation\nrequest.onsuccess = function( event ) {\n\n    // when database is successfully created with its object store (from upgradeneeded event above)\n    // or simply established connection, save reference to database in global var\n    db = event.target.result;\n   \n\n    // check if app is online, if so - run uploadTrx() to send all local data to API\n    if ( navigator.onLine ) {\n        uploadTrx();\n    }\n\n}\n\n// event to emit upon error - just logging error for now\nrequest.onerror = function( event ) {\n    // log into console\n    console.log(event.target.errorCode);\n}\n\n// function to call if we attempt to submit a new trx\nfunction saveTrx( trx ) {\n    \n    // open new transaction with the database with read/write permish\n    const transaction = db.transaction([`new_trx`], 'readwrite');\n\n    // access the object store for `new_trx`\n    const trxObjectStore = transaction.objectStore(`new_trx`);\n\n    // add trx record to the store with add method\n    trxObjectStore.add( trx );\n\n}\n\n// function to upload local data to API\nfunction uploadTrx() {\n\n    // open new transaction with the database with read/write permish\n    const transaction = db.transaction([`new_trx`], 'readwrite');\n\n    // access the object store for `new_trx`\n    const trxObjectStore = transaction.objectStore(`new_trx`);\n\n    // get all the trx in the local database - this will return a promise to catch on success\n    const getAll = trxObjectStore.getAll();\n\n    // if data collected, then push to API via fetch\n    getAll.onsuccess = function() {\n        \n        // if there was data in indexDB's store `new_trx`, push it up to API server\n        if ( getAll.result.length > 0 ) {\n            fetch('/api/transaction', {\n                method: 'POST',\n                body: JSON.stringify(getAll.result),\n                headers: {\n                    Accept: 'application/json, text/plain, */*',\n                    'Content-Type': 'application/json'\n                }\n            })\n            .then( response => response.json() )\n            .then( serverResponse => {\n                if( serverResponse.message ) {\n                    // if the server response comes with a message it means something went wrong\n                    throw new Error(serverResponse);\n                }\n                // if no error, then...\n                // open one more transaction\n                const transaction = db.transaction(`new_trx`, 'readwrite');\n\n                // access the new_trx object store\n                const trxObjectStore = transaction.objectStore(`new_trx`);\n\n                // clear all the items in the store, because those have been submitted to the API already\n                trxObjectStore.clear();\n\n                alert ('All transactions saved offline have been submitted');\n            })\n            .catch( err => {\n                console.log(err);\n            });\n        }\n    }\n}\n\n// listen for app coming back online - when it comes back online, upload locally-stored trx\nwindow.addEventListener('online', uploadTrx);   \n\nmodule.exports = {\n    saveTrx\n}\n\n//# sourceURL=webpack://symmbass/./public/js/idb.js?");

/***/ }),

/***/ "./public/js/index.js":
/*!****************************!*\
  !*** ./public/js/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _idb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./idb */ \"./public/js/idb.js\");\n/* harmony import */ var _idb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_idb__WEBPACK_IMPORTED_MODULE_0__);\n\n\nlet transactions = [];\nlet myChart;\n\nfetch(\"/api/transaction\")\n  .then(response => {\n    return response.json();\n  })\n  .then(data => {\n    // save db data on global variable\n    transactions = data;\n    populateTotal();\n    populateTable();\n    populateChart();\n\n    sessionStorage.setItem('transactions', JSON.stringify(transactions));\n  })\n  .catch( err => {\n    transactions = JSON.parse(sessionStorage.getItem('transactions'));\n    \n    populateTotal();\n    populateTable();\n    populateChart();\n    \n  });\n\nfunction populateTotal() {\n  // reduce transaction amounts to a single total value\n  let total = transactions.reduce((total, t) => {\n    return total + parseInt(t.value);\n  }, 0);\n\n  let totalEl = document.querySelector(\"#total\");\n  totalEl.textContent = total;\n}\n\nfunction populateTable() {\n  let tbody = document.querySelector(\"#tbody\");\n  tbody.innerHTML = \"\";\n\n  transactions.forEach(transaction => {\n    // create and populate a table row\n    let tr = document.createElement(\"tr\");\n    tr.innerHTML = `\n      <td>${transaction.name}</td>\n      <td>${transaction.value}</td>\n    `;\n\n    tbody.appendChild(tr);\n  });\n}\n\nfunction populateChart() {\n  // copy array and reverse it\n  let reversed = transactions.slice().reverse();\n  let sum = 0;\n\n  // create date labels for chart\n  let labels = reversed.map(t => {\n    let date = new Date(t.date);\n    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;\n  });\n\n  // create incremental values for chart\n  let data = reversed.map(t => {\n    sum += parseInt(t.value);\n    return sum;\n  });\n\n  // remove old chart if it exists\n  if (myChart) {\n    myChart.destroy();\n  }\n\n  let ctx = document.getElementById(\"myChart\").getContext(\"2d\");\n\n  myChart = new Chart(ctx, {\n    type: 'line',\n      data: {\n        labels,\n        datasets: [{\n            label: \"Total Over Time\",\n            fill: true,\n            backgroundColor: \"#6666ff\",\n            data\n        }]\n    }\n  });\n}\n\nfunction sendTransaction(isAdding) {\n  let nameEl = document.querySelector(\"#t-name\");\n  let amountEl = document.querySelector(\"#t-amount\");\n  let errorEl = document.querySelector(\".form .error\");\n\n  // validate form\n  if (nameEl.value === \"\" || amountEl.value === \"\") {\n    errorEl.textContent = \"Missing Information\";\n    return;\n  }\n  else {\n    errorEl.textContent = \"\";\n  }\n\n  // create record\n  let transaction = {\n    name: nameEl.value,\n    value: amountEl.value,\n    date: new Date().toISOString()\n  };\n\n  // if subtracting funds, convert amount to negative number\n  if (!isAdding) {\n    transaction.value *= -1;\n  }\n\n  // add to beginning of current array of data\n  transactions.unshift(transaction);\n\n  // re-run logic to populate ui with new record\n  populateChart();\n  populateTable();\n  populateTotal();\n  \n  // also send to server\n  fetch(\"/api/transaction\", {\n    method: \"POST\",\n    body: JSON.stringify(transaction),\n    headers: {\n      Accept: \"application/json, text/plain, */*\",\n      \"Content-Type\": \"application/json\"\n    }\n  })\n  .then(response => {    \n    return response.json();\n  })\n  .then(data => {\n    if (data.errors) {\n      errorEl.textContent = \"Missing Information\";\n    }\n    else {\n      // clear form\n      nameEl.value = \"\";\n      amountEl.value = \"\";\n    }\n  })\n  .catch(err => {\n\n    // fetch failed, so save in indexed db\n    (0,_idb__WEBPACK_IMPORTED_MODULE_0__.saveTrx)(transaction);\n\n    // store trx list in session Storage\n    sessionStorage.setItem('transactions', JSON.stringify(transactions));\n\n    // clear form\n    nameEl.value = \"\";\n    amountEl.value = \"\";\n  });\n}\n\ndocument.querySelector(\"#add-btn\").onclick = function() {\n  sendTransaction(true);\n};\n\ndocument.querySelector(\"#sub-btn\").onclick = function() {\n  sendTransaction(false);\n};\n\n\n//# sourceURL=webpack://symmbass/./public/js/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./public/js/index.js");
/******/ 	
/******/ })()
;