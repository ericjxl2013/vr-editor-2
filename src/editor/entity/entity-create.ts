import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
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
                    var box = BABYLON.MeshBuilder.CreateSphere(entity.get('name'), { segments: 20, diameter: 100 }, VeryEngine.viewScene);
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
                } else if (subtype === 'plane') {
                    var box = BABYLON.MeshBuilder.CreateGround(entity.get('name'), { width: 5000, height: 5000, subdivisions: 10 }, VeryEngine.viewScene);
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
                } else if (subtype === 'cylinder') {
                    var box = BABYLON.MeshBuilder.CreateCylinder(entity.get('name'), { height: 200, diameter: 100 }, VeryEngine.viewScene);
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
                }
            }
            // // box
            // var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VeryEngine.viewScene);
            // entity.node = box;
            // entitiesIndex[entity.get('resource_id')] = box;
            // box.id = entity.get('resource_id');
            // box.position = BABYLON.Vector3.FromArray(entity.get('position'));
            // box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
            // box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
            // box.isEnabled(entity.get('enabled'));
            // box.checkCollisions = entity.get('checkCollisions');
            // box.isVisible = entity.get('isVisible');
            // // 加载自定义关联材质
            // if (entity.get('material_id')) {

            // }
            // childAndParent(entity, box);

            return null;
        }

    }



}