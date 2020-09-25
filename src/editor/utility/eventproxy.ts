export class EventProxy {

    private _callbacks: { [key: string]: Function[] };
    private _fired: { [key: string]: any } = {};
    private _after: any;

    public debug: Function;

    /*!
     * refs
     */
    private SLICE = Array.prototype.slice;
    private CONCAT = Array.prototype.concat;
    private ALL_EVENT: string = '__all__';

    private later = (typeof setImmediate !== 'undefined' && setImmediate) ||
        (typeof process !== 'undefined' && process.nextTick) || function (fn) {
            setTimeout(fn, 0);
        };


    public constructor(debug?: () => void) {
        this.debug = debug || function () { };
        this._callbacks = {};
    }

    public addListener(ev: string, callback: Function): EventProxy {
        this.debug('Add listener for %s', ev);
        this._callbacks[ev] = this._callbacks[ev] || [];
        this._callbacks[ev].push(callback);
        return this;
    }

    public bind(ev: string, callback: Function): EventProxy {
        return this.addListener(ev, callback);
    }

    public on(ev: string, callback: Function): EventProxy {
        return this.addListener(ev, callback);
    }

    public subscribe(ev: string, callback: Function): EventProxy {
        return this.addListener(ev, callback);
    }

    public headbind(ev: string, callback: Function): EventProxy {
        this.debug('Add listener for %s', ev);
        this._callbacks[ev] = this._callbacks[ev] || [];
        this._callbacks[ev].unshift(callback);
        return this;
    }

    public removeListener(eventname?: string, callback?: Nullable<Function>): EventProxy {
        var calls = this._callbacks;
        if (!eventname) {
            this.debug('Remove all listeners');
            this._callbacks = {};
        } else {
            if (!callback) {
                this.debug('Remove all listeners of %s', eventname);
                calls[eventname] = [];
            } else {
                var list = calls[eventname];
                if (list) {
                    var l = list.length;
                    for (var i = 0; i < l; i++) {
                        if (callback === list[i]) {
                            this.debug('Remove a listener of %s', eventname);
                            list.splice(i, 1);
                        }
                    }
                }
            }
        }
        return this;
    }

    public unbind(eventname?: string, callback?: Nullable<Function>): EventProxy {
        return this.removeListener(eventname, callback);
    }

    public removeAllListeners(): EventProxy {
        return this.unbind();
    }

    public bindForAll(callback: Function): void {
        this.bind(this.ALL_EVENT, callback);
    }

    public unbindForAll(callback: Function): void {
        this.unbind(this.ALL_EVENT, callback);
    }


    public trigger(eventname: string, data?: any, ...args: any[]): EventProxy {
        var list, ev, callback, i, l;
        var both = 2;
        var calls = this._callbacks;
        this.debug('Emit event %s with data %j', eventname, data);
        // 运行当前ev和ALL
        while (both--) {
            ev = both ? eventname : this.ALL_EVENT;
            list = calls[ev];
            if (list) {
                for (i = 0, l = list.length; i < l; i++) {
                    if (!(callback = list[i])) {
                        list.splice(i, 1);
                        i--;
                        l--;
                    } else {
                        var args = [];
                        var start = both ? 1 : 0;
                        for (var j = start; j < arguments.length; j++) {
                            args.push(arguments[j]);
                        }
                        callback.apply(this, args);
                    }
                }
            }
        }
        return this;
    }

    public emit(eventname: string, data?: any): EventProxy {
        return this.trigger(eventname, data);
    }

    public fire(eventname: string, data?: any): EventProxy {
        return this.trigger(eventname, data);
    }

    public once(ev: string, callback: Function): EventProxy {
        var self = this;
        var wrapper = function () {
            callback.apply(self, arguments);
            self.unbind(ev, wrapper);
        };
        this.bind(ev, wrapper);
        return this;
    }

    // TODO
    // public emitLater() {
    //     var self = this;
    //     var args: any[] = [];

    //     for(var i = 0; i < arguments.length; i++) {
    //         args.push(arguments[i]);
    //     }
    //     this.later(function () {
    //         self.trigger.apply(self, args);
    //     });
    // }


    public immediate(ev: string, callback: Function, data: any) {
        this.bind(ev, callback);
        this.trigger(ev, data);
        return this;
    }

    private _assign(eventnames: string[], cb: Function, once: boolean): void {
        var proxy = this;
        // var argsLength = arguments.length;
        var times = 0;
        var flag: { [key: string]: boolean } = {};

        // Check the arguments length.
        // if (argsLength < 3) {
        //     return this;
        // }

        var events = eventnames;
        var callback = cb;
        var isOnce = once;

        // Check the callback type.
        if (typeof callback !== "function") {
            return;
        }
        this.debug('Assign listener for events %j, once is %s', events, !!isOnce);

        var bind = function (key: string) {
            if (isOnce) {
                proxy.once(key, (data: any) => {
                    proxy._fired[key] = proxy._fired[key] || {};
                    proxy._fired[key].data = data;
                    if (!flag[key]) {
                        flag[key] = true;
                        times++;
                    }
                });
            } else {
                proxy.bind(key, (data: any) => {
                    proxy._fired[key] = proxy._fired[key] || {};
                    proxy._fired[key].data = data;
                    if (!flag[key]) {
                        flag[key] = true;
                        times++;
                    }
                })
            }
        };

        var length = events.length;
        for (var index = 0; index < length; index++) {
            bind(events[index]);
        }

        var _all = function (event: string) {
            if (times < length) {
                return;
            }
            if (!flag[event]) {
                return;
            }
            var data = [];
            for (var index = 0; index < length; index++) {
                data.push(proxy._fired[events[index]].data);
            }
            if (isOnce) {
                proxy.unbindForAll(_all);
            }
            proxy.debug('Events %j all emited with data %j', events, data);
            callback.apply(null, data);
        };
        proxy.bindForAll(_all);
    }


    public all(eventname1: string | string[], eventname2: string | string[], callback: Function): EventProxy {
        var names: string[] = [];
        if (typeof eventname1 === 'string') {
            names.push(eventname1);
        } else {
            names = this.CONCAT.apply(names, <string[]>eventname1);
        }
        if (typeof eventname2 === 'string') {
            names.push(eventname2);
        } else {
            names = this.CONCAT.apply(names, <string[]>eventname2);
        }
        this._assign.apply(this, [names, callback, true]);
        return this;
    }

    public assign(eventname1: string | string[], eventname2: string | string[], callback: Function): EventProxy {
        return this.all(eventname1, eventname2, callback);
    }

    public fail(callback: Function): EventProxy {
        var that = this;
        that.once('error', function () {
            that.unbind();
            // put all arguments to the error handler
            // fail(function(err, args1, args2, ...){})
            callback.apply(null, arguments);
        });
        return this;
    }

    public throw(err: Error): void {
        this.emit('error', err);
    }

    public tail(eventname1: string | string[], eventname2: string | string[], callback: Function): EventProxy {
        var names: string[] = [];
        if (typeof eventname1 === 'string') {
            names.push(eventname1);
        } else {
            names = this.CONCAT.apply(names, <string[]>eventname1);
        }
        if (typeof eventname2 === 'string') {
            names.push(eventname2);
        } else {
            names = this.CONCAT.apply(names, <string[]>eventname2);
        }
        this._assign.apply(this, [names, callback, false]);
        return this;
    }

    public assignAll(eventname1: string | string[], eventname2: string | string[], callback: Function): EventProxy {
        return this.tail(eventname1, eventname2, callback);
    }

    public assignAlways(eventname1: string | string[], eventname2: string | string[], callback: Function): EventProxy {
        return this.tail(eventname1, eventname2, callback);
    }

    /**
     * The callback will be executed after the event be fired N times.
     * @param {String} eventname Event name.
     * @param {Number} times N times.
     * @param {Function} callback Callback, that will be called after event was fired N times.
     */
    public after(eventname: string, times: number, callback: Function): EventProxy {
        if (times === 0) {
            callback.call(null, []);
            return this;
        }
        var proxy = this,
            firedData: any[] = [];
        this._after = this._after || {};
        var group = eventname + '_group';
        this._after[group] = {
            index: 0,
            results: []
        };
        this.debug('After emit %s times, event %s\'s listenner will execute', times, eventname);
        var all = function (name: string, data: any) {
            if (name === eventname) {
                times--;
                firedData.push(data);
                if (times < 1) {
                    proxy.debug('Event %s was emit %s, and execute the listenner', eventname, times);
                    proxy.unbindForAll(all);
                    callback.apply(null, [firedData]);
                }
            }
            if (name === group) {
                times--;
                proxy._after[group].results[data.index] = data.result;
                if (times < 1) {
                    proxy.debug('Event %s was emit %s, and execute the listenner', eventname, times);
                    proxy.unbindForAll(all);
                    callback.call(null, proxy._after[group].results);
                }
            }
        };
        proxy.bindForAll(all);
        return this;
    }

    /**
     * The `after` method's helper. Use it will return ordered results.
     * If you need manipulate result, you need callback
     * Examples:
     * ```js
     * var ep = new EventProxy();
     * ep.after('file', files.length, function (list) {
     *   // Ordered results
     * });
     * for (var i = 0; i < files.length; i++) {
     *   fs.readFile(files[i], 'utf-8', ep.group('file'));
     * }
     * ```
     * @param {String} eventname Event name, shoule keep consistent with `after`.
     * @param {Function} callback Callback function, should return the final result.
     */
    public group(eventname: string, callback: Function) {
        var that = this;
        var group = eventname + '_group';
        var index = that._after[group].index;
        that._after[group].index++;
        return function (err: Error, data: any) {
            if (err) {
                // put all arguments to the error handler
                that.throw(err);
            }
            that.emit(group, {
                index: index,
                // callback(err, args1, args2, ...)
                result: callback ? callback.apply(null, that.SLICE.call(arguments, 1)) : data
            });
        };
    }

    /**
     * The callback will be executed after any registered event was fired. It only executed once.
     * @param {String} eventname1 Event name.
     * @param {String} eventname2 Event name.
     * @param {Function} callback The callback will get a map that has data and eventname attributes.
     */
    public any(eventname1: string | string[], eventname2: string | string[], callback: Function) {
        var proxy = this,
            events = proxy.SLICE.call(arguments, 0, -1),
            _eventname = events.join("_");

        proxy.debug('Add listenner for Any of events %j emit', events);
        proxy.once(_eventname, callback);

        var _bind = function (key: string) {
            proxy.bind(key, function (data: any) {
                proxy.debug('One of events %j emited, execute the listenner');
                proxy.trigger(_eventname, { "data": data, eventName: key });
            });
        };

        for (var index = 0; index < events.length; index++) {
            _bind(events[index]);
        }
    }

    /**
     * The callback will be executed when the event name not equals with assigned event.
     * @param {String} eventname Event name.
     * @param {Function} callback Callback.
     */
    public not(eventname: string, callback: Function) {
        var proxy = this;
        proxy.debug('Add listenner for not event %s', eventname);
        proxy.bindForAll(function (name: string, data: any) {
            if (name !== eventname) {
                proxy.debug('listenner execute of event %s emit, but not event %s.', name, eventname);
                callback(data);
            }
        });
    }

    /**
     * Success callback wrapper, will handler err for you.
     *
     * ```js
     * fs.readFile('foo.txt', ep.done('content'));
     *
     * // equal to =>
     *
     * fs.readFile('foo.txt', function (err, content) {
     *   if (err) {
     *     return ep.emit('error', err);
     *   }
     *   ep.emit('content', content);
     * });
     * ```
     *
     * ```js
     * fs.readFile('foo.txt', ep.done('content', function (content) {
     *   return content.trim();
     * }));
     *
     * // equal to =>
     *
     * fs.readFile('foo.txt', function (err, content) {
     *   if (err) {
     *     return ep.emit('error', err);
     *   }
     *   ep.emit('content', content.trim());
     * });
     * ```
     * @param {Function|String} handler, success callback or event name will be emit after callback.
     * @return {Function}
     */
    public done(handler: Function | String, callback?: Function) {
        var that = this;
        return function (err: Error, data: any) {
            if (err) {
                // put all arguments to the error handler
                return that.emit.apply(that, ['error', err]);
            }

            // callback(err, args1, args2, ...)
            var args = that.SLICE.call(arguments, 1);

            if (typeof handler === 'string') {
                if (callback) {
                    // only replace the args when it really return a result
                    return that.emit(handler, callback.apply(null, args));
                } else {
                    // put all arguments to the done handler
                    //ep.done('some');
                    //ep.on('some', function(args1, args2, ...){});
                    return that.emit.apply(that, [handler, args]);
                }
            }

            // speed improve for mostly case: `callback(err, data)`
            if (arguments.length <= 2) {
                return (<Function>handler)(data);
            }

            // callback(err, args1, args2, ...)
            (<Function>handler).apply(null, args);
        };
    }

    //     /**
    //    * make done async
    //    * @return {Function} delay done
    //    */
    //     EventProxy.prototype.doneLater = function (handler, callback) {
    //         var _doneHandler = this.done(handler, callback);
    //         return function (err, data) {
    //             var args = arguments;
    //             later(function () {
    //                 _doneHandler.apply(null, args);
    //             });
    //         };
    //     };

    /**
     * Create a new EventProxy
     * Examples:
     * ```js
     * var ep = EventProxy.create();
     * ep.assign('user', 'articles', function(user, articles) {
     *   // do something...
     * });
     * // or one line ways: Create EventProxy and Assign
     * var ep = EventProxy.create('user', 'articles', function(user, articles) {
     *   // do something...
     * });
     * ```
     * @return {EventProxy} EventProxy instance
     */
    public static create(): EventProxy {
        var ep = new EventProxy();
        return ep;
    }

    public static createWithArgs(eventname1: string | string[], eventname2: string | string[], callback: Function): EventProxy {
        var ep = new EventProxy();
        var names: string[] = [];
        if (typeof eventname1 === 'string') {
            names.push(eventname1);
        } else {
            names = ep.CONCAT.apply(names, <string[]>eventname1);
        }
        if (typeof eventname2 === 'string') {
            names.push(eventname2);
        } else {
            names = ep.CONCAT.apply(names, <string[]>eventname2);
        }
        ep._assign.apply(this, [names, callback, true]);
        return ep;
    }


}