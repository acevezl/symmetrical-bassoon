let idb;

// Establish connetion with local IndexedDB to store data locally when offline
const request = indexedDB.open('symmetrical_bossoon', 1);

// event to emit if database version changes
request.onupgradeneeded = function( event ) {
    
    // save ref to database
    const db = event.target.result;

    // create an object store called new_trx + autoinc of sorts
    db.createObjectStore('new_trx', { autoIncrement : true });
}

// event to emit upon successful database creation
request.onsuccess = function( event ) {

    // when database is successfully created with its object store (from upgradeneeded event above)
    // or simply established connection, save reference to database in global var
    db = event.target.result;

    // check if app is online, if so - run uploadTrx() to send all local data to API
    if ( navigator.onLine ) {
        uploadTrx();
    }

}

// event to emit upon error - just logging error for now
request.onerror = function( event ) {
    // log into console
    console.log(event.target.errorCode);
}

// function to call if we attempt to submit a new trx
function saveTrx( trx ) {
    
    // open new transaction with the database with read/write permish
    const transaction = db.transaction([`new_trx`], 'readwrite');

    // access the object store for `new_trx`
    const trxObjectStore = transaction.objectStore(`new_trx`);

    // add trx record to the store with add method
    trxObjectStore.add( trx );

}

// function to upload local data to API
function uploadTrx() {

    // open new transaction with the database with read/write permish
    const transaction = db.transaction([`new_trx`], 'readwrite');

    // access the object store for `new_trx`
    const trxObjectStore = transaction.objectStore(`new_trx`);

    // get all the trx in the local database - this will return a promise to catch on success
    const getAll = trxObjectStore.getAll();

    // if data collected, then push to API via fetch
    getAll.onsuccess = function() {
        
        // if there was data in indexDB's store `new_trx`, push it up to API server
        if ( getAll.result.length > 0 ) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then( response => response.json() )
            .then( serverResponse => {
                if( serverResponse.message ) {
                    // if the server response comes with a message it means something went wrong
                    throw new Error(serverResponse);
                }
                // if no error, then...
                // open one more transaction
                const transaction = db.transaction(`new_trx`, 'readwrite');

                // access the new_trx object store
                const trxObjectStore = transaction.objectStore(`new_trx`);

                // clear all the items in the store, because those have been submitted to the API already
                trxObjectStore.clear();

                alert ('All transactions saved offline have been submitted');
            })
            .catch( err => {
                console.log(err);
            });
        }
    }
}

// listen for app coming back online - when it comes back online, upload locally-stored trx
window.addEventListener('online', uploadTrx);