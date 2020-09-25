import { Observer } from "../../lib";

export class AssetsDuplicate {

    public constructor() {

        // TODO: 什么类型的可以被复制
        editor.method('assets:duplicate', function (asset: Observer) {
            if (asset.get('type') !== 'material' && asset.get('type') !== 'sprite') return;

            var path = asset.get('path');
            var parent = path.length ? path[path.length - 1] : null;

            var raw = {
                // only materials can be duplicated at the moment
                type: asset.get('type'),
                name: asset.get('name') + ' Copy',
                tags: asset.get('tags'),
                source: false,
                data: asset.get('data'),
                preload: asset.get('preload'),
                parent: parent ? editor.call('assets:get', parent) : null,
                scope: {
                    type: 'project',
                    id: 'config.project.id'
                }
            };

            editor.call('assets:create', raw);
        });

    }

}