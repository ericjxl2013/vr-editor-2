import { ObserverList, Observer } from "../../lib";

export class Assets {

    public constructor() {

        // var uniqueIdToItemId: any = {};

        // assets资源排序：folder资源排列在最前面，按文件夹名字排列；其他资源按name进行后续排序;
        var assets = new ObserverList({
            id: 'id',
            sorted: function (a: Observer, b: Observer): number {
                let a1: boolean = a.get('type') === 'folder';
                let b1: boolean = b.get('type') === 'folder';

                if (a1 !== b1) {
                    if (a1 && !b1) return -1; else return 1;
                }

                let na: string = a.get('name').toLowerCase();
                let nb: string = b.get('name').toLowerCase();

                if (na === nb) {
                    return 0;
                } else if (na > nb) {
                    return 1;
                } else {
                    return -1;
                }
                // return a.get('name').toLowerCase().localeCompare(b.get('name').toLowerCase(), 'en');
            }
        });

        // return assets ObserverList
        editor.method('assets:raw', function () {
            return assets;
        });

        // allow adding assets
        editor.method('assets:add', function (asset: Observer) {
            // uniqueIdToItemId[asset.get('uniqueId')] = asset.get('id');

            var pos = assets.add(asset);

            if (pos === null)
                return;

            asset.on('name:set', function (name: string, nameOld: string) {
                name = name.toLowerCase();
                nameOld = nameOld.toLowerCase();

                var ind = assets.data.indexOf(asset);
                var pos = assets.positionNextClosest(asset, function (a: Observer, b: Observer) {
                    let a1: boolean = a.get('type') === 'folder';
                    let b1: boolean = b.get('type') === 'folder';

                    if (a1 !== b1) {
                        if (a1 && !b1) return -1; else return 1;
                    }

                    let na: string = a.get('name').toLowerCase();
                    let nb: string = b.get('name').toLowerCase();

                    if (na === nb) {
                        return 0;
                    } else if (na > nb) {
                        return 1;
                    } else {
                        return -1;
                    }
                    // return a.get('name').toLowerCase().localeCompare(b.get('name').toLowerCase(), 'en');
                });

                if (pos === -1 && (ind + 1) == assets.data.length)
                    return;

                if (ind !== -1 && (ind + 1 === pos) || (ind === pos))
                    return;

                if (ind < pos)
                    pos--;

                assets.move(asset, pos);
                editor.emit('assets:move', asset, pos);
            });

            // publish added asset
            editor.emit('assets:add[' + asset.get('id') + ']', asset, pos);
            editor.emit('assets:add', asset, pos);
        });

        // allow removing assets
        editor.method('assets:remove', function (asset: Observer) {
            assets.remove(asset);
        });

        // remove all assets
        editor.method('assets:clear', function () {
            assets.clear();
            editor.emit('assets:clear');

            // uniqueIdToItemId = {};
        });

        // get asset by id
        editor.method('assets:get', function (id: string) {
            return assets.get(id);
        });

        // get asset by unique id
        // editor.method('assets:getUnique', function (uniqueId: string) {
        //     var id = uniqueIdToItemId[uniqueId];
        //     return id ? assets.get(id) : null;
        // });

        // find assets by function
        editor.method('assets:find', function (fn: Function) {
            return assets.find(fn);
        });

        // find one asset by function
        editor.method('assets:findOne', function (fn: Function) {
            return assets.findOne(fn);
        });

        editor.method('assets:map', function (fn: Function) {
            assets.map(fn);
        });

        editor.method('assets:list', function () {
            return assets.array();
        });

        // publish remove asset
        assets.on('remove', function (asset: Observer) {
            asset.destroy();
            editor.emit('assets:remove', asset);
            editor.emit('assets:remove[' + asset.get('id') + ']');

            // delete uniqueIdToItemId[asset.get('uniqueId')];
        });


    }
}