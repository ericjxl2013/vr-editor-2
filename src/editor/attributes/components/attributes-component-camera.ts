import { Label } from "../../../ui";
import { Observer } from "../../../lib";

export class AttributeComponentCamera {

    public constructor() {
        editor.on('attributes:inspect[entity]', function (entities: Observer[]) {


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
            var fieldClearColorBuffer = editor.call('attributes:addField', {
                parent: panel,
                type: 'checkbox',
                name: 'Clear Buffers',
                link: entities,
                path: 'components.camera.clearColorBuffer'
            });
            // label
            var label = new Label('Color');
            label.class!.add('label-infield');
            label.style!.paddingRight = '12px';
            fieldClearColorBuffer.parent.append(label);
            // reference
            editor.call('attributes:reference:attach', 'camera:clearColorBuffer', label);

            // camera.clearColor
            var fieldClearColor = editor.call('attributes:addField', {
                parent: panel,
                name: 'Clear Color',
                type: 'rgb',
                link: entities,
                path: 'components.camera.clearColor'
            });
            fieldClearColor.parent.hidden = !(fieldClearColorBuffer.value || fieldClearColorBuffer.class.contains('null'));
            fieldClearColorBuffer.on('change', function (value: any) {
                fieldClearColor.parent.hidden = !(value || fieldClearColorBuffer.class!.contains('null'));
            });
            // reference
            editor.call('attributes:reference:attach', 'camera:clearColor', fieldClearColor.parent.innerElement.firstChild.ui);



        });
    }


}