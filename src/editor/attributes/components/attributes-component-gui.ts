import { Observer } from "../../../lib";

export class AttributeComponentGUI {

    public constructor() {

        editor.method('item:drag:allow', (drag: Nullable<Observer>, target: Nullable<Observer>, drag_mode: string) => {
            if (!drag || !target) return true;
            let dragType = drag.get('type');
            let targetType = target.get('type');
            if (dragType === '2d-gui') {
                let dragSubtype = drag.get('subtype');
                if (dragSubtype === 'root') {
                    if (targetType === 'root' && drag_mode === 'inside') {
                        return true;
                    } else if (drag_mode !== 'inside') {
                        if (editor.call('entities:root').get('resource_id') === target.get('parent')) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (targetType === '2d-gui') {
                        let targetSubtype = target.get('subtype');
                        if (drag_mode === 'inside') {
                            if (targetSubtype === 'root' || targetSubtype === 'panel') {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            if (targetSubtype === 'root') {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    } else {
                        return false;
                    }
                }
            } else {
                if (targetType === '2d-gui') {
                    let targetSubtype = target.get('subtype');
                    if (targetSubtype === 'root') {
                        if (drag_mode === 'inside') {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
            return true;
        });

        /*
        var handleTextureHover = function (path: string) {
            var valueOld = null;
            var events = [];

            return {
                over: function (type: string, data) {
                    var i;

                    if (previewTexturesHover !== null)
                        previewTexturesHover[path] = parseInt(data.id, 10);

                    var texture = app.assets.get(parseInt(data.id, 10));
                    app.assets.load(texture);

                    var attachTexture = function (ind) {
                        var engineAsset = app.assets.get(parseInt(assets[ind].get('id'), 10));
                        app.assets.load(engineAsset);

                        if (engineAsset && engineAsset.resource) {
                            valueOld[ind] = engineAsset.resource[path];

                            if (texture.resource) {
                                engineAsset.resource[path] = texture.resource;
                                engineAsset.resource.update();
                            } else {
                                var evt = {
                                    asset: texture,
                                    fn: function () {
                                        engineAsset.resource[path] = texture.resource;
                                        engineAsset.resource.update();
                                    }
                                };
                                events.push(evt);
                                texture.once('load', evt.fn);
                            }
                        }
                    };

                    valueOld = [];
                    for (i = 0; i < assets.length; i++)
                        attachTexture(i);

                    editor.call('viewport:render');

                    if (queueRender)
                        queueRender();
                },
                leave: function () {
                    var i;
                    if (previewTexturesHover !== null)
                        previewTexturesHover = {};

                    if (queueRender)
                        queueRender();

                    if (valueOld === null) return;

                    for (i = 0; i < events.length; i++)
                        events[i].asset.off('load', events[i].fn);
                    events = [];

                    for (i = 0; i < assets.length; i++) {
                        var engineAsset = app.assets.get(parseInt(assets[i].get('id'), 10));
                        app.assets.load(engineAsset);

                        if (engineAsset && engineAsset.resource) {
                            engineAsset.resource[path] = valueOld[i];
                            engineAsset.resource.update();
                        }
                    }
                    editor.call('viewport:render');
                    valueOld = null;
                }
            };
        };
        */

        /*
        var rgxExtension = /\.[a-z]+$/;
        var bulkSlots: any = {
            'ao': ['a', 'ao', 'ambient', 'ambientocclusion', 'gma', 'gmat', 'gmao', 'gmaa', 'rma', 'rmat', 'rmao', 'rmaa'],
            'diffuse': ['d', 'diff', 'diffuse', 'albedo', 'color', 'rgb', 'rgba'],
            'specular': ['s', 'spec', 'specular'],
            'metalness': ['m', 'met', 'metal', 'metalness', 'gma', 'gmat', 'gmao', 'gmaa', 'rma', 'rmat', 'rmao', 'rmaa'],
            'gloss': ['g', 'gloss', 'glossiness', 'gma', 'gmat', 'gmao', 'gmaa', 'rma', 'rmat', 'rmao', 'rmaa'],
            'emissive': ['e', 'emissive'],
            'opacity': ['o', 't', 'opacity', 'alpha', 'transparency', 'gmat', 'gmao', 'gmaa', 'rgba', 'rmat', 'rmao', 'rmaa'],
            'normal': ['n', 'norm', 'normal', 'normals'],
            'height': ['p', 'h', 'height', 'parallax', 'bump'],
            'light': ['l', 'lm', 'light', 'lightmap']
        };
        var postfixToSlot: any = {};
        for (let key in bulkSlots) {
            for (let i = 0; i < bulkSlots[key].length; i++) {
                postfixToSlot[bulkSlots[key][i]] = postfixToSlot[bulkSlots[key][i]] || [];
                postfixToSlot[bulkSlots[key][i]].push(key);
            }
        }

        var tokenizeFilename = function (filename: string) {
            filename = filename.trim().toLowerCase();

            if (!filename)
                return;

            // drop extension
            var ext = filename.match(rgxExtension);
            if (ext) filename = filename.slice(0, -ext[0].length);

            if (!filename)
                return;

            var parts = filename.split(/(\-|_|\.)/g);
            var tokens = [];

            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === '-' || parts[i] === '_' || parts[i] === '.')
                    continue;

                tokens.push(parts[i]);
            }

            if (!tokens.length)
                return;

            if (tokens.length === 1)
                return ['', tokens[0]];

            var left = tokens.slice(0, -1).join('');
            var right = tokens[tokens.length - 1];

            return [left, right];
        };

        var onTextureBulkSet = function (asset: Observer, oldValues: any, slot: string) {
            var tokens = tokenizeFilename(asset.get('name'));
            if (!tokens)
                return;

            if (bulkSlots[slot].indexOf(tokens[1]) === -1)
                return;

            var path = asset.get('path');
            var textures = editor.call('assets:find', function (texture: Observer) {
                return texture.get('type') === 'texture' && !texture.get('source') && texture.get('path').equals(path);
            });

            var candidates: any = {};
            for (var i = 0; i < textures.length; i++) {
                var t = tokenizeFilename(textures[i][1].get('name'));

                if (!t || t[0] !== tokens[0] || !postfixToSlot[t[1]])
                    continue;

                for (var s = 0; s < postfixToSlot[t[1]].length; s++) {
                    if (postfixToSlot[t[1]][s] === slot)
                        continue;

                    candidates[postfixToSlot[t[1]][s]] = {
                        texture: textures[i][1],
                        postfix: t[1]
                    };
                }
            }

            if (!Object.keys(candidates).length)
                return;

            var records: any = [];

            for (var a = 0; a < assets.length; a++) {
                if (oldValues[assets[a].get('id')])
                    continue;

                var history = assets[a].history.enabled;
                assets[a].history.enabled = false;

                for (var s in candidates) {
                    var key = 'data.' + s + 'Map';

                    if (assets[a].get(key))
                        continue;

                    var panel = texturePanels[s];
                    if (panel) panel.folded = false;

                    var id = parseInt(candidates[s].texture.get('id'), 10);
                    assets[a].set(key, id);

                    records.push({
                        id: assets[a].get('id'),
                        key: key,
                        value: id,
                        old: null
                    });

                    if (s === 'ao') {
                        // ao can be in third color channel
                        if (/^(g|r)ma/.test(candidates[s].postfix)) {
                            var channel = assets[a].get('data.aoMapChannel');
                            if (channel !== 'b') {
                                assets[a].set('data.aoMapChannel', 'b');

                                records.push({
                                    id: assets[a].get('id'),
                                    key: 'data.aoMapChannel',
                                    value: 'b',
                                    old: channel
                                });
                            }
                        }
                    } else if (s === 'metalness') {
                        // use metalness
                        if (!assets[a].get('data.useMetalness')) {
                            assets[a].set('data.useMetalness', true);

                            records.push({
                                id: assets[a].get('id'),
                                key: 'data.useMetalness',
                                value: true,
                                old: false
                            });
                        }

                        // metalness to maximum
                        var metalness = assets[a].get('data.metalness');
                        if (metalness !== 1) {
                            assets[a].set('data.metalness', 1.0);

                            records.push({
                                id: assets[a].get('id'),
                                key: 'data.metalness',
                                value: 1.0,
                                old: metalness
                            });
                        }

                        // metalness can be in second color channel
                        if (/^(g|r)ma/.test(candidates[s].postfix)) {
                            var channel = assets[a].get('data.metalnessMapChannel');
                            if (channel !== 'g') {
                                assets[a].set('data.metalnessMapChannel', 'g');

                                records.push({
                                    id: assets[a].get('id'),
                                    key: 'data.metalnessMapChannel',
                                    value: 'g',
                                    old: channel
                                });
                            }
                        }
                    } else if (s === 'gloss') {
                        // gloss to maximum
                        var shininess = assets[a].get('data.shininess');
                        if (shininess !== 100) {
                            assets[a].set('data.shininess', 100.0);

                            records.push({
                                id: assets[a].get('id'),
                                key: 'data.shininess',
                                value: 100.0,
                                old: shininess
                            });
                        }

                        // gloss shall be in first color channel
                        var channel = assets[a].get('data.glossMapChannel');
                        if (channel !== 'r') {
                            assets[a].set('data.glossMapChannel', 'r');

                            records.push({
                                id: assets[a].get('id'),
                                key: 'data.glossMapChannel',
                                value: 'r',
                                old: channel
                            });
                        }
                    } else if (s === 'opacity') {
                        // opacity can be in fourth color channel
                        if (/^(gma|rma|rgb)(t|o|a)$/.test(candidates[s].postfix)) {
                            var channel = assets[a].get('data.opacityMapChannel');
                            if (channel !== 'a') {
                                assets[a].set('data.opacityMapChannel', 'a');

                                records.push({
                                    id: assets[a].get('id'),
                                    key: 'data.opacityMapChannel',
                                    value: 'a',
                                    old: channel
                                });
                            }
                        }
                    }
                }

                assets[a].history.enabled = history;
            }

            // if (records.length) {
            //     editor.call('history:add', {
            //         name: 'material textures auto-bind',
            //         undo: function () {
            //             for (var i = 0; i < records.length; i++) {
            //                 var asset = editor.call('assets:get', records[i].id);
            //                 if (!asset)
            //                     continue;

            //                 var history = asset.history.enabled;
            //                 asset.history.enabled = false;
            //                 asset.set(records[i].key, records[i].old);
            //                 asset.history.enabled = history;
            //             }
            //         },
            //         redo: function () {
            //             for (var i = 0; i < records.length; i++) {
            //                 var asset = editor.call('assets:get', records[i].id);
            //                 if (!asset)
            //                     continue;

            //                 var history = asset.history.enabled;
            //                 asset.history.enabled = false;
            //                 asset.set(records[i].key, records[i].value);
            //                 asset.history.enabled = history;
            //             }
            //         }
            //     });
            // }
        };
        */

        editor.on('attributes:inspect[entity]', function (entities: Observer[]) {
            if (entities.length !== 1 || entities[0].get('type') !== '2d-gui')
                return;

            // console.log('attributes:inspect[entity] GUI');

            var panelComponents = editor.call('attributes:entity.panelComponents');
            if (!panelComponents)
                return;

            // console.warn(panelComponents);
            if (entities.length === 1) {
                editor.call('attributes:header', 'GUI属性');
            }

            var projectSettings = editor.call('settings:project');

            var panel = editor.call('attributes:entity:addComponentPanel', {
                title: '2D界面属性',
                name: '2d-gui',
                entities: entities
            });

            // 隐藏小标题
            panel.headerElement.style.display = 'none';

            // isVisible
            var isVisible = editor.call('attributes:addField', {
                parent: panel,
                name: '激活',
                type: 'checkbox',
                link: entities,
                path: 'gui.isVisible'
            });

            // name
            var name = editor.call('attributes:addField', {
                parent: panel,
                name: '名字',
                type: 'string',
                trim: true,
                link: entities,
                path: 'name'
            });

            // xType
            var xType = editor.call('attributes:addField', {
                parent: panel,
                name: '位置X单位类型',
                type: 'number',
                enum: [
                    { v: 0, t: '像素' }, // pc.PROJECTION_PERSPECTIVE
                    { v: 1, t: '百分比' } // pc.PROJECTION_ORTHOGRAPHIC
                ],
                link: entities,
                path: 'gui.xType'
            });

            // x
            var x = editor.call('attributes:addField', {
                parent: panel,
                name: '位置X',
                type: 'number',
                link: entities,
                path: 'gui.x'
            });

            // yType
            var yType = editor.call('attributes:addField', {
                parent: panel,
                name: '位置Y单位类型',
                type: 'number',
                enum: [
                    { v: 0, t: '像素' }, // pc.PROJECTION_PERSPECTIVE
                    { v: 1, t: '百分比' } // pc.PROJECTION_ORTHOGRAPHIC
                ],
                link: entities,
                path: 'gui.yType'
            });

            // y
            var y = editor.call('attributes:addField', {
                parent: panel,
                name: '位置Y',
                type: 'number',
                link: entities,
                path: 'gui.y'
            });

            // widthType
            var widthType = editor.call('attributes:addField', {
                parent: panel,
                name: '宽度单位类型',
                type: 'number',
                enum: [
                    { v: 0, t: '像素' }, // pc.PROJECTION_PERSPECTIVE
                    { v: 1, t: '百分比' } // pc.PROJECTION_ORTHOGRAPHIC
                ],
                link: entities,
                path: 'gui.widthType'
            });

            // width
            var width = editor.call('attributes:addField', {
                parent: panel,
                name: '宽度',
                type: 'number',
                link: entities,
                path: 'gui.width'
            });

            // heightType
            var heightType = editor.call('attributes:addField', {
                parent: panel,
                name: '高度单位类型',
                type: 'number',
                enum: [
                    { v: 0, t: '像素' },
                    { v: 1, t: '百分比' }
                ],
                link: entities,
                path: 'gui.heightType'
            });

            // height
            var height = editor.call('attributes:addField', {
                parent: panel,
                name: '高度',
                type: 'number',
                link: entities,
                path: 'gui.height'
            });

            // horizontal_alignment
            var horizontal_alignment = editor.call('attributes:addField', {
                parent: panel,
                name: '水平对齐方式',
                type: 'number',
                enum: [
                    { v: 0, t: '居左' },
                    { v: 1, t: '居右' },
                    { v: 2, t: '居中' }
                ],
                link: entities,
                path: 'gui.horizontal_alignment'
            });

            // vertical_alignment
            var vertical_alignment = editor.call('attributes:addField', {
                parent: panel,
                name: '垂直对齐方式',
                type: 'number',
                enum: [
                    { v: 0, t: '居上' },
                    { v: 1, t: '居下' },
                    { v: 2, t: '居中' }
                ],
                link: entities,
                path: 'gui.vertical_alignment'
            });

            // alpha
            var alpha = editor.call('attributes:addField', {
                parent: panel,
                name: '透明度',
                // placeholder: '\u00B0',
                // placeholder: '弧度',
                type: 'number',
                precision: 2,
                step: 1,
                min: 0,
                link: entities,
                path: 'gui.alpha'
            });
            alpha.style.width = '32px';

            // alpha slider
            var alphaSlider = editor.call('attributes:addField', {
                panel: alpha.parent,
                precision: 2,
                step: 1,
                min: 0,
                max: 1,
                type: 'number',
                slider: true,
                link: entities,
                path: 'gui.alpha'
            });
            alphaSlider.flexGrow = 4;

            // rotation
            var rotation = editor.call('attributes:addField', {
                parent: panel,
                name: '旋转角度',
                // placeholder: '\u00B0',
                // placeholder: '弧度',
                type: 'number',
                precision: 2,
                step: 1,
                min: 0,
                link: entities,
                path: 'gui.rotation'
            });
            rotation.style.width = '32px';

            // rotation slider
            var rotationSlider = editor.call('attributes:addField', {
                panel: rotation.parent,
                precision: 2,
                step: 1,
                min: 0,
                max: 360,
                type: 'number',
                slider: true,
                link: entities,
                path: 'gui.rotation'
            });
            rotationSlider.flexGrow = 4;

            // isVisible
            var isHighlighted = editor.call('attributes:addField', {
                parent: panel,
                name: '显示元素边界',
                type: 'checkbox',
                link: entities,
                path: 'gui.isHighlighted'
            });

            if (entities[0].node instanceof BABYLON.GUI.AdvancedDynamicTexture) {

                // zIndex
                // var zIndex = editor.call('attributes:addField', {
                //     parent: panelButton,
                //     name: '画布深度',
                //     type: 'number',
                //     link: entities,
                //     path: 'gui.zIndex'
                // });

            } else if (entities[0].node instanceof BABYLON.GUI.Button) {

                var panelButton = editor.call('attributes:entity:addComponentPanel', {
                    title: '按钮 Button',
                    name: '2d-gui',
                    entities: entities
                });

                // background color
                var backgroundColor = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '背景色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.background'
                });

                // foreground color
                var foregroundColor = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '边框色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.color'
                });

                // text color
                var textColor = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '字体颜色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.textColor'
                });

                // text
                var text = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '文字',
                    type: 'string',
                    trim: false,
                    link: entities,
                    path: 'gui.text'
                });

                // fontSize
                var fontSize = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '字体大小',
                    type: 'number',
                    link: entities,
                    path: 'gui.fontSize'
                });

                var image = editor.call('attributes:addField', {
                    parent: panelButton,
                    type: 'asset',
                    kind: 'texture',
                    name: '图片',
                    link: entities,
                    path: 'gui.source',
                    // over: fieldDiffuseMapHover.over,
                    // leave: fieldDiffuseMapHover.leave,
                    onSet: function (asset: Observer, oldValues: any) {
                        // console.error(asset);
                        // console.error(oldValues);
                        // onTextureBulkSet(asset, oldValues, 'source');
                    }
                });

                // thickness
                var thickness = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '边框厚度',
                    type: 'number',
                    link: entities,
                    path: 'gui.thickness'
                });

