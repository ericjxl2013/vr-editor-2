import { Menu, MenuItem } from '../../ui';
import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';

export class AssetsContextMenu {
    public constructor() {

        var currentAsset: any = null;
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;
        var root = VeryEngine.root;

        var customMenuItems: any = [];

        // menu
        var menu = new Menu();
        root.append(menu);


        // edit
        var menuItemNewScript = new MenuItem({
            text: 'New Script',
            icon: '&#57864;',
            value: 'script'
        });
        menuItemNewScript.on('select', function () {
            if (legacyScripts) {
                editor.call('sourcefiles:new');
            } else {
                editor.call('picker:script-create', function (filename: string) {
                    editor.call('assets:create:script', {
                        filename: filename,
                        boilerplate: true
                    });
                });
            }
        });
        menu.append(menuItemNewScript);

        // new asset
        var menuItemNew = new MenuItem({
            text: '添加资源',
            icon: '&#57632;',
            value: 'new'
        });
        menu.append(menuItemNew);

        var downloadable: any = {
            'texture': 1,
            'textureatlas': 1,
            'html': 1,
            'table': 1,
            'shader': 1,
            'scene': 1,
            'json': 1,
            'audio': 1,
            'text': 1
        };

        var icons: any = {
            'upload': '&#57909;',
            'folder': '&#57657;',
            'table': '&#57864;',
            'cubemap': '&#57879;',
            'html': '&#57864;',
            'json': '&#57864;',
            'layers': '&#57992',
            'material': '&#57749;',
            'script': '&#57864;',
            'shader': '&#57864;',
            'text': '&#57864;',
            'texture': '&#57857;',
            'textureatlas': '&#57857;',
            'model': '&#57735;',
            'scene': '&#57735;',
            'animation': '&#57875;',
            'audio': '&#57872;',
            'bundle': '&#58384;'
        };

        var ICONS: any = {
            REFERENCES: '&#57622;',
            TEXTURE_ATLAS: '&#58162;',
            SPRITE_ASSET: '&#58261;',
            REPLACE: '&#57640;',
            REIMPORT: '&#57889;',
            DOWNLOAD: '&#57896;',
            EDIT: '&#57648;',
            DUPLICATE: '&#57638;',
            DELETE: '&#57636;',
            SCENE_SETTINGS: '&#57652;'
        };

        // var assets: any = {
        //     'upload': '上传',
        //     'folder': '新建文件夹',
        //     'css': '表格',
        //     'cubemap': 'CubeMap',
        //     'html': 'HTML',
        //     'json': 'JSON',
        //     'material': '材质',
        //     'script': 'Script',
        //     'shader': 'Shader',
        //     'text': 'Text'
        // };

        var assets: any = {
            'upload': '上传',
            'folder': '新建文件夹',
            'table': '表格',
            // 'material': '材质'
        };

        // if (editor.call('users:hasFlag', 'hasBundles')) {
        //     assets.bundle = 'Asset Bundle';
        // }

        var addNewMenuItem = function (key: string, title: string) {
            // new folder
            var item = new MenuItem({
                text: title,
                icon: icons[key] || '',
                value: key
            });
            item.on('select', function () {
                var args: any = {};

                if (currentAsset && currentAsset.get('type') === 'folder') {
                    args.parent = currentAsset;
                } else if (currentAsset === undefined) {
                    args.parent = null;
                }

                if (key === 'upload') {
                    editor.call('assets:upload:picker', args);
                } else if (key === 'script') {
                    if (legacyScripts) {
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
                    editor.call('assets:create:' + key, args)
                }
            });
            menuItemNew.append(item);

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

        // related
        // var menuItemReferences = new MenuItem({
        //     text: 'References',
        //     icon: ICONS.REFERENCES,
        //     value: 'references'
        // });
        // menu.append(menuItemReferences);

        // Create Atlas
        // var menuItemTextureToAtlas = new MenuItem({
        //     text: 'Create Texture Atlas',
        //     icon: ICONS.TEXTURE_ATLAS,
        //     value: 'texture-to-atlas'
        // });
        // menu.append(menuItemTextureToAtlas);

        // menuItemTextureToAtlas.on('select', function () {
        //     editor.call('assets:textureToAtlas', currentAsset);
        // });

        // Create Sprite From Atlas
        // var menuItemCreateSprite = new MenuItem({
        //     text: 'Create Sprite Asset',
        //     icon: ICONS.SPRITE_ASSET,
        //     value: 'atlas-to-sprite'
        // });
        // menu.append(menuItemCreateSprite);

        // menuItemCreateSprite.on('select', function () {
        //     editor.call('assets:atlasToSprite', {
        //         asset: currentAsset
        //     });
        // });

        // Create Sliced Sprite From Atlas
        // var menuItemCreateSlicedSprite = new MenuItem({
        //     text: 'Create Sliced Sprite Asset',
        //     icon: ICONS.SPRITE_ASSET,
        //     value: 'atlas-to-sliced-sprite'
        // });
        // menu.append(menuItemCreateSlicedSprite);

        // menuItemCreateSlicedSprite.on('select', function () {
        //     editor.call('assets:atlasToSprite', {
        //         asset: currentAsset,
        //         sliced: true
        //     });
        // });

        // replace
        var replaceAvailable: any = {
            material: true,
            texture: true,
            textureatlas: true,
            model: true,
            animation: true,
            audio: true,
            cubemap: true,
            css: true,
            html: true,
            shader: true,
            sprite: true,
            json: true,
            text: true
        };
        var menuItemReplace = new MenuItem({
            text: '加载',
            icon: ICONS.REPLACE,
            value: 'replace'
        });
        menuItemReplace.on('select', function () {
            // console.log(currentAsset)
            // console.log(currentAsset.origin)
            editor.call('load:from:asset', currentAsset);
            // var id = parseInt(currentAsset.get('id'), 10);
            // console.log(currentAsset.get('name'));
            // editor.call('picker:asset', {
            //     type: currentAsset.get('type'),
            //     currentAsset: currentAsset
            // });

            // var evtPick: Nullable<EventHandle> = editor.once('picker:asset', function (asset: Observer) {
            //     editor.call('assets:replace', currentAsset, asset);
            //     evtPick = null;
            // });

            // editor.once('picker:asset:close', function () {
            //     if (evtPick) {
            //         evtPick.unbind();
            //         evtPick = null;
            //     }
            // });
        });
        menu.append(menuItemReplace);

        // var menuItemReplaceTextureToSprite = new MenuItem({
        //     text: 'Convert Texture To Sprite',
        //     icon: ICONS.SPRITE_ASSET,
        //     value: 'replaceTextureToSprite'
        // });
        // menuItemReplaceTextureToSprite.on('select', function () {
        //     var id = parseInt(currentAsset.get('id'), 10);

        //     editor.call('picker:asset', {
        //         type: 'sprite',
        //         currentAsset: currentAsset
        //     });

        //     var evtPick: Nullable<EventHandle> = editor.once('picker:asset', function (asset: Observer) {
        //         editor.call('assets:replaceTextureToSprite', currentAsset, asset);
        //         evtPick = null;
        //     });

        //     editor.once('picker:asset:close', function () {
        //         if (evtPick) {
        //             evtPick.unbind();
        //             evtPick = null;
        //         }
        //     });
        // });
        // menu.append(menuItemReplaceTextureToSprite);

        // extract. Used for source assets.
        // var menuItemExtract = new MenuItem({
        //     text: 'Re-Import',
        //     icon: ICONS.REIMPORT,
        //     value: 'extract'
        // });
        // menuItemExtract.on('select', function () {
        //     editor.call(
        //         'assets:reimport',
        //         currentAsset.get('id'),
        //         currentAsset.get('type')
        //     );
        // });
        // menu.append(menuItemExtract);

        // re-import. Used for target assets.
        // var menuItemReImport = new MenuItem({
        //     text: 'Re-Import',
        //     icon: ICONS.REIMPORT,
        //     value: 're-import'
        // });
        // menuItemReImport.on('select', function () {
        //     editor.call(
        //         'assets:reimport',
        //         currentAsset.get('id'),
        //         currentAsset.get('type')
        //     );
        // });
        // menu.append(menuItemReImport);

        // download
        // var menuItemDownload = new MenuItem({
        //     text: '下载',
        //     icon: ICONS.DOWNLOAD,
        //     value: 'download'
        // });
        // menuItemDownload.on('select', function () {
        //     window.open(currentAsset.get('file.url'));
        // });
        // menu.append(menuItemDownload);

        // edit
        var menuItemEdit = new MenuItem({
            text: '编辑',
            icon: ICONS.EDIT,
            value: 'edit'
        });
        menuItemEdit.on('select', function () {
            // editor.call('assets:edit', currentAsset);
            // console.log('编辑表格');
            // console.warn(currentAsset);
            editor.call('assets:open-table', currentAsset.get('name'));

        });
        menu.append(menuItemEdit);

        // duplicate
        var menuItemDuplicate = new MenuItem({
            text: '创建副本',
            icon: ICONS.DUPLICATE,
            value: 'duplicate'
        });
        menuItemDuplicate.on('select', function () {
            editor.call('status:text', '抱歉，创建副本功能待添加！');
            editor.call('assets:duplicate', currentAsset);
        });
        menu.append(menuItemDuplicate);

        // delete
        var menuItemDelete = new MenuItem({
            text: '删除',
            icon: ICONS.DELETE,
            value: 'delete'
        });
        menuItemDelete.style!.fontWeight = '200';
        menuItemDelete.on('select', function () {

            editor.call('status:text', '抱歉，删除功能待添加！');
            var asset = currentAsset;
            var multiple = false;

            if (asset) {
                var assetType = asset.get('type');
                var type = editor.call('selector:type');
                var items;

                if (type === 'asset') {
                    items = editor.call('selector:items');
                    for (var i = 0; i < items.length; i++) {
                        // if the asset that was right-clicked is in the selection
                        // then include all the other selected items in the delete
                        // otherwise only delete the right-clicked item
                        if (assetType === 'script' && legacyScripts) {
                            if (
                                items[i].get('filename') === asset.get('filename')
                            ) {
                                multiple = true;
                                break;
                            }
                        } else if (items[i].get('id') === asset.get('id')) {
                            multiple = true;
                            break;
                        }
                    }
                }

                editor.call('assets:delete:picker', multiple ? items : [asset]);
            }
        });
        menu.append(menuItemDelete);

        // filter buttons
        menu.on('open', function () {
            menuItemNewScript.hidden = !((currentAsset === null || (currentAsset && currentAsset.get('type') === 'script')) && editor.call('assets:panel:currentFolder') === 'scripts');
            menuItemNew.hidden = !menuItemNewScript.hidden;

            if (currentAsset) {
                // download，TODO：下载菜单
                // menuItemDownload.hidden = true;
                // menuItemDownload.hidden = !(
                //     (!config.project.privateAssets ||
                //         (config.project.privateAssets &&
                //             editor.call('permissions:read'))) &&
                //     currentAsset.get('type') !== 'folder' &&
                //     (currentAsset.get('source') ||
                //         downloadable[currentAsset.get('type')] ||
                //         (!legacyScripts &&
                //             currentAsset.get('type') === 'script')) &&
                //     currentAsset.get('file.url')
                // );

                // duplicate
                if (currentAsset.get('type') === 'material' ||
                    currentAsset.get('type') === 'sprite') {
                    menuItemEdit.hidden = true;
                    if (editor.call('selector:type') === 'asset') {
                        var items = editor.call('selector:items');
                        menuItemDuplicate.hidden =
                            items.length > 1 && items.indexOf(currentAsset) !== -1;
                    } else {
                        menuItemDuplicate.hidden = false;
                    }
                } else {
                    menuItemDuplicate.hidden = true;
                }

                // edit
                if (!currentAsset.get('source') &&
                    ['html', 'table', 'json', 'text', 'script', 'shader'].indexOf(currentAsset.get('type')) !== -1) {
                    if (editor.call('selector:type') === 'asset') {
                        var items = editor.call('selector:items');
                        menuItemEdit.hidden =
                            items.length > 1 && items.indexOf(currentAsset) !== -1;
                    } else {
                        menuItemEdit.hidden = false;
                    }
                } else {
                    menuItemEdit.hidden = true;
                }

                // create atlas
                // menuItemTextureToAtlas.hidden =
                //     currentAsset.get('type') !== 'texture' ||
                //     currentAsset.get('source') ||
                //     currentAsset.get('task') ||
                //     !editor.call('permissions:write');

                // create sprite
                // menuItemCreateSprite.hidden =
                //     currentAsset.get('type') !== 'textureatlas' ||
                //     currentAsset.get('source') ||
                //     currentAsset.get('task') ||
                //     !editor.call('permissions:write');
                // menuItemCreateSlicedSprite.hidden = menuItemCreateSprite.hidden;

                // delete
                menuItemDelete.hidden = false;

                if (!currentAsset.get('source')) {
                    // menuItemExtract.hidden = true;

                    // re-import
                    var sourceId = currentAsset.get('source_asset_id');
                    if (sourceId) {
                        var source = editor.call('assets:get', sourceId);
                        if (source) {
                            if (
                                source.get('type') === 'scene' &&
                                (['texture', 'material'].indexOf(
                                    currentAsset.get('type')
                                ) !== -1 ||
                                    !source.get('meta'))
                            ) {
                                // menuItemReImport.hidden = true;
                            } else if (
                                currentAsset.get('type') === 'animation' &&
                                !source.get('meta.animation.available')
                            ) {
                                // menuItemReImport.hidden = true;
                            } else if (
                                currentAsset.get('type') === 'material' &&
                                !currentAsset.has('meta.index')
                            ) {
                                // menuItemReImport.hidden = true;
                            } else {
                                // menuItemReImport.hidden = false;
                            }
                        } else {
                            // menuItemReImport.hidden = true;
                        }
                    } else {
                        // menuItemReImport.hidden = true;
                    }

                    // references
                    // var ref = editor.call('assets:used:index')[
                    //     currentAsset.get('id')
                    // ];
                    // if (ref && ref.count && ref.ref) {
                    //     menuItemReferences.hidden = false;
                    //     menuItemReplace.hidden = replaceAvailable[
                    //         currentAsset.get('type')
                    //     ]
                    //         ? false
                    //         : true;
                    //     menuItemReplaceTextureToSprite.hidden =
                    //         !editor.call('users:hasFlag', 'hasTextureToSprite') ||
                    //         currentAsset.get('type') !== 'texture';

                    //     while (menuItemReferences.innerElement!.firstChild)
                    //         (<HTMLElement>menuItemReferences.innerElement!.firstChild).ui.destroy();

                    //     var menuItems: any = [];

                    //     var addReferenceItem = function (type: string, id: string) {
                    //         var menuItem = new MenuItem();
                    //         var item: any = null;

                    //         if (type === 'editorSettings') {
                    //             menuItem.text = 'Scene Settings';
                    //             menuItem.icon = ICONS.SCENE_SETTINGS;
                    //             item = editor.call('settings:projectUser');
                    //             if (!item) return;
                    //         } else {
                    //             if (type === 'entity') {
                    //                 item = editor.call('entities:get', id);
                    //                 menuItem.icon = '&#57734;';
                    //             } else if (type === 'asset') {
                    //                 item = editor.call('assets:get', id);
                    //                 menuItem.icon = icons[item.get('type')] || '';
                    //             }
                    //             if (!item) return;
                    //             menuItem.text = item.get('name');
                    //         }

                    //         menuItems.push({
                    //             name: menuItem.text,
                    //             type: type,
                    //             element: menuItem
                    //         });

                    //         menuItem.on('select', function () {
                    //             editor.call('selector:set', type, [item]);

                    //             var folder = null;
                    //             var path = item.get('path') || [];
                    //             if (path.length)
                    //                 folder = editor.call(
                    //                     'assets:get',
                    //                     path[path.length - 1]
                    //                 );

                    //             editor.call('assets:panel:currentFolder', folder);

                    //             // unfold rendering tab
                    //             if (type === 'editorSettings') {
                    //                 setTimeout(function () {
                    //                     editor.call(
                    //                         'editorSettings:panel:unfold',
                    //                         'rendering'
                    //                     );
                    //                 }, 0);
                    //             }
                    //         });
                    //     };

                    //     for (var key in ref.ref)
                    //         addReferenceItem(ref.ref[key].type, key);

                    //     var typeSort: any = {
                    //         editorSettings: 1,
                    //         asset: 2,
                    //         entity: 3
                    //     };

                    //     menuItems.sort(function (a: any, b: any) {
                    //         if (a.type !== b.type) {
                    //             return typeSort[a.type] - typeSort[b.type];
                    //         } else {
                    //             if (a.name > b.name) {
                    //                 return 1;
                    //             } else if (a.name < b.name) {
                    //                 return -1;
                    //             } else {
                    //                 return 0;
                    //             }
                    //         }
                    //     });

                    //     for (var i = 0; i < menuItems.length; i++)
                    //         menuItemReferences.append(menuItems[i].element);
                    // } else {
                    //     menuItemReferences.hidden = true;
                    //     menuItemReplace.hidden = true;
                    //     menuItemReplaceTextureToSprite.hidden = true;
                    // }
                } else {
                    // menuItemReferences.hidden = true;
                    menuItemReplace.hidden = true;
                    // menuItemReplaceTextureToSprite.hidden = true;
                    // menuItemReImport.hidden = true;
                    // menuItemExtract.hidden =
                    //     ['scene', 'texture', 'textureatlas'].indexOf(
                    //         currentAsset.get('type')
                    //     ) === -1 || !currentAsset.get('meta');
                }
            } else {
                // no asset
                // menuItemExtract.hidden = true;
                // menuItemReImport.hidden = true;
                // menuItemDownload.hidden = true;
                menuItemDuplicate.hidden = true;
                menuItemEdit.hidden = true;
                menuItemDelete.hidden = true;
                // menuItemReferences.hidden = true;
                menuItemReplace.hidden = true;
                // menuItemReplaceTextureToSprite.hidden = true;
                // menuItemTextureToAtlas.hidden = true;
                // menuItemCreateSprite.hidden = true;
                // menuItemCreateSlicedSprite.hidden = true;
            }

            for (var i = 0; i < customMenuItems.length; i++) {
                if (!customMenuItems[i].filter) continue;

                customMenuItems[i].hidden = !customMenuItems[i].filter(
                    currentAsset
                );
            }
        });




        // for each asset added
        editor.on('assets:add', function (asset: Observer) {

            // get grid item
            var item = editor.call('assets:panel:get', asset.get('id'));
            if (!item) return;

            // 右键功能
            var contextMenuHandler = function (evt: MouseEvent) {
                evt.stopPropagation();
                evt.preventDefault();

                // if (!editor.call('permissions:write')) return;
                currentAsset = asset;
                // 打开菜单
                menu.open = true;
                menu.position(evt.clientX + 1, evt.clientY);
                // 
            };

            // grid
            item.element.addEventListener('contextmenu', contextMenuHandler, false);

            // 

            // tree, 给tree item也加上右键菜单
            if (item.tree) {
                item.tree.elementTitle.addEventListener(
                    'contextmenu',
                    contextMenuHandler,
                    false
                );
            }
        });

        // folders
        editor.call('assets:panel:folders').innerElement.addEventListener('contextmenu', function (evt: MouseEvent) {
            evt.preventDefault();
            evt.stopPropagation();

            // if (!editor.call('permissions:write'))
            //     return;

            currentAsset = undefined;
            menu.open = true;
            menu.position(evt.clientX + 1, evt.clientY);
        }, false);

        // files
        editor.call('assets:panel:files').innerElement.addEventListener('contextmenu', function (evt: MouseEvent) {
            evt.preventDefault();
            evt.stopPropagation();

            // if (!editor.call('permissions:write'))
            //     return;

            currentAsset = null;
            menu.open = true;
            menu.position(evt.clientX + 1, evt.clientY);
        }, false);



    }
}