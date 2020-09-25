import { Observer } from '../../lib';

export class AssetsSync {

    public constructor() {

        editor.method('initAssets', (assets_data: any) => {
            if(assets_data.assets) {
                onLoad(assets_data.assets);
                editor.call('material:preview:assemble', assets_data);
                editor.call('material:preview:start');
            }
                
        });

        // Asseting, uniqueId为assets索引id
        editor.method('loadAsset', function (asset_data: any, callback: any) {

            var assetData = asset_data;

            // if (assetData.file) {
            //     // 生成资源所在url，这里并没有开始加载资源
            //     assetData.file.url = getFileUrl(assetData.id, assetData.revision, assetData.file.filename);

            //     if (assetData.file.variants) {
            //         for (var key in assetData.file.variants) {
            //             assetData.file.variants[key].url = getFileUrl(assetData.id, assetData.revision, assetData.file.variants[key].filename);
            //         }
            //     }
            // }

            var asset = new Observer(assetData);
            editor.call('assets:add', asset);
            // console.log('load: ' + asset.get('name'));

            if (callback)
                callback(asset);
        });

        // 加载assets数据，data为assets数据
        var onLoad = function (data: any) {
            editor.call('assets:progress', 0.5);

            var count = 0;
            let assetsLength: number = Object.getOwnPropertyNames(data).length;
            // 加载Asset资源
            var load = function (asset_data: any) {
                editor.call('loadAsset', asset_data, function () {
                    count++;
                    editor.call('assets:progress', (count / assetsLength) * 0.5 + 0.5);
                    if (count >= assetsLength) {
                        editor.call('assets:progress', 1);
                        editor.emit('assets:load');
                    }
                });
            };

            for (let key in data) {
                load(data[key]);
            }

        };



        var onAssetSelect = function (asset: Observer) {
            editor.call('selector:set', 'asset', [asset]);

            // navigate to folder too
            var path = asset.get('path');
            if (path.length) {
                editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
            } else {
                editor.call('assets:panel:currentFolder', null);
            }
        };

        // create asset
        editor.method('assets:create', function (data: any, fn: any, noSelect: boolean) {
            var evtAssetAdd: any;

            if (!noSelect) {
                editor.once('selector:change', function () {
                    if (evtAssetAdd) {
                        evtAssetAdd.unbind();
                        evtAssetAdd = null;
                    }
                });
            }

            editor.call('assets:uploadFile', data, function (err: Error, res: any) {
                if (err) {
                    editor.call('status:error', err);

                    // TODO
                    // disk allowance error

                    if (fn) fn(err);

                    return;
                }

                if (!noSelect) {
                    var asset = editor.call('assets:get', res.id);
                    if (asset) {
                        onAssetSelect(asset);
                    } else {
                        evtAssetAdd = editor.once('assets:add[' + res.id + ']', onAssetSelect);
                    }
                }

                if (fn) fn(err, res.id);
            });
        });




    }
}