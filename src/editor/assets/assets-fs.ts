import { Observer } from '../../lib';
import { Config } from '../global';
import {UUid} from '../utility/uuid'

export class AssetsFs {

    public constructor() {

        var getIds = function (assets: Observer[]) {
            if (!(assets instanceof Array))
                assets = [assets];

            var ids = [];
            for (var i = 0; i < assets.length; i++)
                ids.push(assets[i].get('id'));

            return ids;
        };

        editor.method('assets:fs:delete', function (assets: Observer[]) {
            editor.call('realtime:send', 'fs', {
                op: 'delete',
                ids: getIds(assets)
            });
        });

        editor.method('assets:fs:move', async (assets: Observer[], assetTo: Observer)=> {
            console.warn('assets:fs:move');
            console.warn(assets);
            console.warn(assetTo);
            let ids = getIds(assets);
            let to = assetTo ? assetTo.get('id') : '';
            editor.call('realtime:send', 'fs', {
                op: 'move',
                ids: ids,
                to: to
            });

            var move=ids.join(',')
            var froms = move.split(",");
            var assetJsonStr = await ossfile.getJsonConfig(Config.projectID,"assets");
            var assetData :any={};
            var assetFile=JSON.parse(assetJsonStr);
            for (var i = 0; i < froms.length; i++) {
                var originItem = assetFile.assets[froms[i]];
                var originPath =
                    !originItem.path || originItem.path.length === 0
                        ? "root"
                        : originItem.path[originItem.path.length - 1];
                if (to === "") {
                    assetFile.assets[froms[i]].path = [];
                } else {
                    assetFile.assets[froms[i]].path = assetFile.assets[to].path.slice(0);
                    assetFile.assets[froms[i]].path.push(to);
                }
                assetData[froms[i]] = assetFile.assets[froms[i]].path;
                assetFile.assets[froms[i]].modifiedAt = UUid.createdAtTime();
    
                // 如果有子文件夹
                var keys = Object.keys(assetFile.assets);
                for (var j = 0; j < keys.length; j++) {
                    if (
                        keys[j] !== froms[i] &&
                        keys[j] !== to &&
                        assetFile.assets[keys[j]].path !== undefined &&
                        assetFile.assets[keys[j]].path !== null
                    ) {
                        var index = assetFile.assets[keys[j]].path.indexOf(
                            froms[i]
                        );
                        // 有文件夹
                        if (index !== -1) {
                            var lastPath = assetFile.assets[keys[j]].path.slice(
                                index
                            );
                            if (to === "") {
                                assetFile.assets[keys[j]].path = lastPath;
                            } else {
                                assetFile.assets[keys[j]].path = assetFile.assets[
                                    froms[i]
                                ].path.concat(lastPath);
                            }
                            assetFile.assets[keys[j]].modifiedAt = UUid.createdAtTime();
                            assetData[keys[j]] = assetFile.assets[keys[j]].path;
                        }
                    }
                }

    
                // babylon或texture改变位置后，assets数据修改
                var item = assetFile.assets[froms[i]];
                var closestPath =
                    !item.path || item.path.length === 0
                        ? "root"
                        : item.path[item.path.length - 1];
                if (item.type && item.type === "model") {
                    var ext1 = item.name.split(".");
                    var ext = ext1[ext1.length - 1].toLowerCase();
                    if (ext === "babylon") {
                        // 先删除
                        if (!assetFile.babylon) {
                            assetFile["babylon"] = { path: {} };
                        }
                        if (!assetFile.babylon.path) {
                            assetFile.babylon["path"] = {};
                        }
                        if (assetFile.babylon.path[originPath]) {
                            delete assetFile.babylon.path[originPath][froms[i]];
                        }
                        // 再修改
                        if (!assetFile.babylon.path[closestPath]) {
                            assetFile.babylon.path[closestPath] = {};
                        }
                        assetFile.babylon.path[closestPath][froms[i]] = true;
                    }
                }
            }
            ossfile.upLoadJsonConfig(JSON.stringify(assetFile),Config.projectID,"assets");
            let assetKeys = Object.keys(assetData);
            for (let i = 0, len = assetKeys.length; i < len; i++) {
                let asset = editor.call('assets:get', assetKeys[i]);
                console.warn(asset);
                if (asset) {
                    asset.set('path', assetData[assetKeys[i]]);
                }
            }
        });

        editor.method('assets:fs:duplicate', function (assets: Observer[]) {
            editor.call('realtime:send', 'fs', {
                op: 'duplicate',
                ids: getIds(assets)
            });
        });
    }

}