import { Observer } from '../../lib';
import { VeryEngine } from '../../engine';
import { BabylonLoader } from '../middleware/loader/babylonLoader';
import { GizmosCenter } from '../gizmos';

export class ViewportDropModel {


    public constructor() {


        editor.method('load:from:asset', (babylon_data: Observer) => {
            BabylonLoader.loadBabylon(babylon_data);
            // console.log('assets加载模型');
            // console.log(babylon_data);
        });

        editor.method('pick', (mesh: Nullable<BABYLON.AbstractMesh>) => {
            if (mesh === null) {
                GizmosCenter.clear();
                console.log('clear gizmos');
            } else {
                console.log('pick mesh');
                // GizmosCenter.attach(mesh);
                var entity = editor.call('entities:get', mesh.id);
                console.error(entity);
                if (entity) {
                    editor.call('selector:set', 'entity', [entity]);
                } else {
                    console.error('失败');
                }
            }
        });



        editor.method('loadTempModel', (babylon_data: Observer) => {

            BabylonLoader.loadBabylon(babylon_data);
            console.log('加载模型');
            console.log(babylon_data);
            return;
            var rootUrl = babylon_data.get('file.url');
            var modelName = babylon_data.get('file.filename');
            rootUrl = rootUrl.substring(0, rootUrl.length - modelName.length);

            BABYLON.SceneLoader.Append(rootUrl, modelName, VeryEngine.viewScene, function (scene) {

                // console.log('************mesh个数：' + scene.meshes.length);
                for (let i = 0; i < scene.meshes.length; i++) {
                    let mesh = scene.meshes[i];
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                    let parentID: string = '';
                    if (mesh.parent !== null) {
                        parentID = mesh.parent!.id;
                    }

                    var childs = mesh.getChildren();
                    var myChildren = [];

                    for (let k = 0; k < childs.length; k++) {
                        myChildren.push(childs[k].id);
                    }

                    let data = {
                        name: mesh.name,
                        resource_id: mesh.id,
                        parent: parentID,
                        position: [mesh.position.x, mesh.position.y, mesh.position.z],
                        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                        scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                        children: myChildren,
                        enabled: mesh.isEnabled(),
                        tags: [],
                        root: false,
                        type: 'Mesh',
                        asset: rootUrl,
                        asset2: modelName
                    }
                    // console.log(scene.meshes[i].id + ' : ' + scene.meshes[i].name);
                    // console.error(data);
                    editor.call('entity:new:babylon', data);
                }

                for (let i = 0; i < scene.transformNodes.length; i++) {
                    let node = scene.transformNodes[i];
                    let parentID: string = '';
                    if (node.parent !== null) {
                        parentID = node.parent!.id;
                    }

                    let data = {
                        name: node.name,
                        resource_id: node.id,
                        parent: parentID,
                        position: [node.position.x, node.position.y, node.position.z],
                        rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                        scale: [node.scaling.x, node.scaling.y, node.scaling.z],
                        children: myChildren,
                        enabled: node.isEnabled(),
                        tags: [],
                        root: false,
                        type: 'TransformNode',
                        asset: rootUrl,
                        asset2: modelName
                    }
                    // console.log(scene.meshes[i].id + ' : ' + scene.meshes[i].name);
                    editor.call('entity:new:babylon', data);
                }

                // console.error('加载');

                editor.emit('entities:load', true);

                // console.log('************node个数：' + scene.transformNodes.length);
                // for(let i = 0; i < scene.transformNodes.length; i++) {
                //     console.log(scene.transformNodes[i].id + ' : ' + scene.transformNodes[i].name);
                // }
                // console.log('************root个数：' + scene.rootNodes.length);
                // for(let i = 0; i < scene.rootNodes.length; i++) {
                //     console.log(scene.rootNodes[i].id + ' : ' + scene.rootNodes[i].name);
                // }


                scene.onPointerObservable.add(pointerInfo => {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            // console.log('down');
                            if (pointerInfo!.pickInfo!.pickedMesh != null) {
                                editor.call('pick', pointerInfo!.pickInfo!.pickedMesh);
                            } else {
                                editor.call('pick', null);
                            }
                            // console.log(pointerInfo!.pickInfo!.pickedMesh);
                            break;
                    }


                });
            });

            // 默认加载

            // editor.method('entity:new:mesh', )

        });


