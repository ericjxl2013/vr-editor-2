import { VeryEngine } from "../../engine";
import { Button, Tooltip } from "../../ui";

export class ToolbarHistory {

    public constructor() {
        var root = VeryEngine.root;
        var toolbar = VeryEngine.toolbar;

        // undo
        var buttonUndo = new Button('&#57620;');
        // buttonUndo.hidden = !editor.call('permissions:write');
        buttonUndo.class!.add('pc-icon');
        buttonUndo.enabled = editor.call('history:canUndo');
        toolbar.append(buttonUndo);

        editor.on('history:canUndo', function (state:boolean) {
            buttonUndo.enabled = state;
            if (state) {
                tooltipUndo.class!.remove('innactive');
            } else {
                tooltipUndo.class!.add('innactive');
            }
        });
        buttonUndo.on('click', function () {
            editor.call('history:undo');
        });

        var tooltipUndo = Tooltip.attach({
            target: buttonUndo.element!,
            text: '撤销',
            align: 'left',
            root: root
        });
        if (!editor.call('history:canUndo'))
            tooltipUndo.class!.add('innactive');


        // redo
        var buttonRedo = new Button('&#57621;');
        // buttonRedo.hidden = !editor.call('permissions:write');
        buttonRedo.class!.add('pc-icon');
        buttonRedo.enabled = editor.call('history:canRedo');
        toolbar.append(buttonRedo);

        editor.on('history:canRedo', function (state: boolean) {
            buttonRedo.enabled = state;
            if (state) {
                tooltipRedo.class!.remove('innactive');
            } else {
                tooltipRedo.class!.add('innactive');
            }
        });
        buttonRedo.on('click', function () {
            editor.call('history:redo');
        });

        var tooltipRedo = Tooltip.attach({
            target: buttonRedo.element!,
            text: '重做',
            align: 'left',
            root: root
        });
        if (!editor.call('history:canUndo'))
            tooltipRedo.class!.add('innactive');

        editor.on('permissions:writeState', function (state: boolean) {
            buttonUndo.hidden = buttonRedo.hidden = !state;
        });
    }


}