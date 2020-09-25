import { Observer } from "./observer";
import { Events } from "./events";

export class ObserverHistory extends Events {

    private item: any;
    private _enabled: boolean;
    private _combine: boolean;
    private _prefix: string;
    private _events2: any[];
    private _getItemFn: Function;

    public get enabled(): boolean {
        return this._enabled;
    }
    public set enabled(val: boolean) {
        this._enabled = !!val;
    }

    public get prefix(): string {
        return this._prefix;
    }
    public set prefix(val: string) {
        this._prefix = val || '';
    }

    public get combine(): boolean {
        return this._combine;
    }
    public set combine(val: boolean) {
        this._combine = !!val;
    }


    public constructor(args?: any) {
        super();

        args = args || {};

        this.item = args.item;
        this._enabled = args.enabled || true;
        this._combine = args._combine || false;
        this._prefix = args.prefix || '';
        this._getItemFn = args.getItemFn;

        this._events2 = [];

        this._initialize();
    }


    private _initialize() {
        var self = this;

        this._events2.push(this.item.on('*:set', function (path: string, value: any, valueOld: any) {
            if (!self._enabled) return;

            // need jsonify
            if (value instanceof Observer) {
                // value = value.json();
                value = value._data;
            }
                
            // action
            var data = {
                name: self._prefix + path,
                combine: self._combine,
                undo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;

                    if (valueOld === undefined) {
                        item.unset(path);
                    } else {
                        item.set(path, valueOld);
                    }

                    item.history.enabled = true;
                },
                redo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;

                    if (value === undefined) {
                        item.unset(path);
                    } else {
                        item.set(path, value);
                    }

                    item.history.enabled = true;
                }
            };

            if (data.combine && editor.call('history:canUndo') && editor.call('history:list')[editor.call('history:current')].name === data.name) {
                // update
                self.emit('record', 'update', data);
            } else {
                // add
                self.emit('record', 'add', data);
            }
        }));

        this._events2.push(this.item.on('*:unset', function (path: string, valueOld: any) {
            if (!self._enabled) return;

            // action
            var data = {
                name: self._prefix + path,
                undo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.set(path, valueOld);
                    item.history.enabled = true;
                },
                redo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.unset(path);
                    item.history.enabled = true;
                }
            };

            self.emit('record', 'add', data);
        }));

        this._events2.push(this.item.on('*:insert', function (path: string, value: any, ind: number) {
            if (!self._enabled) return;

            // need jsonify
            // if (value instanceof Observer)
            //     value = value.json();

            // action
            var data = {
                name: self._prefix + path,
                undo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.removeValue(path, value);
                    item.history.enabled = true;
                },
                redo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.insert(path, value, ind);
                    item.history.enabled = true;
                }
            };

            self.emit('record', 'add', data);
        }));

        this._events2.push(this.item.on('*:remove', function (path: string, value: any, ind: number) {
            if (!self._enabled) return;

            // need jsonify
            // if (value instanceof Observer)
            //     value = value.json();

            // action
            var data = {
                name: self._prefix + path,
                undo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.insert(path, value, ind);
                    item.history.enabled = true;
                },
                redo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.removeValue(path, value);
                    item.history.enabled = true;
                }
            };

            self.emit('record', 'add', data);
        }));

        this._events2.push(this.item.on('*:move', function (path: string, value: any, ind: number, indOld: number) {
            if (!self._enabled) return;

            // action
            var data = {
                name: self._prefix + path,
                undo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.move(path, ind, indOld);
                    item.history.enabled = true;
                },
                redo: function () {
                    var item = self._getItemFn();
                    if (!item) return;

                    item.history.enabled = false;
                    item.move(path, indOld, ind);
                    item.history.enabled = true;
                }
            };

            self.emit('record', 'add', data);
        }));
    };


    public destroy() {
        this._events2.forEach(function (evt) {
            evt.unbind();
        });
    
        this._events2.length = 0;
        this.item = null;
    };




}