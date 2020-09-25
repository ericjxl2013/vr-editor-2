import { Observer } from "../../lib";
import { BabylonLoader } from "../middleware/loader/babylonLoader";

export class SettingsAttribute {

    public constructor() {


        var sceneName = '新建场景';

        let settingsData = new Observer({ scene_name: sceneName });

        editor.method('settings:data', () => {
            return settingsData;
        });

        editor.on('scene:name', function (name: string) {
            settingsData.set('scene_name', name);
            sceneName = name;
        });

        editor.method('editorSettings:panel:unfold', function (panel: string) {
            var element = editor.call('layout.attributes').dom.querySelector('.ui-panel.component.foldable.' + panel);
            if (element && element.ui) {
                element.ui.folded = false;
            }
        });

        editor.on('attributes:inspect[editorSettings]', function () {
            editor.call('attributes:header', '场景设置');
        });


        // inspecting
        editor.on('attributes:inspect[editorSettings]', function () {
            var panelScene = editor.call('attributes:addPanel');
            panelScene.class.add('component');

            // scene name
            var fieldName = editor.call('attributes:addField', {
                parent: panelScene,
                name: '场景名',
                type: 'string',
                value: sceneName
            });
            var changingName = false;
            fieldName.on('change', function (value: string) {
                if (changingName)
                    return;

                // editor.call('realtime:scene:op', {
                //     p: ['name'],
                //     od: sceneName || '',
                //     oi: value || ''
                // });
                editor.emit('scene:name', value);
                let rootEntity = editor.call('entities:root');
                if(rootEntity) {
                    rootEntity.set('name', value);
                    BabylonLoader.changeSceneName(rootEntity.get('resource_id'), value);
                }
            });
            // var evtNameChange = editor.on('realtime:scene:op:name', function (op) {
            //     changingName = true;
            //     fieldName.value = op.oi;
            //     changingName = false;
            // });
            // fieldName.on('destroy', function () {
            //     evtNameChange.unbind();
            // });
            // // reference
            // editor.call('attributes:reference:attach', 'settings:name', fieldName.parent.innerElement.firstChild.ui);


        });

    }


}