import { Observer } from '../../lib';
import { AjaxRequest, Ajax } from '../utility';
import { Config } from '../global';
import {getJsonConfig,upLoadJsonConfig} from "../../tools/ossfile";
import {UUid} from '../utility/uuid'

export class AssetsRename {

    public constructor() {

        var changeName = async (assetId: string, assetName: string)=> {
            var assetJsonStr = await getJsonConfig(Config.projectID,"assets");
            var assetFile=JSON.parse(assetJsonStr);
            assetFile.assets[assetId].name = assetName;
            if (assetFile.assets[assetId].file !== null &&assetFile.assets[assetId].file !== undefined)
            {
                var postfix = assetFile.assets[assetId].file.filename
                    .split(".")
                    .pop();
                if (assetName.endsWith(postfix)) {
                    assetFile.assets[assetId].file.filename = assetName;
                } else {
                    assetFile.assets[assetId].file.filename =
                    assetName + "." + postfix;
                }

                assetFile.assets[assetId].modifiedAt = UUid.createdAtTime();
            }
            upLoadJsonConfig(JSON.stringify(assetFile),Config.projectID,"assets");
            let asset = editor.call('assets:get',assetId);
            // console.log(asset);
            if(asset) {
                asset.set('name', assetName);
            }
        }

        editor.method('assets:rename', function (asset: Observer, newName: string) {
            var oldName = asset.get('name');
            var id = asset.get('id');
            editor.call('history:add', {
                name: 'asset rename',
                undo: function () {
                    if (editor.call('assets:get', id)) {
                        changeName(id, oldName);
                    }
                },
                redo: function () {
                    if (editor.call('assets:get', id)) {
                        changeName(id, newName);
                    }
                }
            });

            changeName(id, newName);
        });


    }

}