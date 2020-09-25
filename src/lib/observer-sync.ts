import { Events } from './events';
import { Observer } from './observer';
import { ObserverList } from './observer-list';

export class ObserverSync extends Events {


    public item: Observer;

    private _enabled: boolean = true;
    public get enabled(): boolean {
        return this._enabled;
    }
    public set enabled(value: boolean) {
        this._enabled = value;
    }

    private _prefix: Nullable<string[]>;
    public get prefix(): Nullable<string[]> {
        return this._prefix;
    }
    public set prefix(value: Nullable<string[]>) {
        this._prefix = value || [];
    }

    private _paths: Nullable<string[]>;
    public get paths(): Nullable<string[]> {
        return this._paths;
    }
    public set paths(value: Nullable<string[]>) {
        this._paths = value || null;
    }



    public constructor(args: any) {
        super();

        args = args || {};

        this.item = args.item;
        this._enabled = args.enabled || true;
        this._prefix = args.prefix || [];
        this._paths = args.paths || null;
        // this._sync = args.sync || true;

        this._initialize();
    }

    private _initialize(): void {
        var self = this;
        var item = this.item;

        // // object/array set
        // item.on('*:set', function (path: string, value: any, valueOld: any) {
        //     if (!self._enabled) return;

        //     // if this happens it's a bug
        //     if (item.sync !== self) {
        //         console.error('Garbage Observer Sync still pointing to item', item);
        //     }

        //     // check if path is allowed
        //     if (self._paths) {
        //         var allowedPath = false;
        //         for (var i = 0; i < self._paths.length; i++) {
        //             if (path.indexOf(self._paths[i]) !== -1) {
        //                 allowedPath = true;
        //                 break;
        //             }
        //         }

        //         // path is not allowed
        //         if (!allowedPath)
        //             return;
        //     }

        //     // full path
        //     var p = self._prefix!.concat(path.split('.'));

        //     // need jsonify
        //     if (value instanceof Observer || value instanceof ObserverList)
        //         value = value.json();

        //     // can be array value
        //     var ind = path.lastIndexOf('.');
        //     if (ind !== -1 && (self.get(path.slice(0, ind)) instanceof Array)) {
        //         // array index should be int
        //         p[p.length - 1] = parseInt(p[p.length - 1], 10);

        //         // emit operation: list item set
        //         self.emit('op', {
        //             p: p,
        //             li: value,
        //             ld: valueOld
        //         });
        //     } else {
        //         // emit operation: object item set
        //         var obj = {
        //             p: p,
        //             oi: value
        //         };

        //         if (valueOld !== undefined) {
        //             obj.od = valueOld;
        //         }

        //         self.emit('op', obj);
        //     }
        // });

        // // unset
        // item.on('*:unset', function (path: string, value: any) {
        //     if (!self._enabled) return;

        //     self.emit('op', {
        //         p: self._prefix!.concat(path.split('.')),
        //         od: null
        //     });
        // });

        // // list move
        // item.on('*:move', function (path: string, value: any, ind: string, indOld: string) {
        //     if (!self._enabled) return;
        //     self.emit('op', {
        //         p: self._prefix!.concat(path.split('.')).concat([indOld]),
        //         lm: ind
        //     });
        // });

        // // list remove
        // item.on('*:remove', function (path: string, value: any, ind: string) {
        //     if (!self._enabled) return;

        //     // need jsonify
        //     if (value instanceof Observer || value instanceof ObserverList)
        //         value = value.json();

        //     self.emit('op', {
        //         p: self._prefix!.concat(path.split('.')).concat([ind]),
        //         ld: value
        //     });
        // });

        // // list insert
        // item.on('*:insert', function (path: string, value: any, ind: string) {
        //     if (!self._enabled) return;

        //     // need jsonify
        //     if (value instanceof Observer || value instanceof ObserverList)
        //         value = value.json();

        //     self.emit('op', {
        //         p: self._prefix!.concat(path.split('.')).concat([ind]),
        //         li: value
        //     });
        // });

    }


    // public write(op: any): void {
    //     // disable history if available
    //     var historyReEnable = false;
    //     if (this.item.history && this.item.history.enabled) {
    //         historyReEnable = true;
    //         this.item.history.enabled = false;
    //     }

    //     if (op.hasOwnProperty('oi')) {
    //         // set key value
    //         var path = op.p.slice(this._prefix!.length).join('.');

    //         this._enabled = false;
    //         this.item.set(path, op.oi);
    //         this._enabled = true;


    //     } else if (op.hasOwnProperty('ld') && op.hasOwnProperty('li')) {
    //         // set array value
    //         var path = op.p.slice(this._prefix!.length).join('.');

    //         this._enabled = false;
    //         this.item.set(path, op.li);
    //         this._enabled = true;


    //     } else if (op.hasOwnProperty('ld')) {
    //         // delete item
    //         var path = op.p.slice(this._prefix!.length, -1).join('.');

    //         this._enabled = false;
    //         this.item.remove(path, op.p[op.p.length - 1], false, true);
    //         this._enabled = true;


    //     } else if (op.hasOwnProperty('li')) {
    //         // add item
    //         var path = op.p.slice(this._prefix!.length, -1).join('.');
    //         var ind = op.p[op.p.length - 1];

    //         this._enabled = false;
    //         this.item.insert(path, op.li, ind, false, true);
    //         this._enabled = true;


    //     } else if (op.hasOwnProperty('lm')) {
    //         // item moved
    //         var path = op.p.slice(this._prefix!.length, -1).join('.');
    //         var indOld = op.p[op.p.length - 1];
    //         var ind = op.lm;

    //         this._enabled = false;
    //         this.item.move(path, indOld, ind, false, true);
    //         this._enabled = true;


    //     } else if (op.hasOwnProperty('od')) {
    //         // unset key value
    //         var path = op.p.slice(this._prefix!.length).join('.');
    //         this._enabled = false;
    //         this.item.unset(path, false, true);
    //         this._enabled = true;


    //     } else {
    //         console.log('unknown operation', op);
    //     }

    //     // reenable history
    //     if (historyReEnable)
    //         this.item.history.enabled = true;

    //     this.emit('sync', op);
    // }






}