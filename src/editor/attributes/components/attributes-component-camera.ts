import { Label } from "../../../ui";
import { Observer } from "../../../lib";

export class AttributeComponentCamera {

    public constructor() {
        editor.on('attributes:inspect[entity]', function (entities: Observer[]) {
            if (entities.length !== 1 || entities[0].get('type') !== 'camera')
                return;

            // console.log('attributes:inspect[entity] camera');

            var panelComponents = editor.call('attributes:entity.panelComponents');
            if (!panelComponents)
                return;

            var projectSettings = editor.call('settings:project');

            var panel = editor.call('attributes:entity:addComponentPanel', {
                title: '摄像机属性',
                name: 'camera',
                entities: entities
            });


            // clearColorBuffer
            // var fieldClearColorBuffer = editor.call('attributes:addField', {
            //     parent: panel,
            //     type: 'checkbox',
            //     name: 'Clear Buffers',
            //     link: entities,
            //     path: 'components.camera.clearColorBuffer'
            // });
            // // label
            // var label = new Label('Color');
            // label.class!.add('label-infield');
            // label.style!.paddingRight = '12px';
            // fieldClearColorBuffer.parent.append(label);
            // reference
            // editor.call('attributes:reference:attach', 'camera:clearColorBuffer', label);

            // camera.clearColor
            var fieldClearColor = editor.call('attributes:addField', {
                parent: panel,
                name: '背景色',
                type: 'rgb',
                link: entities,
                path: 'clearColor'
            });
            // fieldClearColor.parent.hidden = !(fieldClearColorBuffer.value || fieldClearColorBuffer.class.contains('null'));
            // fieldClearColorBuffer.on('change', function (value: any) {
            //     fieldClearColor.parent.hidden = !(value || fieldClearColorBuffer.class!.contains('null'));
            // });
            // reference
            // editor.call('attributes:reference:attach', 'camera:clearColor', fieldClearColor.parent.innerElement.firstChild.ui);

            // camera.projection
            var fieldProjection = editor.call('attributes:addField', {
                parent: panel,
                name: '相机类型',
                type: 'number',
                enum: [
                    { v: 0, t: '透视相机' }, // pc.PROJECTION_PERSPECTIVE
                    { v: 1, t: '正交相机' } // pc.PROJECTION_ORTHOGRAPHIC
                ],
                link: entities,
                path: 'mode'
            });
            // reference
            // editor.call('attributes:reference:attach', 'camera:projection', fieldProjection.parent.innerElement.firstChild.ui);

            // camera.fov
            var fieldFov = editor.call('attributes:addField', {
                parent: panel,
                name: '视野角度',
                // placeholder: '\u00B0',
                placeholder: '弧度',
                type: 'number',
                precision: 2,
                step: 1,
                min: 0,
                link: entities,
                path: 'fov'
            });
            fieldFov.style.width = '32px';
            fieldFov.parent.hidden = fieldProjection.value !== 0 && fieldProjection.value !== '';
            fieldProjection.on('change', function (value: any) {
                fieldFov.parent.hidden = value !== 0 && value !== '';
            });
            // reference
            // editor.call('attributes:reference:attach', 'camera:fov', fieldFov.parent.innerElement.firstChild.ui);

            // fov slider
            var fieldFovSlider = editor.call('attributes:addField', {
                panel: fieldFov.parent,
                precision: 2,
                step: 1,
                min: 0,
                max: Math.PI / 2,
                type: 'number',
                slider: true,
                link: entities,
                path: 'fov'
            });
            fieldFovSlider.flexGrow = 4;

            // camera.orthoHeight
            var fieldOrthoHeight = editor.call('attributes:addField', {
                parent: panel,
                name: '视野宽度',
                type: 'number',
                link: entities,
                path: 'orthoSize'
            });
            fieldOrthoHeight.parent.hidden = fieldProjection.value !== 1 && fieldProjection.value !== '';
            fieldProjection.on('change', function (value: any) {
                fieldOrthoHeight.parent.hidden = value !== 1 && value !== '';
            });
            // reference
            // editor.call('attributes:reference:attach', 'camera:orthoHeight', fieldOrthoHeight.parent.innerElement.firstChild.ui);

            // nearClip
            var fieldNearClip = editor.call('attributes:addField', {
                parent: panel,
                name: '近平面',
                // placeholder: 'Near',
                type: 'number',
                precision: 2,
                step: .1,
                min: -100000,
                link: entities,
                path: 'minZ'
            });
            fieldNearClip.style.width = '32px';
            // reference
            // editor.call('attributes:reference:attach', 'camera:clip', fieldNearClip.parent.innerElement.firstChild.ui);


            // farClip
            var fieldFarClip = editor.call('attributes:addField', {
                parent: panel,
                name: '远平面',
                // placeholder: '远平面',
                type: 'number',
                precision: 2,
                step: .1,
                min: 0,
                link: entities,
                path: 'maxZ'
            });
            fieldFarClip.style.width = '32px';

            // camera.rect
            var fieldRect = editor.call('attributes:addField', {
                parent: panel,
                name: 'Viewport',
                placeholder: ['X', 'Y', 'W', 'H'],
                type: 'vec4',
                precision: 3,
                step: 0.01,
                min: 0,
                max: 1,
                link: entities,
                path: 'viewport'
            });
            // reference
            // editor.call('attributes:reference:attach', 'camera:rect', fieldRect[0].parent.innerElement.firstChild.ui);

            var fieldGravity = editor.call('attributes:addField', {
                parent: panel,
                name: '启用重力',
                type: 'checkbox',
                link: entities,
                path: 'applyGravity'
            });

        });
    }


}