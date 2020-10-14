import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
import { GUIManager } from '../gui';
import { GUID, Tools } from '../utility';

export class EntityCreate {


    public constructor() {

        var createNewEntityData = function (defaultData: any, parentResourceId: string) {
            var entityData = {
                name: defaultData.name || '空物体',
                tags: [],
                enabled: true,
                resource_id: defaultData.resource_id || GUID.create(),
                parent: parentResourceId,
                children: Array<string>(),
                position: defaultData.position || [0, 0, 0],
                rotation: defaultData.rotation || [0, 0, 0],
                scale: defaultData.scale || [1, 1, 1],
                // components: defaultData.components || {},
                // __postCreationCallback: defaultData.postCreationCallback,
                root: false,
                type: defaultData.type,
                asset: defaultData.asset || ''
            };

            // if (defaultData.children) {
            //     for (var i = 0; i < defaultData.children.length; i++) {
            //         var childEntityData = createNewEntityData(defaultData.children[i], entityData.resource_id);
            //         entityData.children.push(childEntityData);
            //     }
            // }

            return entityData;
        };


        editor.method('entity:new:babylon', (defaultData: any) => {
            defaultData = defaultData || {};
            // var parent = defaultData.parent;
            // var parent = editor.call('entities:root');

            // if (parent === '' || parent === undefined) {
            //     parent = editor.call('entities:root').get('resource_id');
            // }

            // console.log(editor.call('entities:root'));
            // console.log(defaultData.parent);
            // console.log(defaultData);

            // var data = createNewEntityData(defaultData, parent.get('resource_id'));

            // create new Entity data
            var entity = new Observer(defaultData);

            editor.call('entities:add', entity);
            // editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);

            return entity;
        });

        editor.method('entities:new', function (defaultData: any) {
            // get root if parent is null
            defaultData = defaultData || {};
            // var parent = defaultData.parent || editor.call('entities:root');

            // TODO: 一堆mesh过来，有的创建了，有的没创建怎么办
            var parent = editor.call('entities:get', defaultData.parent) || editor.call('entities:root');

            // var data = createNewEntityData(defaultData, parent.get('resource_id'));

            var selectorType: string, selectorItems: Observer[];

            if (!defaultData.noHistory) {
                selectorType = editor.call('selector:type');
                selectorItems = editor.call('selector:items');
                if (selectorType === 'entity') {
                    // TODO
                    for (var i = 0; i < selectorItems.length; i++)
                        selectorItems[i] = selectorItems[i].get('resource_id');
                }
            }

            // create new Entity data
            // console.error(defaultData);
            var entity = new Observer(defaultData);

            editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);
            // console.error(entity);
            // history
            if (!defaultData.noHistory) {
                var resourceId = entity.get('resource_id');
                var parentId = parent.get('resource_id');

                editor.call('history:add', {
                    name: 'new entity ' + resourceId,
                    undo: function () {
                        var entity = editor.call('entities:get', resourceId);
                        if (!entity)
                            return;

                        editor.call('entities:removeEntity', entity);

                        if (selectorType === 'entity' && selectorItems.length) {
                            var items = [];
                            for (var i = 0; i < selectorItems.length; i++) {
                                var item = editor.call('entities:get', selectorItems[i]);
                                if (item)
                                    items.push(item);
                            }

                            if (items.length) {
                                editor.call('selector:history', false);
                                editor.call('selector:set', selectorType, items);
                                editor.once('selector:change', function () {
                                    editor.call('selector:history', true);
                                });
                            }
                        }
                    },
                    redo: function () {
                        var parent = editor.call('entities:get', parentId);
                        if (!parent)
                            return;

                        // var entity = new Observer(data);
                        var entity = new Observer(defaultData);
                        editor.call('entities:addEntity', entity, parent, true);
                    }
                });
            }

            return entity;
        });

