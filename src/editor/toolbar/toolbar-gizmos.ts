import { Button, Tooltip } from "../../ui";
import { GizmosCenter } from "../gizmos/gizmo-center";

export class ToolbarGizmos {

    public constructor() {

        var root = editor.call('layout.root');
        var toolbar = editor.call('layout.toolbar');

        var activeGizmo: Nullable<Button> = null;
        var gizmoButtons: { [key: string]: Button } = {};

        // create gizmo type buttons
        [{
            icon: '&#57617;',
            tooltip: '移动',
            op: 'translate'
        }, {
            icon: '&#57619;',
            tooltip: '旋转',
            op: 'rotate'
        }, {
            icon: '&#57618;',
            tooltip: '缩放',
            op: 'scale'
        }
            // , {
            //     icon: '&#57666;',
            //     tooltip: 'Resize Element Component',
            //     op: 'resize'
            // }
        ].forEach(function (item, index) {
            var button = new Button(item.icon);
            // button.hidden = !editor.call('permissions:write');
            button.op = item.op;
            button.class!.add('pc-icon');

            gizmoButtons[item.op] = button;

            button.on('click', function () {
                if (activeGizmo!.op === button.op)
                    return;

                activeGizmo!.class!.remove('active');
                activeGizmo!.tooltip!.class!.add('innactive');
                activeGizmo = button;
                activeGizmo!.class!.add('active');
                activeGizmo!.tooltip!.class!.remove('innactive');

                editor.call('gizmo:type', button.op);

                if (button.op === 'translate') {
                    GizmosCenter.setMode(0);
                } else if (button.op === 'rotate') {
                    GizmosCenter.setMode(1);
                } else {
                    GizmosCenter.setMode(2);
                }
            });

            toolbar.append(button);

            button.tooltip = Tooltip.attach({
                target: button.element!,
                text: item.tooltip,
                align: 'left',
                root: root
            });

            if (item.op === 'translate') {
                activeGizmo = button;
                button.class!.add('active');
            } else {
                button.tooltip.class!.add('innactive');
            }
        });


        // coordinate system
        var buttonWorld = new Button('&#57624;');
        // buttonWorld.hidden = !editor.call('permissions:write');
        // buttonWorld.class!.add('pc-icon', 'active');
        buttonWorld.class!.add('pc-icon');
        toolbar.append(buttonWorld);

        buttonWorld.on('click', function () {
            if (buttonWorld.class!.contains('active')) {
                buttonWorld.class!.remove('active');
                tooltipWorld.html = '<span style="color:#fff">局部坐标</span> / 世界坐标';
            } else {
                buttonWorld.class!.add('active');
                tooltipWorld.html = '局部坐标 / <span style="color:#fff">世界坐标</span>';
            }
            editor.emit('gizmo:coordSystem', buttonWorld.class!.contains('active') ? 'world' : 'local');
        });

        var tooltipWorld = Tooltip.attach({
            target: buttonWorld.element!,
            align: 'left',
            root: root
        });
        tooltipWorld.html = '<span style="color:#fff">局部坐标</span> / 世界坐标';
        tooltipWorld.class!.add('innactive');


        // toggle grid snap
        // var buttonSnap = new Button('&#57622;');
        // // buttonSnap.hidden = !editor.call('permissions:write');
        // buttonSnap.class!.add('pc-icon');
        // buttonSnap.on('click', function () {
        //     if (buttonSnap.class!.contains('active')) {
        //         buttonSnap.class!.remove('active');
        //         tooltipSnap.class!.add('innactive');
        //     } else {
        //         buttonSnap.class!.add('active');
        //         tooltipSnap.class!.remove('innactive');
        //     }
        //     editor.call('gizmo:snap', buttonSnap.class!.contains('active'));
        // });
        // toolbar.append(buttonSnap);

        // var tooltipSnap = Tooltip.attach({
        //     target: buttonSnap.element!,
        //     text: 'Snap',
        //     align: 'left',
        //     root: root
        // });
        // tooltipSnap.class!.add('innactive');


        editor.on('permissions:writeState', function (state: boolean) {
            for (var key in gizmoButtons) {
                // gizmoButtons[key].hidden = !state;
            }

            // buttonWorld.hidden = !state;
            // buttonSnap.hidden = !state;
        });


        // focus on entity
        var buttonFocus = new Button('&#57623;');
        buttonFocus.disabled = true;
        buttonFocus.class!.add('pc-icon');
        buttonFocus.on('click', function () {
            editor.call('viewport:focus');
        });
        toolbar.append(buttonFocus);

        editor.on('attributes:clear', function () {
            buttonFocus.disabled = true;
            tooltipFocus.class!.add('innactive');
        });
        editor.on('attributes:inspect[*]', function (type: string) {
            buttonFocus.disabled = type !== 'entity';
            if (type === 'entity') {
                tooltipFocus.class!.remove('innactive');
            } else {
                tooltipFocus.class!.add('innactive');
            }
        });

        var tooltipFocus = Tooltip.attach({
            target: buttonFocus.element!,
            text: '镜头聚焦当前物体 / F键',
            align: 'left',
            root: root
        });
        tooltipFocus.class!.add('innactive');

        editor.call('hotkey:register', 'viewport:focus', {
            key: 'f',
            callback: function () {
                // if (editor.call('picker:isOpen:otherThan', 'curve')) return;
                editor.call('viewport:focus');
            }
        });

    }

}