import { Events } from './events';
import { GameObject } from '../editor';
import { ObserverSync } from './observer-sync';

//  TODO： 当前暂不考虑赋值会超出现有类型的情况，比如原来是个number，赋值为了array；
export class Observer extends Events {

    public get className(): string {
        return 'Observer';
    }

    public origin: any;

    public entity: Nullable<GameObject> = null;


    private SEPARATOR: string = '.';


    private _destroyed: boolean;
    public _path: string;
    // TODO
    public _keys: string[]; // 记录对象的key、value值；


    public _data: { [key: string]: any }; // 采用此对象，完整记录所有值，包含新建的数组；
    public _data2: { [key: string]: any }; // 采用此对象，完整记录所有值，不包含新建数组；
    public _dataType: { [key: string]: boolean } = {}; // 暂时只判断是否为array分拆而成的类型；
    public _dataType2: { [key: string]: boolean } = {}; // 暂时只判断是否为array分拆而成的类型；




    public _parent: any; // 当前父物体
    // public _parentPath: string;
    private _parentField: any;
    private _parentKey: any;

    private _silent: boolean;

    public history!: History;
    public sync: Nullable<ObserverSync> = null;
    // private sync!: History;

    public node: any = null;

    public reparenting: boolean = false;
    private _pathsWithDuplicates: { [key: string]: boolean } = {};

    // entity, assets, components: script, 一般components, selector, history
    public constructor(data: any, options?: any) {
        super();

        this.origin = data;
        options = options || {};





        this._destroyed = false;
        this._path = '';
        this._keys = [];
        this._data = {};

        this._data2 = {};

        // array paths where duplicate entries are allowed - normally
        // we check if an array already has a value before inserting it
        // but if the array path is in here we'll allow it
        if (options.pathsWithDuplicates) {
            this._pathsWithDuplicates = {};
            for (let i = 0; i < options.pathsWithDuplicates.length; i++) {
                this._pathsWithDuplicates[options.pathsWithDuplicates[i]] = true;
            }
        }

        this.patchData(data);

        // for (let ke in this._data) {
        //   debug.log('key: ' + ke);
        //   debug.log(this._data[ke]);
        // }

        // this._parent = options.parent || null;
        // this._parentPath = options.parentPath || '';
        // this._parentField = options.parentField || null;
        // this._parentKey = options.parentKey || null;

        this._silent = false;
    }

    public patchData(data: any): void {
        if (typeof data !== 'object') {
            debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
            return;
        }

        for (let key in data) {
            if (typeof data[key] === 'object') {
                // 对象属性
                // debug.log('对象属性：' + key);
                // debug.log(data[key]);
                // this._prepare(this, key, data[key]);
                this.parserObject(key, key, data[key]);
            } else {
                // 一般属性
                // debug.log('一般属性：' + key);
                // debug.log(data[key]);
                this.set(key, data[key]);
                this._dataType[key] = false;
                this._dataType2[key] = false;
                // this.set(key, data[key]);
            }
        }
    }

    // TODO: 若设置值为object，需要再parse
    public set(path: string, value: any): void {
        let oldValue = this._data[path];
        // console.warn(path);
        // console.warn(value);
        let keys = path.split('.');
        let parentID = '';
        for (let i = 0; i < keys.length - 1; i++) {
            if (i === 0) {
                parentID = keys[i];
            } else {
                parentID += this.SEPARATOR + keys[i];
            }
        }
        // 数组处理，其他形式暂不考虑
        if (keys.length > 1 && this._dataType[path]) {
            let index = parseInt(keys[keys.length - 1]);
            this._data[path] = value;
            // 上一级数组修改
            this._data[parentID][index] = value;
        } else {
            // if (value instanceof Array) {
            //     value = value.slice(0);
            // }
            this._data[path] = value;
            this.updateChildData(path, value);
            this._data2[path] = value;
        }
        // console.warn(this._data);

        // if (parentID && this._dataType2[parentID] && this.isNumber(keys[keys.length - 1])) {
        //     this._data2[parentID][parseInt(keys[keys.length - 1])] = value;
        // }

        this.emit(path + ':set', value, oldValue);
        this.emit('*:set', path, value, oldValue);
    }

