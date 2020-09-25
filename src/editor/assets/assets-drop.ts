export class AssetsDrop {

    public constructor() {

        var assetsPanel = editor.call('layout.assets');

        var dropRef = editor.call('drop:target', {
            ref: assetsPanel.element,
            type: 'files',
            drop: function (type: string, data: any) {
                if (type !== 'files')
                    return;
                editor.call('assets:upload:files', data);
            }
        });

        dropRef.element.classList.add('assets-drop-area');
    }

}