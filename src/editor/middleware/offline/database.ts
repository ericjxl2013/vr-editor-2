import { BlobData } from './blobdata';

export class Database {

    public db!: IDBDatabase; // 全局的indexedDB数据库实例。
    public dbname!: string;
    public storename!: string;
    public version!: number;

    public constructor() {

        let i = new BlobData('3.mp4');

        let self = this;

        let dbName: string = 'demoDB2';
        let personStore: string = 'goods';
        let dbVersion: number = 2;

        // 1. 获取IDBFactory接口实例（文档地址： https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory）
        var indexedDB =
            window.indexedDB ||
            window.webkitIndexedDB ||
            window.mozIndexedDB ||
            window.msIndexedDB;

        if (!indexedDB) {
            console.error('你的浏览器不支持IndexedDB');
        }

        // 2. 通过IDBFactory接口的open方法打开一个indexedDB的数据库实例
        // 第一个参数： 数据库的名字，第二个参数：数据库的版本。返回值是一个：IDBRequest实例,此实例有onerror和onsuccess事件。
        var IDBOpenDBRequest = indexedDB.open(dbName, dbVersion);

        // 3. 对打开数据库的事件进行处理

        // 打开数据库成功后，自动调用onsuccess事件回调。
        IDBOpenDBRequest.onsuccess = function (e) {
            self.db = (<IDBOpenDBRequest>e.target).result;
            console.warn(dbName + ' 打开成功');
            // console.warn(e.target);
            // console.warn(db.objectStoreNames);
            // add();
            // ask();
            // readAll();

            getData('settings');
        };

        // 打开数据库失败
        IDBOpenDBRequest.onerror = function (e) {
            // console.log(e.currentTarget!.error.message);
            console.error('打开数据库失败!  database = ' + dbName);
            console.error('失败原因：' + (<IDBOpenDBRequest>e.target).error!.message);
        };

        // 第一次打开成功后或者版本有变化自动执行以下事件：一般用于初始化数据库。
        IDBOpenDBRequest.onupgradeneeded = function (e) {
            self.db = (<IDBOpenDBRequest>e.target).result; // 获取到 demoDB对应的 IDBDatabase实例,也就是我们的数据库。
            console.warn('数据库初始化');
            if (!self.db.objectStoreNames.contains(personStore)) {
                // 如果表格不存在，创建一个新的表格（keyPath，主键 ； autoIncrement,是否自增），会返回一个对象（objectStore）
                // objectStore就相当于数据库中的一张表。IDBObjectStore类型。
                var objectStore = self.db.createObjectStore(personStore, {
                    keyPath: 'id',
                    autoIncrement: true
                });

                //指定可以被索引的字段，unique字段是否唯一。类型： IDBIndex
                objectStore.createIndex('ssn', 'ssn', {
                    unique: true
                });
                // objectStore.createIndex('phone', 'phone', {
                //     unique: false
                // });
            }
            console.warn('数据库版本更改为： ' + self.db.version);
        };


        // let add = function () {
        //     // 创建事务对象
        //     var tx = db.transaction('goods', 'readwrite');
        //     // 从数据库中获得存储对象，表
        //     var goods = tx.objectStore('goods');
        //     // javascript中的对象数组
        //     var items = [{ 'id': 3, 'name': 'xxxxx', 'price': 19999.5 }, { 'id': 4, 'name': 'eeee', 'price': 1997.3 }];
        //     for (var i = 0; i < items.length; i++) {
        //         goods.add(items[i]);
        //     }


        //     console.log('添加数据成功！');
        // }

        function add() {
            var request = self.db.transaction('goods', 'readwrite')
                .objectStore('goods')
                .add({ id: 5, name: '张三', age: 24, email: 'zhangsan@example.com' });

            request.onsuccess = function (event) {
                console.log('数据写入成功');
            };

            request.onerror = function (event) {
                console.log('数据写入失败');
            }
        }


        let addData = function (data: any) {
            var request = self.db.transaction('goods', 'readwrite')
                .objectStore('goods')
                .add(data);

            request.onsuccess = function (event) {
                console.log('数据写入成功');
            };

            request.onerror = function (event) {
                console.warn('数据写入失败');
                console.warn(event.target);
            }
        }

        let ask = () => {
            axios.get('/api/settings')
                .then(response => {
                    // console.log('response: ' + response.data);
                    // ep.emit('scenes', response.data);
                    // self.getScene(response.data.data.scenes[0].id);
                    console.warn('add data');
                    addData({ v: 2, data: response.data.data, ssn: 'settings' });
                })
                .catch(error => {
                    console.error(error);
                }

                );
        }


        let getData = (key: string) => {
            var transaction = self.db.transaction(['goods'], 'readonly');
            var store = transaction.objectStore('goods');
            var index = store.index('ssn');
            var request = index.get(key);

            request.onsuccess = function (e) {
                var result = (<IDBRequest>e.target).result;

                if (result) {
                    // ...
                    console.warn(result);
                } else {
                    // ...
                    console.warn('没有数据');
                }
            }

            request.onerror = function (event) {
                console.error('数据读取失败');
                console.error((<IDBRequest>event.target).error);
            }
        }

        function readAll() {
            var objectStore = self.db.transaction('goods').objectStore('goods');

            objectStore.openCursor().onsuccess = function (event) {
                var cursor = (<IDBRequest>event.target!).result;
                if (cursor) {
                    // console.log('Id: ' + cursor.key);
                    // console.log('Name: ' + cursor.value.name);
                    // console.log('Age: ' + cursor.value.age);
                    // console.log('Email: ' + cursor.value.email);
                    console.log(cursor.value);
                    cursor.continue();
                } else {
                    console.log('没有更多数据了！');
                }
            };
        }


    }


