const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./css/styles.css",
    "./dist/assets/icons/icon_72x72.png",
    "./dist/assets/icons/icon_96x96.png",
    "./dist/assets/icons/icon_128x128.png",
    "./dist/assets/icons/icon_144x144.png",
    "./dist/assets/icons/icon_152x152.png",
    "./dist/assets/icons/icon_192x192.png",
    "./dist/assets/icons/icon_384x384.png",
    "./dist/assets/icons/icon_512x512.png",
    "./dist/app.bundle.js",
];

const APP_PREFIX = 'SymmBass-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', function (event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Installing cache... ' + CACHE_NAME);
                return cache.addAll(FILES_TO_CACHE);
            })
    )

});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(keyList){
                let cacheKeepList = keyList.filter(function(key){
                    return key.indexOf(APP_PREFIX);
                });

                cacheKeepList.push(CACHE_NAME);

                return Promise.all(
                    keyList.map(function(key, i) {
                        if (cacheKeepList.indexOf(key) === -1) {
                            console.log('Deleting cache... ' + keyList[i]);
                            return caches.delete(keyList[i]);
                        }
                    })
                )
            })
        );

});

self.addEventListener('fetch', function(event){
    console.log('Fetching request... ' + event.request.url);
    
    event.respondWith(
        caches.match(event.request)
            .then(function(request) {
                if (request) {
                    console.log('Responding with cache... ' + event.request.url);
                    return request;
                } else {
                    console.log('File is not cached, fetching... ' + event.request.url);
                    return fetch(event.request);
                }

                // optional to the if/else above, use this:
                // return request || fetch(event.request);
            })
        )
});