        editor.method('loadTempModel2', (rootUrl: string, modelName: string) => {

            BABYLON.SceneLoader.Append(rootUrl, modelName, VeryEngine.viewScene, function (scene) {
                // console.error('加载2');

                // console.log('************mesh个数：' + scene.meshes.length);
                for (let i = 0; i < scene.meshes.length; i++) {
                    let mesh = scene.meshes[i];
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;

                    var entity = editor.call('entities:get', mesh.id);
                    if (entity) {
                        entity.node = mesh;
                    }
                    // let parentID: string = '';
                    // if (mesh.parent !== null) {
                    //     parentID = mesh.parent!.id;
                    // }

                    // var childs = mesh.getChildren();
                    // var myChildren = [];

                    // for (let k = 0; k < childs.length; k++) {
                    //     myChildren.push(childs[k].id);
                    // }

                    // let data = {
                    //     name: mesh.name,
                    //     resource_id: mesh.id,
                    //     parent: parentID,
                    //     position: [mesh.position.x, mesh.position.y, mesh.position.z],
                    //     rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                    //     scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                    //     children: myChildren,
                    //     enabled: mesh.isEnabled(),
                    //     tags: [],
                    //     root: false,
                    //     type: 'Mesh',
                    //     asset: rootUrl,
                    //     asset2: modelName
                    // }
                    // // console.log(scene.meshes[i].id + ' : ' + scene.meshes[i].name);
                    // // console.error(data);
                    // editor.call('entity:new:babylon', data);
                }

                for (let i = 0; i < scene.transformNodes.length; i++) {
                    let node = scene.transformNodes[i];
                    let parentID: string = '';
                    if (node.parent !== null) {
                        parentID = node.parent!.id;
                    }

                    var entity = editor.call('entities:get', node.id);
                    if (entity) {
                        entity.node = node;
                    }
                    // let data = {
                    //     name: node.name,
                    //     resource_id: node.id,
                    //     parent: parentID,
                    //     position: [node.position.x, node.position.y, node.position.z],
                    //     rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                    //     scale: [node.scaling.x, node.scaling.y, node.scaling.z],
                    //     children: myChildren,
                    //     enabled: node.isEnabled(),
                    //     tags: [],
                    //     root: false,
                    //     type: 'TransformNode',
                    //     asset: rootUrl,
                    //     asset2: modelName
                    // }
                    // // console.log(scene.meshes[i].id + ' : ' + scene.meshes[i].name);
                    // editor.call('entity:new:babylon', data);
                }


                // editor.emit('entities:load', true);

                // console.log('************node个数：' + scene.transformNodes.length);
                // for(let i = 0; i < scene.transformNodes.length; i++) {
                //     console.log(scene.transformNodes[i].id + ' : ' + scene.transformNodes[i].name);
                // }
                // console.log('************root个数：' + scene.rootNodes.length);
                // for(let i = 0; i < scene.rootNodes.length; i++) {
                //     console.log(scene.rootNodes[i].id + ' : ' + scene.rootNodes[i].name);
                // }


                scene.onPointerObservable.add(pointerInfo => {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            // console.log('down');
                            if (pointerInfo!.pickInfo!.pickedMesh != null) {
                                editor.call('pick', pointerInfo!.pickInfo!.pickedMesh);
                            } else {
                                editor.call('pick', null);
                            }
                            // console.log(pointerInfo!.pickInfo!.pickedMesh);
                            break;
                    }
                });
            });



        });


        var canvas = editor.call('viewport:canvas');
        if (! canvas) return;

        var dropRef = editor.call('drop:target', {
            ref: canvas.element,
            filter: function (type: string, data: any) {
                if (type === 'asset.model') {
                    // var asset = app.assets.get(data.id);
                    // if (asset) app.assets.load(asset);

                    return true;
                }

                if (type === 'assets') {
                    for (var i = 0; i < data.ids.length; i++) {
                        var asset = editor.call('assets:get', data.ids[i]);
                        if (!asset)
                            return false;

                        if (asset.get('type') !== 'model')
                            return false;
                    }

                    // for (var i = 0; i < data.ids.length; i++) {
                    //     var asset = app.assets.get(data.ids[i]);
                    //     if (asset) app.assets.load(asset);
                    // }

                    return true;
                }

                return false;
            },
            drop: function (type: string, data: any) {
                // if (!config.scene.id)
                //     return;
                console.warn('viewport drop: ' + type);

                var assets = [];

                if (type === 'asset.model') {
                    var asset = editor.call('assets:get', data.id);
                    if (asset) assets.push(asset);
                } else if (type === 'assets') {
                    for (var i = 0; i < data.ids.length; i++) {
                        var asset = editor.call('assets:get', data.ids[i]);
                        if (asset && asset.get('type') === 'model')
                            assets.push(asset);
                    }
                }

                if (!assets.length)
                    return;

                // parent
                var parent = null;
                if (editor.call('selector:type') === 'entity')
                    parent = editor.call('selector:items')[0];

                if (!parent)
                    parent = editor.call('entities:root');

                var entities = [];
                var data: any = [];

                // calculate aabb
                // var first = true;
                // for (var i = 0; i < assets.length; i++) {
                //     var assetEngine = app.assets.get(assets[i].get('id'));
                //     if (!assetEngine) continue;

                //     if (assetEngine.resource) {
                //         var meshes = assetEngine.resource.meshInstances;
                //         for (var m = 0; m < meshes.length; m++) {
                //             if (first) {
                //                 first = false;
                //                 aabb.copy(meshes[m].aabb);
                //             } else {
                //                 aabb.add(meshes[m].aabb);
                //             }
                //         }
                //     }
                // }

                // if (first) {
                //     aabb.center.set(0, 0, 0);
                //     aabb.halfExtents.set(1, 1, 1);
                // }

                // calculate point
                // var camera = editor.call('camera:current');
                // var distance = 0;

                // if (ui.Tree._ctrl && ui.Tree._ctrl()) {
                //     vecA.copy(camera.forward).scale(aabb.halfExtents.length() * 2.2);
                //     vecB.copy(camera.getPosition()).add(vecA);
                //     vecC.copy(vecB).sub(aabb.center);

                //     var tmp = new pc.Entity();
                //     parent.entity.addChild(tmp);
                //     tmp.setPosition(vecC);
                //     vecC.copy(tmp.getLocalPosition());
                //     tmp.destroy();

                //     // focus distance
                //     distance = vecA.copy(camera.getPosition()).sub(vecB).length();
                // } else {
                //     vecC.set(0, 0, 0);
                //     vecB.copy(parent.entity.getPosition()).add(aabb.center);
                //     distance = aabb.halfExtents.length() * 2.2;
                // }

                // for (var i = 0; i < assets.length; i++) {
                //     var component = editor.call('components:getDefault', 'model');
                //     component.type = 'asset';
                //     component.asset = parseInt(assets[i].get('id'), 10);

                //     var name = assets[i].get('name');
                //     if (/\.json$/i.test(name))
                //         name = name.slice(0, -5) || 'Untitled';

                //     // new entity
                //     var entity = editor.call('entities:new', {
                //         parent: parent,
                //         name: name,
                //         position: [vecC.x, vecC.y, vecC.z],
                //         components: {
                //             model: component
                //         },
                //         noSelect: true,
                //         noHistory: true
                //     });

                //     entities.push(entity);
                //     data.push(entity.json());
                // }

                // editor.call('selector:history', false);
                // editor.call('selector:set', 'entity', entities);
                // editor.once('selector:change', function () {
                //     editor.call('selector:history', true);
                // });

                // var selectorType = editor.call('selector:type');
                // var selectorItems = editor.call('selector:items');
                // if (selectorType === 'entity') {
                //     for (var i = 0; i < selectorItems.length; i++)
                //         selectorItems[i] = selectorItems[i].get('resource_id');
                // }

                // var parentId = parent.get('resource_id');
                // var resourceIds = [];
                // for (var i = 0; i < entities.length; i++)
                //     resourceIds.push(entities[i].get('resource_id'));

                // editor.call('history:add', {
                //     name: 'new model entities ' + entities.length,
                //     undo: function () {
                //         for (var i = 0; i < resourceIds.length; i++) {
                //             var entity = editor.call('entities:get', resourceIds[i]);
                //             if (!entity)
                //                 continue;

                //             editor.call('entities:removeEntity', entity);
                //         }

                //         if (selectorType === 'entity' && selectorItems.length) {
                //             var items = [];
                //             for (var i = 0; i < selectorItems.length; i++) {
                //                 var item = editor.call('entities:get', selectorItems[i]);
                //                 if (item)
                //                     items.push(item);
                //             }

                //             if (items.length) {
                //                 editor.call('selector:history', false);
                //                 editor.call('selector:set', selectorType, items);
                //                 editor.once('selector:change', function () {
                //                     editor.call('selector:history', true);
                //                 });
                //             }
                //         }
                //     },
                //     redo: function () {
                //         var parent = editor.call('entities:get', parentId);
                //         if (!parent)
                //             return;

                //         var entities = [];

                //         for (var i = 0; i < data.length; i++) {
                //             var entity = new Observer(data[i]);
                //             entities.push(entity);
                //             editor.call('entities:addEntity', entity, parent, false);
                //         }

                //         editor.call('selector:history', false);
                //         editor.call('selector:set', 'entity', entities);
                //         editor.once('selector:change', function () {
                //             editor.call('selector:history', true);
                //         });

                //         editor.call('viewport:render');
                //         editor.call('camera:focus', vecB, distance);
                //     }
                // });

                // editor.call('viewport:render');
                // editor.call('camera:focus', vecB, distance);
            }
        });


    }
}