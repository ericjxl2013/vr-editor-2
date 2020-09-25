import { VeryEngine } from "../../engine";
import { SelectField, Tooltip } from "../../ui";

export class ToolbarCamera {

    public constructor() {

        var viewport = editor.call('layout.viewport');

        // var options: { [key: string]: string } = {
        //     'perspective': '透视相机|perspective',
        //     'orthographic': '正交相机|orthographic',
        //     'left': '左视图|left',
        //     'right': '右视图|right',
        //     'top': '顶视图|top',
        //     'bottom': '底视图|bottom',
        //     'front': '前视图|front',
        //     'back': '后视图|back',
        // };
        var options: { [key: string]: string } = {
            '透视相机': '透视相机|perspective',
            '正交相机': '正交相机|orthographic',
            '左视图': '左视图|left',
            '右视图': '右视图|right',
            '顶视图': '顶视图|top',
            '底视图': '底视图|bottom',
            '前视图': '前视图|front',
            '后视图': '后视图|back',
        };
        var index: any = {};
        var events = {};

        var combo = new SelectField({
            options: options,
            optionClassNamePrefix: 'viewport-camera',
            // default: '透视相机'
        });
        combo.disabledClick = true;
        combo.class!.add('viewport-camera');

        var tooltip = Tooltip.attach({
            target: combo.element!,
            text: '场景相机类型选择',
            align: 'top',
            root: editor.call('layout.root')
        });

        combo.on('open', function () {
            tooltip.disabled = true;
            // console.warn('修改编辑器相机类型: open');
        });
        combo.on('close', function (title: string) {
            tooltip.disabled = false;
            // console.warn('修改编辑器相机类型: close: ' + title);
            if(title) {
                combo.value = title;
            }
        });

        combo.on('change', function (value: any) {
            // console.warn('修改编辑器相机类型: ' + value);

            editor.call('camera:change:mode', value);
            viewport.value = value;
        });

        viewport.append(combo);

        combo.value = '透视相机';

        editor.method('camera:ortho:set', () => {
            combo.value = '正交相机';
        });

        var refreshOptions = function () {
            combo._updateOptions(options);

            var writePermission = editor.call('permissions:write');
            for (var key in combo.optionElements) {
                if (index[key].__editorCamera)
                    continue;

                if (writePermission) {
                    combo.optionElements[key].classList.remove('hidden');
                } else {
                    combo.optionElements[key].classList.add('hidden');
                }
            }
        };

        var list = [{
            name: 'perspective',
            title: 'Perspective',
            className: 'viewport-camera-perspective',
            position: new BABYLON.Vector3(9.2, 6, 9),
            rotation: new BABYLON.Vector3(-25, 45, 0),
            default: true
        }, {
            name: 'top',
            title: 'Top',
            className: 'viewport-camera-top',
            position: new BABYLON.Vector3(0, 1000, 0),
            rotation: new BABYLON.Vector3(-90, 0, 0),
            ortho: true
        }, {
            name: 'bottom',
            title: 'Bottom',
            className: 'viewport-camera-bottom',
            position: new BABYLON.Vector3(0, -1000, 0),
            rotation: new BABYLON.Vector3(90, 0, 0),
            ortho: true
        }, {
            name: 'front',
            title: 'Front',
            className: 'viewport-camera-front',
            position: new BABYLON.Vector3(0, 0, 1000),
            rotation: new BABYLON.Vector3(0, 0, 0),
            ortho: true
        }, {
            name: 'back',
            title: 'Back',
            className: 'viewport-camera-back',
            position: new BABYLON.Vector3(0, 0, -1000),
            rotation: new BABYLON.Vector3(0, 180, 0),
            ortho: true
        }, {
            name: 'left',
            title: 'Left',
            className: 'viewport-camera-left',
            position: new BABYLON.Vector3(-1000, 0, 0),
            rotation: new BABYLON.Vector3(0, -90, 0),
            ortho: true
        }, {
            name: 'right',
            title: 'Right',
            className: 'viewport-camera-right',
            position: new BABYLON.Vector3(1000, 0, 0),
            rotation: new BABYLON.Vector3(0, 90, 0),
            ortho: true
        }];


        // editor.on('camera:add', function (entity) {
        //     options[entity.getGuid()] = entity.name;
        //     index[entity.getGuid()] = entity;
        //     refreshOptions();

        //     if (events[entity.getGuid()])
        //         events[entity.getGuid()].unbind();

        //     var obj = editor.call('entities:get', entity.getGuid());
        //     if (obj) {
        //         events[entity.getGuid()] = obj.on('name:set', function (value) {
        //             options[entity.getGuid()] = value;
        //             refreshOptions();

        //             if (combo.value === entity.getGuid())
        //                 combo.elementValue.textContent = value;
        //         });
        //     }
        // });

        // editor.on('camera:remove', function (entity) {
        //     delete options[entity.getGuid()];
        //     refreshOptions();

        //     if (events[entity.getGuid()]) {
        //         events[entity.getGuid()].unbind();
        //         delete events[entity.getGuid()];
        //     }
        // });

        // editor.on('camera:change', function (entity) {
        //     combo.value = entity.getGuid();
        // });




    }

}