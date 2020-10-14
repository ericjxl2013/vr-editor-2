import { Observer } from "../../../lib";

export class AttributeComponentLight {

    public constructor() {

        editor.on('attributes:inspect[entity]', function (entities: Observer[]) {
            if (entities.length !== 1 || entities[0].get('type') !== 'light')
                return;

            // console.log('attributes:inspect[entity] light');

            var panelComponents = editor.call('attributes:entity.panelComponents');
            if (!panelComponents)
                return;

            var projectSettings = editor.call('settings:project');

            var panel = editor.call('attributes:entity:addComponentPanel', {
                title: '灯光属性',
                name: 'light',
                entities: entities
            });









        });

    }


}