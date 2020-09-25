import { VeryEngine } from "../../engine";
import { Panel, Button, Tooltip, TopElementContainer, TopElementPanel } from "../../ui";
import { Observer } from "../../lib";

export class HierarchyControl {

    public constructor() {

        let root: TopElementContainer = VeryEngine.root;
        let panel: TopElementPanel = VeryEngine.hierarchy;

        // 层级菜单控制菜单
        let controls = new TopElementContainer({
            flex: true,
            flexDirection: 'row',
            alignItems: 'center',
            // hidden: !editor.call('permissions:write')
        });
        controls.class!.add('hierarchy-controls');

        // TODO: 分享项目给他人时，是否允许修改
        // controls.hidden = !editor.call('permissions:write');
        // editor.on('permissions:writeState', function (state: boolean) {
        //     controls.hidden = !state;
        // });

        panel.header.append(controls);

        // controls add
        let btnAdd: Button = new Button('&#57632;');
        btnAdd.class!.add('add');
        btnAdd.on('click', function () {
            // menuEntities.open = true;
            // let rect = btnAdd.element.getBoundingClientRect();
            // menuEntities.position(rect.left, rect.top);
        });
        controls.append(btnAdd);

        Tooltip.attach({
            target: btnAdd.element!,
            text: '添加',
            align: 'top',
            root: root
        });

        editor.on('attributes:clear', function () {
            btnDuplicate.disabled = true;
            btnDelete.disabled = true;
            tooltipDelete.class!.add('innactive');
            tooltipDuplicate.class!.add('innactive');
        });


        // controls duplicate
        let btnDuplicate: Button = new Button('&#57638;');
        btnDuplicate.disabled = true;
        btnDuplicate.class!.add('duplicate');
        btnDuplicate.on('click', function () {
            let type = editor.call('selector:type');
            let items = editor.call('selector:items');

            if (type === 'entity' && items.length)
                editor.call('entities:duplicate', items);
        });
        controls.append(btnDuplicate);

        let tooltipDuplicate = Tooltip.attach({
            target: btnDuplicate.element!,
            text: '复制',
            align: 'top',
            root: root
        });
        tooltipDuplicate.class!.add('innactive');

        // controls delete (Button)
        let btnDelete: Button = new Button('&#57636;');
        btnDelete.class!.add('delete');
        btnDelete.style!.fontWeight = '200';
        btnDelete.on('click', function () {
            let type = editor.call('selector:type');
            if (type !== 'entity')
                return;
            editor.call('entities:delete', editor.call('selector:items'));
        });
        controls.append(btnDelete);

        let tooltipDelete = Tooltip.attach({
            target: btnDelete.element!,
            text: '删除',
            align: 'top',
            root: root
        });
        tooltipDelete.class!.add('innactive');

        // TODO: Menu
        // let menuEntities = ui.Menu.fromData(editor.call('menu:entities:new'));
        // root.append(menuEntities);

        

        // TODO: 选择到了hierarchy的scene一行
        editor.on('attributes:inspect[*]', function (type: string, items: Observer[]) {
            var root = editor.call('entities:root');

            if (type === 'entity' && items[0] !== root) {
                btnDelete.enabled = true;
                btnDuplicate.enabled = true;
                tooltipDelete.class!.remove('innactive');
                tooltipDuplicate.class!.remove('innactive');
            } else {
                btnDelete.enabled = false;
                btnDuplicate.enabled = false;
                tooltipDelete.class!.add('innactive');
                tooltipDuplicate.class!.add('innactive');
            }
        });

    }
}