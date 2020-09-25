let db:IDBDatabase;

var init = (version?:number) => {
    return new Promise<IDBDatabase>(function (resolve, reject) {
        if (db) {
            resolve(db);
        }
        else{
            version = version || 1;
            var request = indexedDB.open('jsonFile');
            request.onerror = function (e) {
                reject('OPen Error!' + e);
            };
            request.onsuccess = function (e) {
                db = (e.target! as any).result;
                resolve(db);
            };
            request.onupgradeneeded = function (e: Event) {
                var db:IDBDatabase = (e.target as any).result;
                if (!db.objectStoreNames.contains('assetJson')) {
                    db.createObjectStore('assetJson', { keyPath:['softwareId','assetId']});
                }
                if (!db.objectStoreNames.contains('assetJsonVersion')) {
                    db.createObjectStore('assetJsonVersion', { keyPath:['softwareId','assetId']});
                }
            };
        }
    })
}

export let setLocalAssetJson=async(softwareId:string,assetId:string,value:string|Blob)=>{
    var db= await init();
    return new Promise<boolean>(function (resolve,reject) {
        var transaction = db.transaction(['assetJson'], 'readwrite');
        var store = transaction.objectStore('assetJson');
        var request = store.put({softwareId:softwareId,assetId:assetId,value:value});
        request.onerror = function() {
            reject('indexeddb设置value出错');
        };
        request.onsuccess = function( result) {
            resolve((result as any).target.result);
        }
    })
}

export let getLocalAssetJson=async(softwareId:string,assetId:string)=>{
    var db= await init();
    return new Promise<string|Blob>(function (resolve) {
        var transaction = db.transaction(['assetJson'], 'readwrite');
        var store = transaction.objectStore('assetJson');
        var request = store.get([softwareId,assetId]);
        request.onerror = function(ev) {
            console.error(ev);
            resolve(undefined);
        };
        request.onsuccess = function( result) {
            var r=(result as any).target.result;
            if(!r){
                resolve(undefined);
            }
            else{
                resolve(r.value);
            }
        }
    })
}

export let setAssetJsonVersion=async(softwareId:string,assetId:string,version:number|string)=>{
    var db= await init();
    return new Promise<boolean>(function (resolve,reject) {
        var transaction = db.transaction(['assetJsonVersion'], 'readwrite');
        var store = transaction.objectStore('assetJsonVersion');
        var request = store.put({softwareId:softwareId,assetId:assetId,version:version});
        request.onerror = function() {
            reject('indexeddb设置value出错');
        };
        request.onsuccess = function( result) {
            resolve((result as any).target.result);
        }
    })
}

export let getAssetJsonVersion=async(softwareId:string,assetId:string)=>{
    var db= await init();
    return new Promise<number|string>(function (resolve) {
        var transaction = db.transaction(['assetJsonVersion'], 'readwrite');
        var store = transaction.objectStore('assetJsonVersion');
        var request = store.get([softwareId,assetId]);
        request.onerror = function() {
            resolve(0);
        };
        request.onsuccess = function( result) {
            var r=(result as any).target.result;
            if(!r)
                resolve(0);
            else{
                resolve(r.version);
            }
        }
    })
}
