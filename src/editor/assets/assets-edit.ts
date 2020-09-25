import { Observer } from "../../lib";

export class AssetsEdit {

    public constructor() {

        var types: any = {
            'table': 1,
            'html': 1,
            'json': 1,
            'script': 1,
            'shader': 1,
            'text': 1
        };

        editor.method('assets:edit', function (asset: Observer) {
            if (asset.get('type') === 'script' && editor.call('settings:project').get('useLegacyScripts')) {
                window.open('/editor/code/' + 'config.project.id' + '/' + asset.get('filename'));
            } else {
                if (!editor.call('settings:project').get('useLegacyScripts')) {
                    editor.call('picker:codeeditor', asset);
                } else {
                    window.open('/editor/asset/' + asset.get('id'), asset.get('id'))!.focus();
                }
            }
        });

        var dblClick = function (key: string, asset: Observer) {
            var gridItem = editor.call('assets:panel:get', asset.get(key));
            if (!gridItem)
                return;

            gridItem.element.addEventListener('dblclick', function (evt: MouseEvent) {
                editor.call('assets:edit', asset);
            }, false);
        };

        editor.on('assets:add', function (asset: Observer) {
            if (!types[asset.get('type')])
                return;

            dblClick('id', asset);
        });

        editor.on('sourcefiles:add', function (file: any) {
            dblClick('filename', file);
        });

    }

}