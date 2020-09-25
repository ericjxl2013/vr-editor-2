import { Panel, Button, Tooltip, Tree, TreeItem } from '../../ui';
import { VeryEngine } from '../../engine';
import { HierarchySearch } from './hierarchy-search';
import { HierarchyMenu } from './hierarchy-menu';
import { HierarchyContextMenu } from './hierarchy-context-menu';
import { HierarchyPanel } from './hierarchy-panel';
import { HierarchyControl } from './hierarchy-control';

export class HierarchyKeeper {

  // public hierarchyMain: Panel;

  public constructor() {
    // this.hierarchyMain = new Panel();
    // this.hierarchyMain.class!.add('hierarchy-controls');
    // this.hierarchyMain.parent = VeryEngine.hierarchyPanel;
    // VeryEngine.hierarchyPanel.headerAppend(this.hierarchyMain);
    // // console.log('hierarchy-controls');

    // // controls delete (Button)
    // let btnDelete: Button = new Button('&#57636;');
    // btnDelete.class!.add('delete');
    // btnDelete.style!.fontWeight = '200';
    // btnDelete.on('click', function () {
    //   let type = editor.call('selector:type');
    //   if (type !== 'entity')
    //     return;
    //   editor.call('entities:delete', editor.call('selector:items'));
    // });
    // this.hierarchyMain.append(btnDelete);

    // let tooltipDelete = Tooltip.attach({
    //   target: btnDelete.element!,
    //   text: '删除',
    //   align: 'top',
    //   root: VeryEngine.rootPanel
    // });
    // tooltipDelete.class!.add('innactive');

    // // controls duplicate
    // let btnDuplicate: Button = new Button('&#57638;');
    // btnDuplicate.disabled = true;
    // btnDuplicate.class!.add('duplicate');
    // btnDuplicate.on('click', function () {
    //   let type = editor.call('selector:type');
    //   let items = editor.call('selector:items');

    //   if (type === 'entity' && items.length)
    //     editor.call('entities:duplicate', items);
    // });
    // this.hierarchyMain.append(btnDuplicate);

    // let tooltipDuplicate = Tooltip.attach({
    //   target: btnDuplicate.element!,
    //   text: '复制',
    //   align: 'top',
    //   root: VeryEngine.rootPanel
    // });
    // tooltipDuplicate.class!.add('innactive');

    // // TODO: Menu
    // // let menuEntities = ui.Menu.fromData(editor.call('menu:entities:new'));
    // // root.append(menuEntities);

    // // controls add
    // let btnAdd: Button = new Button('&#57632;');
    // btnAdd.class!.add('add');
    // btnAdd.on('click', function () {
    //   // menuEntities.open = true;
    //   // let rect = btnAdd.element.getBoundingClientRect();
    //   // menuEntities.position(rect.left, rect.top);
    // });
    // this.hierarchyMain.append(btnAdd);

    // Tooltip.attach({
    //   target: btnAdd.element!,
    //   text: '添加',
    //   align: 'top',
    //   root: VeryEngine.rootPanel
    // });

    // hierarchy panel
    let hierarchyMainPanel = new HierarchyPanel();

    // 全局菜单
    let contextMenuLogo = new HierarchyMenu();
    // let controlMenu = new HierarchyControl();

    // 搜索区域：Search Field
    let searchField = new HierarchySearch();

    

    let contextMenu = new HierarchyContextMenu();

  }


}