    // TODO: 异步加载，promise方式更改
    public connect(dbname: string, store: string, v: number = 1, indexes?: string[], unique: boolean = true): void {
        let self = this;

        self.dbname = dbname;
        self.storename = store;
        self.version = v;

        // 1. 获取IDBFactory接口实例（文档地址： https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory）
        let indexedDB: IDBFactory =
            window.indexedDB ||
            window.webkitIndexedDB ||
            window.mozIndexedDB ||
            window.msIndexedDB;

        if (!indexedDB) {
            console.error('你的浏览器不支持IndexedDB，当前数据库：' + dbname);
            return;
        } else {
            let openDBR = indexedDB.open(dbname, v);
            openDBR.onsuccess = event => {
                // self.db = <idb>e.target
            }
        }

        // 2. 通过IDBFactory接口的open方法打开一个indexedDB的数据库实例
        // 第一个参数： 数据库的名字，第二个参数：数据库的版本。返回值是一个：IDBRequest实例,此实例有onerror和onsuccess事件。
        let openRequest: IDBOpenDBRequest = indexedDB.open(dbname, v);

        // 3. 对打开数据库的事件进行处理
        // 打开数据库成功后，自动调用onsuccess事件回调。
        openRequest.onsuccess = function (e) {
            self.db = (<IDBOpenDBRequest>e.target).result;
            console.warn('数据库打开成功! database = ' + dbname);
            // console.warn(e.target);
            // console.warn(db.objectStoreNames);
            // add();
            // ask();
            // readAll();
            // getData('settings2');
        };

        // 打开数据库失败
        openRequest.onerror = function (e) {
            console.error('打开数据库失败!  database = ' + dbname);
            console.error((<IDBOpenDBRequest>e.target).error!.message);
        };

        // 第一次打开成功后或者版本有变化自动执行以下事件：一般用于初始化数据库。
        openRequest.onupgradeneeded = function (e) {
            self.db = (<IDBOpenDBRequest>e.target).result; // 获取到 demoDB对应的 IDBDatabase实例,也就是我们的数据库。
            console.warn('数据库初始化 database = ' + dbname);
            if (!self.db.objectStoreNames.contains(store)) {
                // 如果表格不存在，创建一个新的表格（keyPath，主键；autoIncrement,是否自增），会返回一个对象（objectStore）
                // objectStore就相当于数据库中的一张表。IDBObjectStore类型。
                let objectStore = self.db.createObjectStore(store, {
                    keyPath: 'id',
                    autoIncrement: true
                });

                // 指定可以被索引的字段，unique字段是否唯一。类型： IDBIndex
                if (indexes) {
                    indexes.forEach(item => {
                        objectStore.createIndex(item, item, {
                            unique: unique
                        });
                    });
                }
            }
            console.warn('数据库版本更改为： ' + self.db.version);
        };
    }

