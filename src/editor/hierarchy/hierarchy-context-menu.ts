import { Panel, MenuItem, Menu, MenuItemArgs, TreeItem } from "../../ui";
import { Observer } from "../../lib";

export class HierarchyContextMenu {

    public root: Panel;
    public clickableSubmenus: boolean;
    public menu!: Menu;
    public customMenuItems: MenuItemArgs[] = [];
    public entity!: Observer;
    public items = [];


    public constructor() {
        this.root = editor.call('layout.root');

        this.clickableSubmenus = /clickableContextSubmenus=true/.test(location.search);

        this.initMenu();
        this.initFunction();

    }


    private initMenu(): void {
        let that = this;
        var menuData: { [key: string]: ContextMenuArgs } = {};

        menuData['new-empty'] = {
            title: '创建空物体',
            className: 'menu-item-new-entity',
            icon: '&#57632;',
            select: () => {
                editor.call('entities:editor:new', { parent: that.items[0], type: 'empty', subtype: '' });
            }
            // filter: function () {
            //   return that.items.length === 1;
            // },
            // select: function () {
            //   editor.call('entities:new', { parent: that.items[0] });
            // },
            // 
            // items: editor.call('menu:entities:new', function () { return that.items[0]; })
        };

        menuData['add-primitive'] = {
            title: '创建3D物体',
            className: 'menu-item-primitive-sub-menu',
            icon: '&#57736;',
            items: {
                'add-new-box': {
                    title: '立方体',
                    className: 'menu-item-add-box-primitive',
                    icon: '&#57736;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'primitive', subtype: 'box' });
                    }
                },
                'add-new-sphere': {
                    title: '球',
                    className: 'menu-item-add-sphere-primitive',
                    icon: '&#57736;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'primitive', subtype: 'sphere' });
                    }
                },
                'add-new-plane': {
                    title: '平面',
                    className: 'menu-item-add-plane-primitive',
                    icon: '&#57736;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'primitive', subtype: 'plane' });
                    }
                },
                'add-new-cylinder': {
                    title: '圆柱体',
                    className: 'menu-item-add-cylinder-primitive',
                    icon: '&#57736;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'primitive', subtype: 'cylinder' });
                    }
                }
            }
        };

        menuData['add-new-light'] = {
            title: '创建灯光',
            className: 'menu-item-light-sub-menu',
            icon: '&#57748;',
            filter: () => {
                return false;
            },
            items: {
                'add-new-hemispheric': {
                    title: '环境光',
                    className: 'menu-item-add-directional-light',
                    icon: '&#57748;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'light', subtype: 'hemispheric' });
                    }
                },
                'add-new-directional': {
                    title: '平行光',
                    className: 'menu-item-add-directional-light',
                    icon: '&#57748;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'light', subtype: 'directional' });
                    }
                },
                'add-new-point': {
                    title: '点光源',
                    className: 'menu-item-add-point-light',
                    icon: '&#57748;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'light', subtype: 'point' });
                    }
                },
                'add-new-spot': {
                    title: '聚光灯',
                    className: 'menu-item-add-spot-light',
                    icon: '&#57748;',
                    select: () => {
                        editor.call('entities:editor:new', { parent: that.items[0], type: 'light', subtype: 'spot' });
                    }
                }
            }
        };

        menuData['add-new-camera'] = {
            title: '创建摄像机',
            className: 'menu-item-add-camera',
            icon: '&#57874;',
            filter: () => {
                return false;
            },
            select: () => {
                editor.call('entities:editor:new', { parent: that.items[0], type: 'camera', subtype: '' });
            }
        };

        menuData['add-new-gui'] = {
            title: '创建GUI',
            className: 'menu-item-add-camera',
            icon: '&#58232;',
            filter: () => {
                return false;
            },
            items: {
                'add-new-button': {
                    title: 'To Be Continued',
                    className: 'menu-item-add-directional-light',
                    icon: '&#58373;',
                },
            }
        };

        menuData['duplicate'] = {
            title: '创建副本',
            className: 'menu-item-duplicate',
            icon: '&#57638;',
            filter: () => {
                return false;
            },
            // hide: function () {
            //   if (that.items.length === 1) {
            //     return !that.items[0].get('enabled');
            //   } else {
            //     var disabled = that.items[0].get('enabled');
            //     for (var i = 1; i < that.items.length; i++) {
            //       if (disabled !== that.items[i].get('enabled'))
            //         return false;
            //     }
            //     return !disabled;
            //   }
            // },
            // select: function () {
            //   setField('enabled', false);
            // }
        };

        menuData['delete'] = {
            title: '删除',
            className: 'menu-item-delete',
            icon: '&#57636;',
            select: function () {
              editor.call('entities:delete', that.items);
            }
        };


        // menu
        this.menu = Menu.fromData(menuData, { clickableSubmenus: this.clickableSubmenus });
        this.root.append(this.menu);

        // this.menu.on('open', function () {
        //   var selection = getSelection();

        //   for (var i = 0; i < that.customMenuItems.length; i++) {
        //     if (!that.customMenuItems[i].filter)
        //       continue;

        //     that.customMenuItems[i].hidden = !that.customMenuItems[i].filter(selection);
        //   }
        // });

    }


    private getSelection() {
        var selection = editor.call('selector:items');

        if (selection.indexOf(this.entity) !== -1) {
            return selection;
        } else {
            return [this.entity];
        }
    }


    private initFunction(): void {

        let that = this;

        // TODO
        // editor.method('entities:contextmenu:add', function (data: MenuItemArgs) {
        //   var item = new MenuItem({
        //     text: data.text,
        //     icon: data.icon,
        //     value: data.value,
        //     hasChildren: !!(data.items && Object.keys(data.items).length > 0),
        //     clickableSubmenus: that.clickableSubmenus
        //   });

        //   item.on('select', function () {
        //     data.select.call(item, getSelection());
        //   });

        //   var parent = data.parent || that.menu;
        //   parent.append(item);

        //   if (data.filter)
        //     item.filter = data.filter;

        //   that.customMenuItems.push(item);

        //   return item;
        // });

        editor.method('entities:contextmenu:open', function (item: Observer, x: number, y: number, ignoreSelection: boolean) {

            if (!that.menu) return;
            that.entity = item;
            if (ignoreSelection) {
                that.items = [];
            } else {
                that.items = that.getSelection();
            }

            // console.log(item.get('name'));

            that.menu.open = true;
            that.menu.position(x + 1, y);

            return true;
        });

        // get the entity that was right-clicked when opening the context menu
        editor.method('entities:contextmenu:entity', function () {
            return that.entity;
        });

        // for each entity added
        editor.on('entities:add', function (item: Observer) {
            // get tree item
            var treeItem = editor.call('entities:panel:get', item.get('resource_id'));
            if (!treeItem) return;

            // attach contextmenu event
            treeItem.element!.addEventListener('contextmenu', function (evt: MouseEvent) {
                // console.log("context click: " + item.element!.innerText);
                let openned = editor.call('entities:contextmenu:open', item, evt.clientX, evt.clientY);

                if (openned) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            });
        });

    }

}


export interface ContextMenuArgs {
    title?: string;
    className?: string;
    icon?: string;
    filter?: () => boolean;
    hide?: () => boolean;
    select?: () => void;
    items?: any;
}