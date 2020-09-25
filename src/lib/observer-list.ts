import { Events } from './events';
import { Observer } from './observer';

export class ObserverList extends Events {

    public data: Observer[];

    public id: string;
    public sorted: Nullable<Function> = null;
    private _indexed: { [key: string]: Observer };

    public type: string;


    public get length(): number {
        return this.data.length;
    }


    public constructor(options?: any) {
        super();

        options = options || {};

        this.type = '';
        this.data = [];
        this._indexed = {};
        this.sorted = options.sorted || null;
        this.id = options.id || '';
    }


    public get(index: number | string): Nullable<Observer> {
        if (this.id && typeof index === 'string') {
            return this._indexed[index] || null;
        } else {
            return typeof index === 'number' ? this.data[index] || null : null;
        }
    }

    public set(index: number | string, val: Observer): void {
        if (this.id) {
            this._indexed[index] = val;
        } else {
            if (typeof index === 'number')
                this.data[index] = val;
        }
    }

    public indexof(item: Observer): number {
        // if (this.id) {
        //     let index: string = item.get(this.id);
        //     return (this._indexed[index] && index) || -1;
        // } else {
        //     return this.data.indexOf(item);
        // }
        return this.data.indexOf(item);
    }

    public position(b: any, fn: Function): number {
        var l = this.data;
        var min = 0;
        var max = l.length - 1;
        var cur;
        var a, i;
        fn = fn || this.sorted;

        while (min <= max) {
            cur = Math.floor((min + max) / 2);
            a = l[cur];

            i = fn(a, b);

            if (i === 1) {
                max = cur - 1;
            } else if (i === -1) {
                min = cur + 1;
            } else {
                return cur;
            }
        }

        return -1;
    };

    // 2分法求最近距离，对文件显示进行排序
    public positionNextClosest(b: any, fn: any): number {
        let l = this.data;
        let min = 0;
        let max = l.length - 1;
        let cur: number = 0;
        let a, i;
        fn = fn || this.sorted;

        if (l.length === 0) return -1;

        // 名字与第一个元素相同的情况
        if (fn(l[0], b) === 0) return 0;

        while (min <= max) {
            cur = Math.floor((min + max) / 2);
            a = l[cur];

            i = fn(a, b);

            if (i === 1) {
                max = cur - 1;
            } else if (i === -1) {
                min = cur + 1;
            } else {
                return cur;
            }
        }

        if (fn(a, b) === 1) return cur;

        if (cur! + 1 === l.length) return -1;

        return cur! + 1;
    };


    public has(item: Observer): boolean {
        if (this.id) {
            var index = item.get(this.id);
            return !!this._indexed[index];
        } else {
            return this.data.indexOf(item) !== -1;
        }
    };

    public add(item: Observer): number {
        if (this.has(item)) return -1;

        // var index = this.data.length;
        if (this.id) {
            var index = item.get(this.id);
            this._indexed[index] = item;
        } else {
            this._indexed[this.data.length] = item;
        }

        var pos = 0;

        if (this.sorted) {
            pos = this.positionNextClosest(item, this.sorted);
            // console.error('name: ' + item.get('name') + ' ,,, pos: ' + pos.toString());
            if (pos !== -1) {
                this.data.splice(pos, 0, item);
            } else {
                this.data.push(item);
            }
        } else {
            this.data.push(item);
            pos = this.data.length - 1;
        }

        // 回调函数
        this.emit('add', item);

        return pos;
    };

    public move(item: Observer, pos: number): void {
        let ind = this.data.indexOf(item);
        this.data.splice(ind, 1);
        if (pos === -1) {
            this.data.push(item);
        } else {
            this.data.splice(pos, 0, item);
        }
    };


    public remove(item: Observer): void {
        if (!this.has(item)) return;

        let ind = this.data.indexOf(item);

        if (this.id) {
            let index = item.get(this.id);
            delete this._indexed[index];
        }

        this.data.splice(ind, 1);

        this.emit('remove', item, ind);
    };

    public removeByKey(index: number): void {
        if (this.id) {
            let item = this._indexed[index];

            if (!item) return;

            let ind = this.data.indexOf(item);
            this.data.splice(ind, 1);

            delete this._indexed[index];

            this.emit('remove', item, ind);
        } else {
            if (this.data.length < index) return;

            let item = this.data[index];

            this.data.splice(index, 1);

            this.emit('remove', item, index);
        }
    };

    public removeBy(fn: Function) {
        let i = this.data.length;
        while (i--) {
            if (!fn(this.data[i])) continue;

            if (this.id) {
                delete this._indexed[this.data[i].get(this.id)];
            }
            this.data.splice(i, 1);

            this.emit('remove', this.data[i], i);
        }
    };

    public clear(): void {
        let items = this.data.slice(0);

        this.data = [];
        this._indexed = {};

        let i = items.length;
        while (i--) {
            this.emit('remove', items[i], i);
        }
    };

    public forEach(fn: Function) {
        for (let i = 0; i < this.data.length; i++) {
            fn(this.data[i], (this.id && this.data[i].get(this.id)) || i);
        }
    };

    public find(fn: Function) {
        let items = [];
        for (let i = 0; i < this.data.length; i++) {
            if (!fn(this.data[i])) continue;

            let index = i;
            if (this.id) index = this.data[i].get(this.id);

            items.push([index, this.data[i]]);
        }
        return items;
    };

    public findOne(fn: Function) {
        for (let i = 0; i < this.data.length; i++) {
            if (!fn(this.data[i])) continue;

            let index = i;
            if (this.id) index = this.data[i].get(this.id);

            return [index, this.data[i]];
        }
        return null;
    };

    public map(fn: any) {
        return this.data.map(fn);
    };

    public sort(fn: any) {
        this.data.sort(fn);
    };

    public array(): Observer[] {
        return this.data.slice(0);
    };

    // public json() {
    //     let items = this.array();
    //     for (let i = 0; i < items.length; i++) {
    //         if (items[i] instanceof Observer) {
    //             items[i] = items[i].json();
    //         }
    //     }
    //     return items;
    // };

}