    public add(data: any): void {
        let self = this;
        if (self.db) {
            let request = self.db.transaction(self.storename, 'readwrite')
                .objectStore(self.storename)
                .add(data);

            request.onsuccess = function (event) {
                debug.warn('数据写入成功');
                console.warn(event.target);
            };

            request.onerror = function (event) {
                debug.error('数据写入失败');
                console.error((<IDBRequest>event.target).error!.message);
            }
        }
    }

    // TODO，要有callback
    public connectCall(dbname: string, store: string, v: number = 1, indexes?: string[], unique: boolean = true, callback?: Function) {
        let self = this;

        self.dbname = dbname;
        self.storename = store;
        self.version = v;

        // 1. 获取IDBFactory接口实例（文档地址： https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory）
        let indexedDB: IDBFactory =
            window.indexedDB ||
            window.webkitIndexedDB ||
            window.mozIndexedDB ||
            window.msIndexedDB;

        if (!indexedDB) {
            console.error('你的浏览器不支持IndexedDB，当前数据库：' + dbname);
            return;
        } else {
            let openDBR = indexedDB.open(dbname, v);
            openDBR.onsuccess = event => {
                // self.db = <idb>e.target
            }
        }

        // 2. 通过IDBFactory接口的open方法打开一个indexedDB的数据库实例
        // 第一个参数： 数据库的名字，第二个参数：数据库的版本。返回值是一个：IDBRequest实例,此实例有onerror和onsuccess事件。
        let openRequest: IDBOpenDBRequest = indexedDB.open(dbname, v);

        // 3. 对打开数据库的事件进行处理
        // 打开数据库成功后，自动调用onsuccess事件回调。
        openRequest.onsuccess = function (e) {
            self.db = (<IDBOpenDBRequest>e.target).result;
            console.warn('数据库打开成功! database = ' + dbname);

            // callback('success', dbname);
            // console.warn(e.target);
            // console.warn(db.objectStoreNames);
            // add();
            // ask();
            // readAll();
            // getData('settings2');
        };

        // 打开数据库失败
        openRequest.onerror = function (e) {
            console.error('打开数据库失败!  database = ' + dbname);
            console.error((<IDBOpenDBRequest>e.target).error!.message);
        };

        // 第一次打开成功后或者版本有变化自动执行以下事件：一般用于初始化数据库。
        openRequest.onupgradeneeded = function (e) {
            self.db = (<IDBOpenDBRequest>e.target).result; // 获取到 demoDB对应的 IDBDatabase实例,也就是我们的数据库。
            console.warn('数据库初始化 database = ' + dbname);
            if (!self.db.objectStoreNames.contains(store)) {
                // 如果表格不存在，创建一个新的表格（keyPath，主键；autoIncrement,是否自增），会返回一个对象（objectStore）
                // objectStore就相当于数据库中的一张表。IDBObjectStore类型。
                let objectStore = self.db.createObjectStore(store, {
                    keyPath: 'id',
                    autoIncrement: true
                });

                // 指定可以被索引的字段，unique字段是否唯一。类型： IDBIndex
                if (indexes) {
                    indexes.forEach(item => {
                        objectStore.createIndex(item, item, {
                            unique: unique
                        });
                    });
                }
            }
            console.warn('数据库版本更改为： ' + self.db.version);
        };
    }


    public getFromIndex(indexname: string, value: any): any {
        let self = this;
        if (self.db) {
            let transaction = self.db.transaction(self.storename, 'readonly');
            let store = transaction.objectStore(self.storename);
            let dbIndex = store.index(indexname);
            let request = dbIndex.get(value);

            request.onsuccess = function (e) {
                let result = (<IDBRequest>e.target).result;

                if (result) {
                    // ...
                    console.warn('数据库读取成功');
                    console.warn(result);
                    // return result.data;
                } else {
                    // ...
                    console.warn('没有数据');
                    // return null;
                }
            }

            request.onerror = function (event) {
                console.error('数据读取失败');
                console.error((<IDBRequest>event.target).error!.message);
            }
        }
    }


    public remove(): void {

    }


    public update(): void {

    }

    public clear(): void {

    }


}