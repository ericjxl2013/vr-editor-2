import { Tooltip, Menu, Panel, Button, MenuItem } from "../../ui";
import { VeryEngine } from "../../engine";

export class AssetsPanelControl {

    public constructor() {

        var root = VeryEngine.root;
        var assetsPanel = VeryEngine.assets;

        // context menu
        var menu = new Menu();
        root.append(menu);

        // var assets: any = {
        //     'upload': {
        //         title: '上传',
        //         icon: '&#57909;'
        //     },
        //     'folder': {
        //         title: '新建文件夹',
        //         icon: '&#57657;'
        //     },
        //     'css': {
        //         title: '表格',
        //         icon: '&#57864;'
        //     },
        //     'cubemap': {
        //         title: 'CubeMap',
        //         icon: '&#57879;'
        //     },
        //     'html': {
        //         title: 'HTML',
        //         icon: '&#57864;'
        //     },
        //     'json': {
        //         title: 'JSON',
        //         icon: '&#57864;'
        //     },
        //     'material': {
        //         title: '材质',
        //         icon: '&#57749;'
        //     },
        //     'script': {
        //         title: 'Script',
        //         icon: '&#57864;'
        //     },
        //     'shader': {
        //         title: 'Shader',
        //         icon: '&#57864;'
        //     },
        //     'text': {
        //         title: 'Text',
        //         icon: '&#57864;'
        //     }
        // };

        var assets: any = {
            'upload': {
                title: '上传',
                icon: '&#57909;'
            },
            'folder': {
                title: '新建文件夹',
                icon: '&#57657;'
            },
            'table': {
                title: '表格',
                icon: '&#57864;'
            },
            'material': {
                title: '材质',
                icon: '&#57749;'
            }
        };

        // if (editor.call('users:hasFlag', 'hasBundles')) {
        //     assets.bundle = {
        //         title: 'Asset Bundle',
        //         icon: '&#58384;'
        //     };
        // }

        var addNewMenuItem = function (key: string, data: any) {
            // new folder
            var item = new MenuItem({
                text: data.title,
                icon: data.icon || '',
                value: key
            });
            item.on('select', function () {
                var args = {
                    parent: editor.call('assets:panel:currentFolder')
                };

                if (key === 'upload') {
                    editor.call('assets:upload:picker', args);
                } else if (key === 'script') {
                    if (editor.call('settings:project').get('useLegacyScripts')) {
                        editor.call('sourcefiles:new');
                    } else {
                        editor.call('picker:script-create', function (filename: string) {
                            editor.call('assets:create:script', {
                                filename: filename,
                                boilerplate: true
                            });
                        });
                    }
                } else {
                    // console.log('assets:create:' + key);
                    // console.log(args);
                    editor.call('assets:create:' + key, args)
                }
            });
            menu.append(item);

            if (key === 'script') {
                editor.on('repositories:load', function (repositories: any) {
                    if (repositories.get('current') !== 'directory')
                        item.disabled = true;
                });
            }
        };

        var keys = Object.keys(assets);
        for (var i = 0; i < keys.length; i++) {
            if (!assets.hasOwnProperty(keys[i]))
                continue;

            addNewMenuItem(keys[i], assets[keys[i]]);
        }

        // controls
        var controls = new Panel();
        // controls.enabled = false;
        controls.class!.add('assets-controls');
        // controls.parent = assetsPanel;
        // assetsPanel.headerElement!.insertBefore(controls.element!, assetsPanel.headerElementTitle!.nextSibling);
        assetsPanel.header.append(controls);
        editor.on('permissions:writeState', function (state: boolean) {
            controls.enabled = state;
        });


        // add
        var btnNew = new Button();
        // btnNew.hidden = !editor.call('permissions:write');
        btnNew.class!.add('create-asset');
        btnNew.text = '&#57632;';
        btnNew.on('click', function (evt: MouseEvent) {
            var rect = btnNew.element!.getBoundingClientRect();
            menu.position(rect.right, rect.top);
            menu.open = true;
        });
        controls.append(btnNew);

        var tooltipAdd = Tooltip.attach({
            target: btnNew.element!,
            text: '添加资源',
            align: 'bottom',
            root: root
        });
        menu.on('open', function (state: boolean) {
            tooltipAdd.disabled = state;
        });

        // delete
        var btnDelete = new Button('&#57636;');
        // btnDelete.hidden = !editor.call('permissions:write');
        btnDelete.style!.fontWeight = '200';
        btnDelete.disabled = true;
        btnDelete.class!.add('delete');
        btnDelete.on('click', function () {
            if (!editor.call('permissions:write'))
                return;

            var type = editor.call('selector:type');
            if (type !== 'asset')
                return;

            editor.call('assets:delete:picker', editor.call('selector:items'));
        });
        controls.append(btnDelete);

        var tooltipDelete = Tooltip.attach({
            target: btnDelete.element!,
            text: '删除资源',
            align: 'bottom',
            root: root
        });
        tooltipDelete.class!.add('innactive');

        editor.on('permissions:writeState', function (state: boolean) {
            btnNew.hidden = !state;
            btnDelete.hidden = !state;
        });


        // folder up
        var btnUp = new Button('&#58117;');
        btnUp.style!.fontWeight = '200';
        btnUp.disabled = true;
        btnUp.class!.add('up');
        btnUp.on('click', function () {
            var folder = editor.call('assets:panel:currentFolder');
            if (!folder) return;

            if (folder === 'scripts') {
                editor.call('assets:panel:currentFolder', null);
            } else {
                var path = folder.get('path');
                if (path.length) {
                    var parent = editor.call('assets:get', path[path.length - 1]);
                    if (parent) {
                        editor.call('assets:panel:currentFolder', parent);
                    } else {
                        editor.call('assets:panel:currentFolder', null);
                    }
                } else {
                    editor.call('assets:panel:currentFolder', null);
                }
            }
        });
        controls.append(btnUp);

        editor.on('assets:panel:currentFolder', function (folder: any) {
            if (folder) {
                btnUp.disabled = false;
                tooltipUp.class!.remove('innactive');
            } else {
                btnUp.disabled = true;
                tooltipUp.class!.add('innactive');
            }
        });

        var tooltipUp = Tooltip.attach({
            target: btnUp.element!,
            text: '上一层',
            align: 'bottom',
            root: root
        });
        tooltipUp.class!.add('innactive');


        var assetsGrid = VeryEngine.assetsGrid;

        // thumbnails size
        var btnThumbSize = new Button('&#57669;');
        btnThumbSize.style!.fontWeight = '200';
        btnThumbSize.class!.add('size');
        btnThumbSize.on('click', function () {
            if (assetsGrid.class!.contains('small')) {
                assetsGrid.class!.remove('small');
                tooltipThumbSize.html = '<span style="color:#fff">大图标</span> / 小图标';
                editor.call('localStorage:set', 'editor:assets:thumbnail:size', 'large');
            } else {
                assetsGrid.class!.add('small');
                tooltipThumbSize.html = '大图标 / <span style="color:#fff">小图标</span>';
                editor.call('localStorage:set', 'editor:assets:thumbnail:size', 'small');
            }
        });
        controls.append(btnThumbSize);

        var tooltipThumbSize = Tooltip.attach({
            target: btnThumbSize.element!,
            align: 'bottom',
            root: root
        });

        var size = editor.call('localStorage:get', 'editor:assets:thumbnail:size');

        if (size === 'small') {
            assetsGrid.class!.add('small');
            tooltipThumbSize.html = '大图标 / <span style="color:#fff">小图标</span>';
        } else {
            assetsGrid.class!.remove('small');
            tooltipThumbSize.html = '<span style="color:#fff">大图标</span> / 小图标';
        }
        tooltipThumbSize.class!.add('innactive');


        editor.on('attributes:clear', function () {
            // btnDuplicate.disabled = true;
            btnDelete.disabled = true;
            tooltipDelete.class!.add('innactive');
        });

        editor.on('attributes:inspect[*]', function (type: string) {
            if (type.startsWith('asset')) {
                btnDelete.enabled = true;
                tooltipDelete.class!.remove('innactive');
            } else {
                btnDelete.enabled = false;
                tooltipDelete.class!.add('innactive');
            }
            // btnDuplicate.enabled = type === 'asset.material';
        });

        

    }

}