    private isNumber(str: string): boolean {
        var n = Number(str);
        return !isNaN(n) ? true : false;
    }

    private updateChildData(path: string, value: any): void {
        if (value instanceof Array) {
            for (let key in this._data) {
                if (key.startsWith(path + this.SEPARATOR)) {
                    delete this._data[key];
                    delete this._dataType[key];
                }
            }
            let newPath = '';
            for (let i = 0; i < value.length; i++) {
                newPath = path + this.SEPARATOR + i.toString();
                this._data[newPath] = value[i];
                this._dataType[newPath] = true;
            }
        }
    }

    // TODO
    public unset(path: string, value: any): boolean {
        // console.log(path + ' : ' + value);
        if (!this.has(path)) {
            return false;
        }
        let oldValue = this._data[path];
        delete this._data[path];
        delete this._dataType[path];

        delete this._data2[path];
        delete this._dataType2[path];

        this.emit(path + ':set', value, oldValue);
        this.emit('*:set', path, value, oldValue);

        return true;
    }

    // 在数组的某个指定位置增加值
    public insert(path: string, value: any, ind: number | undefined): boolean {
        // console.error(path + ':insert-value: ' + value);
        // console.warn(this._data);
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        let arr = this._data[path];
        if (value instanceof Array) {
            value = value.slice(0);
        }
        // if (!this._pathsWithDuplicates || !this._pathsWithDuplicates[path]) {
        //     if (arr.indexOf(value) !== -1) {
        //         return false;
        //     }
        // }
        if (ind === undefined) {
            arr.push(value);
            ind = arr.length - 1;
        } else {
            arr.splice(ind, 0, value);
        }
        this.updateChildData(path, arr);
        // TODO
        // let arr2 = this._data2[path];
        // console.error(arr2);
        // if (arr2) {
        //     // if (!this._pathsWithDuplicates || !this._pathsWithDuplicates[path]) {
        //     //     if (arr2.indexOf(value) !== -1) {
        //     //         return false;
        //     //     }
        //     // }
        //     if (ind === undefined) {
        //         arr2.push(value);
        //     } else {
        //         arr2.splice(ind, 0, value);
        //     }
        // }
        // console.error(arr2);
        
        // console.warn(this._data);
        this.emit(path + ':insert', value, ind);
        this.emit('*:insert', path, value, ind);

        return true;
    }

    // 删除数组指定某个序号的值
    public remove(path: string, ind: number): boolean {
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        let arr = this._data[path];
        if (arr.length < ind) return false;
        let value = arr[ind];
        arr.splice(ind, 1);
        this.updateChildData(path, arr);

        // TODO
        // let arr2 = this._data2[path];
        // if (arr2 && arr2.length >= ind) {
        //     arr2.splice(ind, 1);
        // }

        this.emit(path + ':remove', value, ind);
        this.emit('*:remove', path, value, ind);
        return true;
    }

    // 删除数组中的某个value值
    public removeValue(path: string, value: any): boolean {
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        let arr = this._data[path];
        let ind = arr.indexOf(value);
        if (ind === -1) {
            return false;
        }
        let oldValue = arr[ind];
        arr.splice(ind, 1);
        this.updateChildData(path, arr);

        // TODO
        // let arr2 = this._data2[path];
        // if (arr2 && ind >= 0) {
        //     arr2.splice(ind, 1);
        // }

        // console.warn('删除');
        // console.warn(this._data);
        // console.warn(this._data2);

        this.emit(path + ':remove', oldValue, ind);
        this.emit('*:remove', path, oldValue, ind);

        return true;
    }


    public move(path: string, indOld: number, indNew: number): boolean {
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }

        let indNew2 = indNew;

        let arr = this._data[path];
        if (arr.length < indOld || arr.length < indNew || indOld === indNew) return false;
        let oldValue = arr[indOld]
        arr.splice(indOld, 1);
        if (indNew === -1) indNew = arr.length;
        arr.splice(indNew, 0, oldValue);
        this.updateChildData(path, arr);

