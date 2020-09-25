import { VeryEngine } from "../../engine";
import { Button, Tooltip } from "../../ui";

export class ToolbarPublish {
    public constructor() {

        var toolbar = VeryEngine.toolbar;

        var button = new Button('&#57911;');
        button.class!.add('pc-icon', 'publish-download');
        toolbar.append(button);

        button.on('click', function () {
            editor.call('picker:publish');
        });

        editor.on('picker:publish:open', function () {
            button.class!.add('active');
        });

        editor.on('picker:publish:close', function () {
            button.class!.remove('active');
        });

        Tooltip.attach({
            target: button.element!,
            text: '发布',
            align: 'left',
            root: editor.call('layout.root')
        });
    }
}