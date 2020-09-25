import { VeryEngine } from "../../engine";
import { Button, Tooltip } from "../../ui";

export class ToolbarEditorSettings {


    public constructor() {

        var toolbar = VeryEngine.toolbar;

        // settings button
        var button = new Button('&#57652;');
        button.class!.add('pc-icon', 'editor-settings', 'bottom');
        toolbar.append(button);

        button.on('click', function () {
            // TODO:设置按钮按下
            // editor.call('selector:set', 'editorSettings', [editor.call('settings:projectUser')]);
        });

        editor.on('attributes:clear', function () {
            button.class!.remove('active');
        });

        editor.on('attributes:inspect[editorSettings]', function () {
            editor.call('attributes.rootPanel').collapsed = false;

            button.class!.add('active');
        });

        editor.on('viewport:expand', function (state: boolean) {
            button.disabled = state;
        });

        Tooltip.attach({
            target: button.element!,
            text: '设置',
            align: 'left',
            root: editor.call('layout.root')
        });
    }
}