                // cornerRadius
                var cornerRadius = editor.call('attributes:addField', {
                    parent: panelButton,
                    name: '边框圆角半径',
                    type: 'number',
                    link: entities,
                    path: 'gui.cornerRadius'
                });
            } else if (entities[0].node instanceof BABYLON.GUI.Rectangle) {
                var panelContainer = editor.call('attributes:entity:addComponentPanel', {
                    title: '容器 Container',
                    name: '2d-gui',
                    entities: entities
                });

                // background color
                var backgroundColor = editor.call('attributes:addField', {
                    parent: panelContainer,
                    name: '背景色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.background'
                });

                // foreground color
                var foregroundColor = editor.call('attributes:addField', {
                    parent: panelContainer,
                    name: '边框色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.color'
                });

                // thickness
                var thickness = editor.call('attributes:addField', {
                    parent: panelContainer,
                    name: '边框厚度',
                    type: 'number',
                    link: entities,
                    path: 'gui.thickness'
                });

                // cornerRadius
                var cornerRadius = editor.call('attributes:addField', {
                    parent: panelContainer,
                    name: '边框圆角半径',
                    type: 'number',
                    link: entities,
                    path: 'gui.cornerRadius'
                });

            } else if (entities[0].node instanceof BABYLON.GUI.TextBlock) {
                var panelText = editor.call('attributes:entity:addComponentPanel', {
                    title: '文字 Text',
                    name: '2d-gui',
                    entities: entities
                });

                // foreground color
                var foregroundColor = editor.call('attributes:addField', {
                    parent: panelText,
                    name: '文字颜色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.color'
                });

                // text
                var text = editor.call('attributes:addField', {
                    parent: panelText,
                    name: '文字',
                    type: 'string',
                    trim: false,
                    link: entities,
                    path: 'gui.text'
                });

                // fontSize
                var fontSize = editor.call('attributes:addField', {
                    parent: panelText,
                    name: '字体大小',
                    type: 'number',
                    link: entities,
                    path: 'gui.fontSize'
                });

                // textHorizontalAlignment
                var textHorizontalAlignment = editor.call('attributes:addField', {
                    parent: panelText,
                    name: '文字水平对齐',
                    type: 'number',
                    enum: [
                        { v: 0, t: '居左' },
                        { v: 1, t: '居右' },
                        { v: 2, t: '居中' }
                    ],
                    link: entities,
                    path: 'gui.textHorizontalAlignment'
                });

                // textVerticalAlignment
                var textVerticalAlignment = editor.call('attributes:addField', {
                    parent: panelText,
                    name: '文字垂直对齐',
                    type: 'number',
                    enum: [
                        { v: 0, t: '居上' },
                        { v: 1, t: '居下' },
                        { v: 2, t: '居中' }
                    ],
                    link: entities,
                    path: 'gui.textVerticalAlignment'
                });

                // textWrapping
                var textWrapping = editor.call('attributes:addField', {
                    parent: panelText,
                    name: '文字环绕方式',
                    type: 'number',
                    enum: [
                        { v: 0, t: '裁剪显示' },
                        { v: 1, t: '自动换行' },
                        { v: 2, t: '省略显示' }
                    ],
                    link: entities,
                    path: 'gui.textWrapping'
                });

            } else if (entities[0].node instanceof BABYLON.GUI.InputText) {
                var panelInput = editor.call('attributes:entity:addComponentPanel', {
                    title: '输入框 Input',
                    name: '2d-gui',
                    entities: entities
                });

                // background color
                var backgroundColor = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '背景色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.background'
                });

                // foreground color
                var foregroundColor = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '文字颜色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.color'
                });

                // text
                var text = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '文字',
                    type: 'string',
                    trim: false,
                    link: entities,
                    path: 'gui.text'
                });

                // fontSize
                var fontSize = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '字体大小',
                    type: 'number',
                    link: entities,
                    path: 'gui.fontSize'
                });

                // placeholderText
                var placeholderText = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '预留文字',
                    type: 'string',
                    trim: false,
                    link: entities,
                    path: 'gui.placeholderText'
                });

                // placeholderColor
                var placeholderColor = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '预留文字颜色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.placeholderColor'
                });

                // focusedBackground
                var focusedBackground = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '聚焦背景色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.focusedBackground'
                });

                // thickness
                var thickness = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '边框厚度',
                    type: 'number',
                    link: entities,
                    path: 'gui.thickness'
                });
            } else if (entities[0].node instanceof BABYLON.GUI.RadioButton) {
                var panelCheckbox = editor.call('attributes:entity:addComponentPanel', {
                    title: '复选框 Checkbox',
                    name: '2d-gui',
                    entities: entities
                });

                // background color
                var backgroundColor = editor.call('attributes:addField', {
                    parent: panelCheckbox,
                    name: '背景色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.background'
                });

                // foreground color
                var foregroundColor = editor.call('attributes:addField', {
                    parent: panelCheckbox,
                    name: '前景色',
                    type: 'rgb',
                    link: entities,
                    path: 'gui.color'
                });

                // value
                var value = editor.call('attributes:addField', {
                    parent: panelCheckbox,
                    name: '值',
                    type: 'checkbox',
                    link: entities,
                    path: 'gui.isChecked'
                });

                // thickness
                var thickness = editor.call('attributes:addField', {
                    parent: panelInput,
                    name: '边框厚度',
                    type: 'number',
                    link: entities,
                    path: 'gui.thickness'
                });
            } else if (entities[0].node instanceof BABYLON.GUI.Image) {
                var panelImage = editor.call('attributes:entity:addComponentPanel', {
                    title: '图片 Image',
                    name: '2d-gui',
                    entities: entities
                });

                // image
                // var fieldDiffuseMapHover = handleTextureHover('diffuseMap');
                var image = editor.call('attributes:addField', {
                    parent: panelImage,
                    type: 'asset',
                    kind: 'texture',
                    name: '图片',
                    link: entities,
                    path: 'gui.source',
                    // over: fieldDiffuseMapHover.over,
                    // leave: fieldDiffuseMapHover.leave,
                    onSet: function (asset: Observer, oldValues: any) {
                        // console.error(asset);
                        // console.error(oldValues);
                        // onTextureBulkSet(asset, oldValues, 'source');
                    }
                });
                // fieldDiffuseMap.parent.class.add('channel');
                // fieldDiffuseMap.on('change', function (value: any) {
                //     fieldDiffuseOffset[0].parent.hidden = filterDiffuseOffset();
                //     fieldDiffuseTiling[0].parent.hidden = filterDiffuseTiling();
                // });
            }












        });
    }


}