        editor.method('entities:editor:new', function (defaultData: any) {

            defaultData = defaultData || {};

            // console.log('type: ' + defaultData.type);
            // console.warn(defaultData.parent);

            let parent = defaultData.parent || editor.call('entities:root');

            if (defaultData.type) {

                let entityData = createEntityDataFromEditor(defaultData.type, defaultData.subtype, parent.get('resource_id'));
                var entity = new Observer(entityData);
                let instance = createEntityInstance(defaultData.type, defaultData.subtype, entity);

                editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);

                editor.call('selector:set', 'entity', [entity]);

                // if (defaultData.type === 'empty') {

                // } else if (defaultData.type === 'primitive') {
                //     if (defaultData.subtype === 'box') {

                //     } else if (defaultData.subtype === 'sphere') {

                //     } else if (defaultData.subtype === 'plane') {

                //     } else if (defaultData.subtype === 'cylinder') {

                //     }
                // } else if (defaultData.type === 'light') {
                //     if (defaultData.subtype === 'hemispheric') {

                //     } else if (defaultData.subtype === 'directional') {

                //     } else if (defaultData.subtype === 'point') {

                //     } else if (defaultData.subtype === 'spot') {

                //     }
                // } else if (defaultData.type === 'camera') {

                // }
            }


        });


        let typeToName: { [key: string]: string } = {
            'empty': '空物体',
            'box': '立方体',
            'sphere': '球体',
            'plane': '平面',
            'cylinder': '圆柱体',
            'hemispheric': '环境光',
            'directional': '平行光',
            'point': '点光源',
            'spot': '聚光灯',
            'camera': '摄像机'
        }


        let createEntityDataFromEditor = (type: string, subtype: string, parentResourceId: string) => {

            var entityData: { [key: string]: any } = {
                name: typeToName[type] || typeToName[subtype] || '空物体',
                type: type,
                subtype: subtype,
                resource_id: GUID.create(),
                parent: parentResourceId,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                enabled: true,
                tags: Array<string>(),
                children: Array<string>(),
            };

            if (type === 'primitive') {
                entityData.checkCollisions = false;
                entityData.pickable = true;
                entityData.isVisible = true;
                entityData.material_id = '';
            } else if (type === 'light') {
                entityData.position = [300, 300, 300];
                if (subtype === 'directional') {
                    entityData.rotation = [50, -30, 0];
                }
            } else if (type === 'camera') {
                entityData.position = [0, 100, -200];
                entityData.mode = 0;
                entityData.fov = 0.8;
                entityData.inertia = 0.9;
                entityData.orthoSize = 0.5;
                entityData.ellipsoid = [0.5, 1, 0.5];
                entityData.ellipsoidOffset = [0, 0, 0];
                entityData.checkCollisions = true;
                entityData.applyGravity = true;
                entityData.minZ = 1;
                entityData.maxZ = 20000;
                entityData.priority = 0;
                entityData.viewport = [0, 0, 1, 1];
                entityData.clearColor = [0.176, 0.569, 0.729, 1];
            }

            return entityData;
        }

        let createEntityInstance = (type: string, subtype: string, entity: Observer) => {

            if (type === 'empty') {
                let empty = new BABYLON.TransformNode(entity.get('name'), VeryEngine.viewScene);
                entity.node = empty;
                empty.id = entity.get('resource_id');
                empty.position = BABYLON.Vector3.FromArray(entity.get('position'));
                empty.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                empty.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                empty.isEnabled(entity.get('enabled'));
                return empty;
            } else if (type === 'primitive') {
                if (subtype === 'box') {
                    var box = BABYLON.MeshBuilder.CreateBox(entity.get('name'), { size: 100 }, VeryEngine.viewScene);
                    entity.node = box;
                    box.id = entity.get('resource_id');
                    box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    if (entity.has('checkCollisions')) {
                        box.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        box.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        box.isVisible = entity.get('isVisible');
                    }
                    return box;
                } else if (subtype === 'sphere') {
                    var sphere = BABYLON.MeshBuilder.CreateSphere(entity.get('name'), { segments: 20, diameter: 100 }, VeryEngine.viewScene);
                    entity.node = sphere;
                    sphere.id = entity.get('resource_id');
                    sphere.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    sphere.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    sphere.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    if (entity.has('checkCollisions')) {
                        sphere.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        sphere.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        sphere.isVisible = entity.get('isVisible');
                    }
                    return sphere;
                } else if (subtype === 'plane') {
                    var plane = BABYLON.MeshBuilder.CreateGround(entity.get('name'), { width: 5000, height: 5000, subdivisions: 10 }, VeryEngine.viewScene);
                    entity.node = plane;
                    plane.id = entity.get('resource_id');
                    plane.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    plane.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    plane.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    if (entity.has('checkCollisions')) {
                        plane.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        plane.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        plane.isVisible = entity.get('isVisible');
                    }
                    return plane;
                } else if (subtype === 'cylinder') {
                    var cylinder = BABYLON.MeshBuilder.CreateCylinder(entity.get('name'), { height: 200, diameter: 100 }, VeryEngine.viewScene);
                    entity.node = cylinder;
                    cylinder.id = entity.get('resource_id');
                    cylinder.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    cylinder.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    cylinder.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    if (entity.has('checkCollisions')) {
                        cylinder.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        cylinder.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        cylinder.isVisible = entity.get('isVisible');
                    }
                    return cylinder;
                }
            }
            return null;
        }

        editor.method('entities:2D-GUI:new', function (defaultData: any) {

            defaultData = defaultData || {};

            // console.log('type: ' + defaultData.type);
            // console.warn(defaultData.parent);

            let parent = defaultData.parent || editor.call('entities:root');

            // 若为root
            // // 若为sub root
            // 直接创建sub root；
            // // 若为其他element
            if (parent.get('type') === 'root') {
                if (defaultData.subtype === 'root') {
                    let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, parent.get('resource_id'));
                    var entity = new Observer(entityData);
                    let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                    editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);

                    editor.call('selector:set', 'entity', [entity]);
                } else {
                    // 其他ui元素
                    let activeCanvas = GUIManager.getActiveCanvas();
                    if (activeCanvas) {
                        let id = GUIManager.getActiveID();
                        let newParent = editor.call('entities:get', id);
                        let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, newParent.get('resource_id'));
                        var entity = new Observer(entityData);
                        let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                        editor.call('entities:addEntity', entity, newParent, !defaultData.noSelect);

                        editor.call('selector:set', 'entity', [entity]);
                    } else {
                        // 先创建canvas
                        editor.call('entities:2D-GUI:new', { parent: editor.call('entities:root'), type: '2d-gui', subtype: 'root' });
                        let activeCanvas = GUIManager.getActiveCanvas();
                        let id = GUIManager.getActiveID();
                        let newParent = editor.call('entities:get', id);
                        let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, newParent.get('resource_id'));
                        var entity = new Observer(entityData);
                        let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                        editor.call('entities:addEntity', entity, newParent, !defaultData.noSelect);

                        editor.call('selector:set', 'entity', [entity]);
                    }
                }
            } else {
                if (defaultData.subtype === 'root') {
                    let newParent = editor.call('entities:root');
                    let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, newParent.get('resource_id'));
                    var entity = new Observer(entityData);
                    let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                    editor.call('entities:addEntity', entity, newParent, !defaultData.noSelect);

                    editor.call('selector:set', 'entity', [entity]);
                } else {
                    if (parent.node instanceof BABYLON.Node) {
                        // 其他ui元素
                        let activeCanvas = GUIManager.getActiveCanvas();
                        if (activeCanvas) {
                            let id = GUIManager.getActiveID();
                            let newParent = editor.call('entities:get', id);
                            let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, newParent.get('resource_id'));
                            var entity = new Observer(entityData);
                            let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                            editor.call('entities:addEntity', entity, newParent, !defaultData.noSelect);

                            editor.call('selector:set', 'entity', [entity]);
                        } else {
                            // 先创建canvas
                            editor.call('entities:2D-GUI:new', { parent: editor.call('entities:root'), type: '2d-gui', subtype: 'root' });
                            let activeCanvas = GUIManager.getActiveCanvas();
                            let id = GUIManager.getActiveID();
                            let newParent = editor.call('entities:get', id);
                            let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, newParent.get('resource_id'));
                            var entity = new Observer(entityData);
                            let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                            editor.call('entities:addEntity', entity, newParent, !defaultData.noSelect);

                            editor.call('selector:set', 'entity', [entity]);
                        }
                    } else if (parent.node instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, parent.get('resource_id'));
                        var entity = new Observer(entityData);
                        let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                        editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);

                        editor.call('selector:set', 'entity', [entity]);
                    } else if (parent.node instanceof BABYLON.GUI.Control) {
                        if (parent.node instanceof BABYLON.GUI.Rectangle && !(parent.node instanceof BABYLON.GUI.Button)) {
                            let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, parent.get('resource_id'));
                            var entity = new Observer(entityData);
                            let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                            editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);

                            editor.call('selector:set', 'entity', [entity]);
                        } else {
                            // 获取父物体，只允许rectangle，button不允许，根据ui container元素获取entity
                            // console.error((<BABYLON.GUI.Control>(parent.node)).parent);
                            let container = getContainerParent(<BABYLON.GUI.Control>(parent.node));
                            // console.warn(container);
                            if (container) {
                                let parentID = GUIManager.getResourceID(container.uniqueId);
                                // console.log(parentID);
                                if (parentID) {
                                    let newParent = editor.call('entities:get', parentID);
                                    if (newParent) {
                                        let entityData = createEntityDataFor2DGUI(defaultData.type, defaultData.subtype, newParent.get('resource_id'));
                                        var entity = new Observer(entityData);
                                        let instance = create2DGUIEntityInstance(defaultData.type, defaultData.subtype, entity);

                                        editor.call('entities:addEntity', entity, newParent, !defaultData.noSelect);

                                        editor.call('selector:set', 'entity', [entity]);
                                    }
                                }
                            }
                        }
                    } else {
                        console.error('当前类型还未考虑');
                        console.error(parent.node);
                    }
                }
            }

        });

        let getContainerParent = (control: BABYLON.GUI.Control): BABYLON.GUI.Rectangle | BABYLON.GUI.AdvancedDynamicTexture | null => {
            if (control.parent === null) return null;
            if (control.parent instanceof BABYLON.GUI.Container && control.parent.name === 'root' && !control.parent.parent) {
                return control.parent.host;
            } else if (control.parent instanceof BABYLON.GUI.Rectangle && !(control.parent instanceof BABYLON.GUI.Button)) {
                return control.parent;
            } else {
                return getContainerParent(control.parent!);
            }
        }

        let typeToName2DGui: { [key: string]: string } = {
            'root': '2D画布',
            'panel': '容器',
            'button': '按钮',
            'image': '图片',
            'text': '文字',
            'input': '输入框',
            'checkbox': '复选框'
        }

        let createEntityDataFor2DGUI = (type: string, subtype: string, parentResourceId: string) => {
            var entityData: { [key: string]: any } = {
                name: typeToName2DGui[type] || typeToName2DGui[subtype] || '2D画布',
                type: type,
                subtype: subtype,
                resource_id: GUID.create(),
                enabled: true,
                parent: parentResourceId,
                parent_gui: parentResourceId,
                gui: {
                    isVisible: true,
                    xType: 0,
                    x: 0,
                    yType: 0,
                    y: 0,
                    widthType: 0,
                    width: 100,
                    heightType: 0,
                    height: 30,
                    scaleX: 1,
                    scaleY: 1,
                    horizontal_alignment: 2,
                    vertical_alignment: 2,
                    alpha: 1,
                    color: [1, 1, 1, 1],
                    rotation: 0,
                    isHighlighted: false
                },
                children: Array<string>(),
            };

            if (subtype === 'root') {
                entityData.gui.widthType = 1;
                entityData.gui.width = 100;
                entityData.gui.heightType = 1;
                entityData.gui.height = 100;
                // entityData.gui.zIndex = 0;
            } else if (subtype === 'panel') {
                entityData.gui.widthType = 1;
                entityData.gui.width = 60;
                entityData.gui.heightType = 1;
                entityData.gui.height = 80;
                entityData.gui.color = [1, 1, 1, 1];
                entityData.gui.background = [1, 1, 1, 0.3922];
                entityData.gui.thickness = 1;
                entityData.gui.cornerRadius = 10;

            } else if (subtype === 'button') {
                entityData.gui.widthType = 0;
                entityData.gui.width = 120;
                entityData.gui.heightType = 0;
                entityData.gui.height = 30;
                entityData.gui.color = [1, 1, 1, 1];
                entityData.gui.background = [1, 1, 1, 1];
                entityData.gui.thickness = 1;
                entityData.gui.cornerRadius = 4;
                entityData.gui.text = '按钮';
                entityData.gui.fontSize = 18;
                entityData.gui.textColor = [0, 0, 0, 1];
                entityData.gui.source = '';
            } else if (subtype === 'image') {
                entityData.gui.widthType = 0;
                entityData.gui.width = 100;
                entityData.gui.heightType = 0;
                entityData.gui.height = 100;
                entityData.gui.color = [1, 1, 1, 1];
                entityData.gui.source = '';

            } else if (subtype === 'text') {
                entityData.gui.widthType = 0;
                entityData.gui.width = 160;
                entityData.gui.heightType = 0;
                entityData.gui.height = 30;
                entityData.gui.color = [0, 0, 0, 1];
                entityData.gui.fontSize = 18;
                entityData.gui.text = '文字';
                entityData.gui.textHorizontalAlignment = 0;
                entityData.gui.textVerticalAlignment = 2;
                entityData.gui.textWrapping = 1;

            } else if (subtype === 'input') {
                entityData.gui.widthType = 0;
                entityData.gui.width = 160;
                entityData.gui.heightType = 0;
                entityData.gui.height = 30;
                entityData.gui.color = [0, 0, 0, 1];
                entityData.gui.background = [1, 1, 1, 1];
                entityData.gui.thickness = 1;
                entityData.gui.fontSize = 18;
                entityData.gui.placeholderColor = [0, 0, 0, 0.3922];
                entityData.gui.placeholderText = '输入...';
                entityData.gui.focusedBackground = [0.502, 0.502, 0.502, 1];
                entityData.gui.text = '';

            } else if (subtype === 'checkbox') {
                entityData.gui.widthType = 0;
                entityData.gui.width = 20;
                entityData.gui.heightType = 0;
                entityData.gui.height = 20;
                entityData.gui.color = [0.502, 0.502, 0.502, 1];
                entityData.gui.background = [1, 1, 1, 1];
                entityData.gui.thickness = 2;
                entityData.gui.isChecked = true;
            }

            return entityData;
        };

        let create2DGUIEntityInstance = (type: string, subtype: string, entity: Observer) => {

            if (subtype === 'root') {
                let canvas2D = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(entity.get('name'));
                GUIManager.add2DCanvas(entity.get('resource_id'), canvas2D);
                entity.node = canvas2D;
                // console.log(canvas2D.uniqueId + ': ' + entity.get('resource_id'));
                // if (entity.has('gui.zIndex')) {
                //     canvas2D.rootContainer.zIndex = entity.get('gui.zIndex');
                // }
                if (entity.has('gui.isHighlighted')) {
                    canvas2D.rootContainer.isHighlighted = entity.get('gui.isHighlighted');
                }
                GUIManager.addUniqueIDIndex(canvas2D.uniqueId, entity.get('resource_id'));
                return canvas2D;
            } else if (subtype === 'panel') {
                let panel = new BABYLON.GUI.Rectangle(entity.get('name'));
                entity.node = panel;
                if (entity.has('gui.color')) {
                    panel.color = Tools.rgba2hsvString(entity.get('gui.color'));
                }
                if (entity.has('gui.background')) {
                    panel.background = Tools.rgba2hsvString(entity.get('gui.background'));
                }
                set2DGUITransform(panel, entity);
                if (entity.has('gui.thickness')) {
                    panel.thickness = entity.get('gui.thickness')
                }
                if (entity.has('gui.cornerRadius')) {
                    panel.cornerRadius = entity.get('gui.cornerRadius')
                }
                return panel;
            } else if (subtype === 'button') {
                let btn = BABYLON.GUI.Button.CreateImageWithCenterTextButton(entity.get('name'), '', '');
                entity.node = btn;
                if (entity.has('gui.color')) {
                    btn.color = Tools.rgba2hsvString(entity.get('gui.color'));
                }
                if (entity.has('gui.background')) {
                    btn.background = Tools.rgba2hsvString(entity.get('gui.background'));
                }
                set2DGUITransform(btn, entity);
                if (entity.has('gui.thickness')) {
                    btn.thickness = entity.get('gui.thickness')
                }
                if (entity.has('gui.cornerRadius')) {
                    btn.cornerRadius = entity.get('gui.cornerRadius')
                }
                if (entity.has('gui.text')) {
                    btn.textBlock!.text = entity.get('gui.text')
                }
                if (entity.has('gui.fontSize')) {
                    btn.fontSize = entity.get('gui.fontSize');
                    btn.textBlock!.fontSize = entity.get('gui.fontSize');
                }
                if (entity.has('gui.textColor')) {
                    btn.textBlock!.color = Tools.rgba2hsvString(entity.get('gui.textColor'));
                }
                return btn;
            } else if (subtype === 'image') {
                let img = new BABYLON.GUI.Image(entity.get('name'), '');
                entity.node = img;
                if (entity.has('gui.color')) {
                    img.color = Tools.rgba2hsvString(entity.get('gui.color'));
                }
                set2DGUITransform(img, entity);
                return img;
            } else if (subtype === 'text') {
                let text = new BABYLON.GUI.TextBlock(entity.get('name'), '');
                entity.node = text;
                if (entity.has('gui.color')) {
                    text.color = Tools.rgba2hsvString(entity.get('gui.color'));
                }
                set2DGUITransform(text, entity);
                if (entity.has('gui.fontSize')) {
                    text.fontSize = entity.get('gui.fontSize');
                }
                if (entity.has('gui.text')) {
                    text.text = entity.get('gui.text');
                }
                if (entity.has('gui.textWrapping')) {
                    text.textWrapping = entity.get('gui.textWrapping');
                }
                if (entity.has('gui.textHorizontalAlignment')) {
                    text.textHorizontalAlignment = entity.get('gui.textHorizontalAlignment');
                }
                if (entity.has('gui.textVerticalAlignment')) {
                    text.textVerticalAlignment = entity.get('gui.textVerticalAlignment');
                }
                return text;
            } else if (subtype === 'input') {
                let input = new BABYLON.GUI.InputText(entity.get('name'), '');
                entity.node = input;
                if (entity.has('gui.color')) {
                    input.color = Tools.rgba2hsvString(entity.get('gui.color'));
                }
                if (entity.has('gui.background')) {
                    input.background = Tools.rgba2hsvString(entity.get('gui.background'));
                }
                set2DGUITransform(input, entity);
                if (entity.has('gui.thickness')) {
                    input.thickness = entity.get('gui.thickness')
                }
                if (entity.has('gui.fontSize')) {
                    input.fontSize = entity.get('gui.fontSize');
                }
                if (entity.has('gui.placeholderColor')) {
                    input.placeholderColor = Tools.rgba2hsvString(entity.get('gui.placeholderColor'));
                }
                if (entity.has('gui.placeholderText')) {
                    input.placeholderText = entity.get('gui.placeholderText');
                }
                if (entity.has('gui.focusedBackground')) {
                    input.focusedBackground = Tools.rgba2hsvString(entity.get('gui.focusedBackground'));
                }
                if (entity.has('gui.text')) {
                    input.text = entity.get('gui.text');
                }
                return input;
            } else if (subtype === 'checkbox') {
                let checkbox = new BABYLON.GUI.RadioButton(entity.get('name'));
                entity.node = checkbox;
                if (entity.has('gui.color')) {
                    checkbox.color = Tools.rgba2hsvString(entity.get('gui.color'));
                }
                if (entity.has('gui.background')) {
                    checkbox.background = Tools.rgba2hsvString(entity.get('gui.background'));
                }

                set2DGUITransform(checkbox, entity);
                if (entity.has('gui.thickness')) {
                    checkbox.thickness = entity.get('gui.thickness')
                }
                if (entity.has('gui.isChecked')) {
                    checkbox.isChecked = entity.get('gui.isChecked')
                }
                return checkbox;
            }
            return null;
        }

        let set2DGUITransform = (control: BABYLON.GUI.Control, entity: Observer) => {
            if (entity.has('gui.x')) {
                if (entity.has('gui.xType') && entity.get('gui.xType') === 1) {
                    control.left = entity.get('gui.x') + '%';
                } else {
                    control.left = entity.get('gui.x') + 'px';
                }
            }
            if (entity.has('gui.y')) {
                if (entity.has('gui.yType') && entity.get('gui.yType') === 1) {
                    control.top = entity.get('gui.y') + '%';
                } else {
                    control.top = entity.get('gui.y') + 'px';
                }
            }
            if (entity.has('gui.width')) {
                if (entity.has('gui.widthType') && entity.get('gui.widthType') === 1) {
                    control.width = entity.get('gui.width') + '%';
                } else {
                    control.width = entity.get('gui.width') + 'px';
                }
            }
            if (entity.has('gui.height')) {
                if (entity.has('gui.heightType') && entity.get('gui.heightType') === 1) {
                    control.height = entity.get('gui.height') + '%';
                } else {
                    control.height = entity.get('gui.height') + 'px';
                }
            }
            if (entity.has('gui.scaleX')) {
                control.scaleX = entity.get('gui.scaleX');
            }
            if (entity.has('gui.scaleY')) {
                control.scaleY = entity.get('gui.scaleY');
            }
            if (entity.has('gui.horizontal_alignment')) {
                control.horizontalAlignment = entity.get('gui.horizontal_alignment');
            }
            if (entity.has('gui.vertical_alignment')) {
                control.verticalAlignment = entity.get('gui.vertical_alignment');
            }
            if (entity.has('gui.isHighlighted')) {
                control.isHighlighted = entity.get('gui.isHighlighted');
            }
        }

    }



}