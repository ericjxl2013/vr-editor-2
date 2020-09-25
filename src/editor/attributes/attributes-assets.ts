import { Panel, Button } from "../../ui";
import { Observer } from "../../lib";
import { BabylonLoader } from "../middleware/loader/babylonLoader";
import {donwLoad} from "../../tools/ossfile";
import { Config } from "../global";

export class AttributesAssets {
    public constructor() {

        var sourceRuntimeOptions = {
            '-1': 'various',
            '0': 'yes',
            '1': 'no'
        };

        var editableTypes = {
            'script': 1,
            'table': 1,
            'html': 1,
            'shader': 1,
            'text': 1,
            'json': 1
        };

        var legacyScripts = false;


        var assetsPanel: Nullable<Panel> = null;


        editor.on('attributes:inspect[asset]', function (assets: Observer[]) {
            var events: any = [];

            // unfold panel
            var panel = editor.call('attributes.rootPanel');
            if (panel.folded)
                panel.folded = false;

            var multi = assets.length > 1;
            var type = ((assets[0].get('source') && assets[0].get('type') !== 'folder') ? 'source ' : '') + assets[0].get('type');

            if (multi) {
                editor.call('attributes:header', assets.length + ' assets');

                for (var i = 0; i < assets.length; i++) {
                    if (type !== ((assets[0].get('source') && assets[0].get('type') !== 'folder') ? 'source ' : '') + assets[i].get('type')) {
                        type = '';
                        break;
                    }
                }
            } else {
                editor.call('attributes:header', type);
            }

            // panel
            var panel = editor.call('attributes:addPanel');
            panel.class.add('component');
            assetsPanel = panel;
            panel.once('destroy', function () {
                assetsPanel = null;

                for (var i = 0; i < events.length; i++)
                    events[i].unbind();

                events = null;
            });

            // 暂时不考虑
            /*
            var allBundles = editor.call('assets:bundles:list');
            var bundlesEnum = { "": "" };
            for (var i = 0; i < allBundles.length; i++) {
                bundlesEnum[allBundles[i].get('id')] = allBundles[i].get('name');
            }
            */

            if (multi) {
                var fieldFilename = editor.call('attributes:addField', {
                    parent: panel,
                    name: 'Assets',
                    value: assets.length
                });

                var scriptSelected = false;



            } else {

                if (legacyScripts && assets[0].get('type') === 'script') {
                    // filename
                    var fieldFilename = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Filename',
                        // type: 'string',
                        link: assets[0],
                        path: 'filename'
                    });
                    // reference
                    editor.call('attributes:reference:attach', 'asset:script:filename', fieldFilename.parent.innerElement.firstChild.ui);

                } else {
                    // id
                    var fieldId = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'ID',
                        link: assets[0],
                        path: 'id'
                    });
                    // reference
                    editor.call('attributes:reference:attach', 'asset:id', fieldId.parent.innerElement.firstChild.ui);

                    // name
                    var fieldName = editor.call('attributes:addField', {
                        parent: panel,
                        name: '名字',
                        type: 'string',
                        value: assets[0].get('name')
                    });
                    events.push(assets[0].on('name:set', function (newName: string) {
                        fieldName.value = newName;
                    }));
                    events.push(fieldName.on('change', function (newName: string) {
                        // console.log('newName: ' + newName);
                        // console.log('name: ' + assets[0].get('name'));
                        if (newName !== assets[0].get('name')) {
                            editor.call('assets:rename', assets[0], newName);
                        }
                    }));
                    fieldName.class.add('asset-name');
                    // reference
                    editor.call('attributes:reference:attach', 'asset:name', fieldName.parent.innerElement.firstChild.ui);

                    if (!assets[0].get('source') && assets[0].get('type') !== 'folder') {
                        // tags
                        var fieldTags = editor.call('attributes:addField', {
                            parent: panel,
                            name: 'Tags',
                            placeholder: 'Add Tag',
                            type: 'tags',
                            tagType: 'string',
                            link: assets[0],
                            path: 'tags'
                        });
                        // reference
                        editor.call('attributes:reference:attach', 'asset:tags', fieldTags.parent.parent.innerElement.firstChild.ui);
                    }

                    // runtime
                    var runtime = sourceRuntimeOptions[assets[0].get('source') ? '1' : '0'];
                    // var runtime = sourceRuntimeOptions['0'];
                    if (assets[0].get('type') === 'folder')
                        runtime = sourceRuntimeOptions['1'];

                    var fieldRuntime = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Runtime',
                        value: runtime
                    });
                    // reference
                    editor.call('attributes:reference:attach', 'asset:runtime', fieldRuntime.parent.innerElement.firstChild.ui);

                    // taskInfo
                    var fieldFailed = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Failed',
                        link: assets[0],
                        path: 'taskInfo'
                    });
                    fieldFailed.class.add('error');

                    var checkFailed = function () {
                        fieldFailed.parent.hidden = assets[0].get('task') !== 'failed' || !assets[0].get('taskInfo');
                    };
                    checkFailed();

                    events.push(assets[0].on('task:set', checkFailed));
                    events.push(assets[0].on('taskInfo:set', checkFailed));
                    events.push(assets[0].on('taskInfo:unset', checkFailed));

                }

                // type
                var fieldType = editor.call('attributes:addField', {
                    parent: panel,
                    name: 'Type',
                    value: type
                });
                // reference
                editor.call('attributes:reference:attach', 'asset:type', fieldType.parent.innerElement.firstChild.ui);
                // reference type
                if (!assets[0].get('source'))
                    editor.call('attributes:reference:asset:' + assets[0].get('type') + ':asset:attach', fieldType);

                if (!(legacyScripts && assets[0].get('type') === 'script') && assets[0].get('type') !== 'folder' && !assets[0].get('source')) {
                    // preload
                    var fieldPreload = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Preload',
                        type: 'checkbox',
                        link: assets[0],
                        path: 'preload'
                    });
                    fieldPreload.parent.class.add('preload');
                    editor.call('attributes:reference:attach', 'asset:preload', fieldPreload.parent.innerElement.firstChild.ui);
                }




                // size
                /*
                if (assets[0].has('file') || assets[0].get('type') === 'bundle') {
                    var size = assets[0].get('type') === 'bundle' ? editor.call('assets:bundles:calculateSize', assets[0]) : assets[0].get('file.size');
                    var fieldSize = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Size',
                        value: bytesToHuman(size)
                    });

                    var evtSize = [];
                    evtSize.push(assets[0].on('file:set', function (value) {
                        fieldSize.text = bytesToHuman(value ? value.size : 0);
                    }));

                    evtSize.push(assets[0].on('file.size:set', function (value) {
                        fieldSize.text = bytesToHuman(value);
                    }));

                    if (assets[0].get('type') === 'bundle') {
                        var recalculateSize = function () {
                            fieldSize.text = bytesToHuman(editor.call('assets:bundles:calculateSize', assets[0]));
                        };

                        evtSize.push(assets[0].on('data.assets:set', recalculateSize));
                        evtSize.push(assets[0].on('data.assets:insert', recalculateSize));
                        evtSize.push(assets[0].on('data.assets:remove', recalculateSize));
                    }

                    panel.once('destroy', function () {
                        for (var i = 0; i < evtSize.length; i++) {
                            evtSize[i].unbind();
                        }
                        evtSize.length = 0;
                    });

                    // reference
                    editor.call('attributes:reference:attach', 'asset:size', fieldSize.parent.innerElement.firstChild.ui);
                }
                */

                // 下载区域按钮
                var panelButtons = new Panel();
                panelButtons.class!.add('buttons');
                panel.append(panelButtons);

                // download
                if (assets[0].get('type') !== 'folder' && !(legacyScripts && assets[0].get('type') === 'script') && assets[0].get('type') !== 'sprite') {
                    // download
                    var btnDownload = new Button();

                    btnDownload.hidden = !editor.call('permissions:read');
                    var evtBtnDownloadPermissions = editor.on('permissions:set:' + 'id', function () {
                        btnDownload.hidden = !editor.call('permissions:read');
                    });

                    btnDownload.text = '下载';
                    btnDownload.class!.add('download-asset', 'large-with-icon');
                    btnDownload.element!.addEventListener('click', function (evt) {
                        // if (btnDownload.prevent)
                        //     return;

                        // 下载
                        if (assets[0].get('source') || assets[0].get('type') === 'texture' || assets[0].get('type') === 'audio'||assets[0].get('type') === 'model') {
                            donwLoad(Config.projectID,assets[0].get('id'),assets[0].get('name'),assets[0].get('file.hash'));
                        } else {
                            window.open('/api/assets/' + assets[0].get('id') + '/download?branchId=' + 'id');
                        }
                    });
                    panelButtons.append(btnDownload);

                    btnDownload.once('destroy', function () {
                        evtBtnDownloadPermissions.unbind();
                    });
                }






            }
        });





        editor.on('attributes:assets:toggleInfo', function (enabled: boolean) {
            if (assetsPanel) {
                assetsPanel.hidden = !enabled;
            }
        });

        editor.method('attributes:assets:panel', function () {
            return assetsPanel;
        });
    }
}