        // TODO
        // let arr2 = this._data2[path];
        // if (arr2) {
        //     if (arr2.length < indOld || arr2.length < indNew2 || indOld === indNew2) {

        //     } else {
        //         let oldValue2 = arr2[indOld]
        //         arr2.splice(indOld, 1);
        //         if (indNew2 === -1) indNew2 = arr2.length;
        //         arr2.splice(indNew2, 0, oldValue2);
        //     }
        // }

        this.emit(path + ':move', oldValue, indNew, indOld);
        this.emit('*:move', path, oldValue, indNew, indOld);
        return true;
    }

    public parserObject(prefix: string, key: string, value: any): void {
        // 先保存一份
        this.set(prefix, value);
        this._dataType[prefix] = false;

        let path: string;
        let type: string = typeof value;

        if (type === 'object' && value instanceof Array) {
            this._dataType2[prefix] = true;
            for (let i = 0; i < value.length; i++) {
                path = prefix + this.SEPARATOR + i.toString();
                this.set(path, value[i]);
                this._dataType[path] = true;
                // 数组元素还是对象的情况暂时不处理
            }
        } else if (type === 'object' && value instanceof Object) {

            for (let key2 in value) {
                if (typeof value[key2] === 'object') {
                    // 递归解析
                    this.parserObject(prefix + this.SEPARATOR + key2, key2, value[key2]);
                } else {
                    path = prefix + this.SEPARATOR + key2;
                    this.set(path, value[key2]);
                    this._dataType[path] = false;
                    this._dataType2[prefix] = false;

                }
            }
        } else {
            // 目前看，null和undefined会经过这里
            // debug.warn(this.className + '.parserObject, 为止数据类型:' + value);
        }
    }


    public has(path: string): boolean {
        return path in this._data;
    }

    public get(path: string): any {
        if (path in this._data) {
            return this._data[path];
        } else {
            return null;
        }
    }

    public propagate(evt: any) {
        let that = this;
        return function (path: string, arg1: any, arg2: any, arg3: any) {
            if (!that._parent) return;

            let key = that._parentKey;
            if (!key && that._parentField instanceof Array) {
                key = that._parentField.indexOf(that);

                if (key === -1) return;
            }

            // path = that._parentPath + '.' + key + '.' + path;

            let state;
            if (that._silent) state = that._parent.silence();

            that._parent.emit(path + ':' + evt, arg1, arg2, arg3);
            that._parent.emit('*:' + evt, path, arg1, arg2, arg3);

            if (that._silent) that._parent.silenceRestore(state);
        };
    }

    // key => object
    private _prepare(target: Observer, key: string, value: any, silent?: boolean, remote?: any) {
        let self = this;
        let state: boolean[];
        let path = (target._path ? target._path + '.' : '') + key;
        let type = typeof value;

        target._keys.push(key);

        if (type === 'object' && value instanceof Array) {
            target._data[key] = value.slice(0); // 复制一份新的数组

            // 子一层数据
            for (let i = 0; i < target._data[key].length; i++) {
                if (typeof target._data[key][i] === 'object' && target._data[key][i] !== null) {
                    if (target._data[key][i] instanceof Array) {
                        target._data[key][i].slice(0);
                    } else {
                        // observer? 这里不需要递归吗？
                        target._data[key][i] = new Observer(
                            target._data[key][i],
                            {
                                parent: this,
                                parentPath: path,
                                parentField: target._data[key],
                                parentKey: null
                            }
                        );
                    }
                } else {
                    state = this.silence();
                    this.emit(path + '.' + i + ':set', target._data[key][i], null, remote);
                    this.emit('*:set', path + '.' + i, target._data[key][i], null, remote);
                    this.silenceRestore(state);
                }
            }

            if (silent) state = this.silence();

            this.emit(path + ':set', target._data[key], null, remote);
            this.emit('*:set', path, target._data[key], null, remote);

            if (silent) this.silenceRestore(state!);
        } else if (type === 'object' && value instanceof Object) {
            if (typeof target._data[key] !== 'object') {
                target._data[key] = {
                    _path: path,
                    _keys: [],
                    _data: {}
                };
            }

            for (let i in value) {
                if (typeof value[i] === 'object') {
                    // 递归
                    this._prepare(target._data[key], i, value[i], true, remote);
                } else {
                    state = this.silence();

                    target._data[key]._data[i] = value[i];
                    target._data[key]._keys.push(i);

                    this.emit(path + '.' + i + ':set', value[i], null, remote);
                    this.emit('*:set', path + '.' + i, value[i], null, remote);

                    this.silenceRestore(state);
                }
            }

            if (silent) state = this.silence();

            // passing undefined as valueOld here
            // but we should get the old value to be consistent
            this.emit(path + ':set', value, undefined, remote);
            this.emit('*:set', path, value, undefined, remote);

            if (silent) this.silenceRestore(state!);
        } else {
            if (silent) state = this.silence();

            target._data[key] = value;

            this.emit(path + ':set', value, undefined, remote);
            this.emit('*:set', path, value, undefined, remote);

            if (silent) this.silenceRestore(state!);
        }

        return true;
    }

    public silence(): boolean[] {
        this._silent = true;

        // history hook to prevent array values to be recorded
        let historyState: boolean =
            this.history !== undefined && this.history.enabled !== undefined;
        if (historyState) this.history.enabled = false;

        // sync hook to prevent array values to be recorded as array root already did
        let syncState: boolean = this.sync !== null && this.sync.enabled !== undefined;
        if (this.sync !== null && this.sync.enabled !== undefined)
            this.sync.enabled = false;

        return [historyState, syncState];
    }

    public silenceRestore(state: boolean[]): void {
        this._silent = false;

        if (state[0]) this.history.enabled = true;

        if (state[1] && this.sync !== null && this.sync.enabled !== undefined)
            this.sync!.enabled = true;
    }

    // public json(target?: Observer): Observer {
    //   let obj: { [key: string]: any } = {};
    //   let node = target === undefined ? this : target;
    //   let len, nlen;

    //   if (node instanceof Object && node._keys) {
    //     len = node._keys.length;
    //     for (let i = 0; i < len; i++) {
    //       let key = node._keys[i];
    //       let value = node._data[key];
    //       let type = typeof (value);

    //       if (type === 'object' && (value instanceof Array)) {
    //         obj[key] = value.slice(0);

    //         nlen = obj[key].length;
    //         for (let n = 0; n < nlen; n++) {
    //           if (typeof (obj[key][n]) === 'object')
    //             obj[key][n] = this.json(obj[key][n]);
    //         }
    //       } else if (type === 'object' && (value instanceof Object)) {
    //         obj[key] = this.json(value);
    //       } else {
    //         obj[key] = value;
    //       }
    //     }
    //   } else {
    //     if (node === null) {
    //       return null;
    //     } else if (typeof (node) === 'object' && (node instanceof Array)) {
    //       obj = node.slice(0);

    //       len = obj.length;
    //       for (let n = 0; n < len; n++) {
    //         obj[n] = this.json(obj[n]);
    //       }
    //     } else if (typeof (node) === 'object') {
    //       for (let key in node) {
    //         if (node.hasOwnProperty(key))
    //           obj[key] = node[key];
    //       }
    //     } else {
    //       obj = node;
    //     }
    //   }
    //   return obj;
    // }

    // public forEach(fn: Function, target: Observer, path: string): void {
    //   let node = target || this;
    //   path = path || '';

    //   for (let i = 0; i < node._keys.length; i++) {
    //     let key = node._keys[i];
    //     let value = node._data[key];
    //     let type = (this.schema && this.schema.has(path + key) && this.schema.get(path + key).type.name.toLowerCase()) || typeof (value);

    //     if (type === 'object' && (value instanceof Array)) {
    //       fn(path + key, 'array', value, key);
    //     } else if (type === 'object' && (value instanceof Object)) {
    //       fn(path + key, 'object', value, key);
    //       this.forEach(fn, value, path + key + '.');
    //     } else {
    //       fn(path + key, type, value, key);
    //     }
    //   }
    // };

    public destroy(): void {
        if (this._destroyed) return;
        this._destroyed = true;
        this.emit('destroy');
        this.unbind();
    }
}

export interface History {
    enabled?: boolean;
}
