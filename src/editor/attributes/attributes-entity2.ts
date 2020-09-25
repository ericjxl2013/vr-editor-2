import { Menu, MenuItem } from "../../ui";

export class AttributesEntity2 {


    public constructor() {

        var panelComponents: any;

        editor.method('attributes:entity.panelComponents', function () {
            return panelComponents;
        });

        // add component menu
        var menuAddComponent = new Menu();
        var components = editor.call('components:schema');
        var list = editor.call('components:list');
        for (var i = 0; i < list.length; i++) {
            menuAddComponent.append(new MenuItem({
                text: components[list[i]].$title,
                value: list[i]
            }));
        }
        menuAddComponent.on('open', function () {
            var items = editor.call('selector:items');

            var legacyAudio = editor.call('settings:project').get('useLegacyAudio');
            for (var i = 0; i < list.length; i++) {
                var different = false;
                var disabled = items[0].has('components.' + list[i]);

                for (var n = 1; n < items.length; n++) {
                    if (disabled !== items[n].has('components.' + list[i])) {
                        var different = true;
                        break;
                    }
                }
                menuAddComponent.findByPath([list[i]])!.disabled = different ? false : disabled;

                if (list[i] === 'audiosource')
                menuAddComponent.findByPath([list[i]])!.hidden = !legacyAudio;
            }
        });
        menuAddComponent.on('select', function (path: string) {
            var items = editor.call('selector:items');
            var component = path[0];
            editor.call('entities:addComponent', items, component);
        });
        editor.call('layout.root').append(menuAddComponent);

    }




}