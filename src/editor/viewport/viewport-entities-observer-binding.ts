import { VeryEngine } from "../../engine";
import { Observer } from "../../lib";
import { BabylonLoader } from "../middleware/loader/babylonLoader";
import { Tools } from "../utility";

export class ViewportEntitiesObserverBinding {



    public constructor() {
        // let nnnode = new BABYLON.Node('sdf', VeryEngine.viewScene);
        // nnnode
        editor.on('entities:add', function (obj: Observer) {
            // console.warn(obj);
            // subscribe to changes
            obj.on('*:set', function (path: string, value: any) {
                var entity = obj.node;
                if (!entity)
                    return;

                if (path === 'name') {
                    entity.name = obj.get('name');

                } else if (path.startsWith('position')) {
                    // TODO: 有数据值的最好换一个通用的方式记录
                    entity.position = new BABYLON.Vector3(obj.get('position.0'), obj.get('position.1'), obj.get('position.2'));

                } else if (path.startsWith('rotation')) {
                    entity.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(obj.get('rotation.0'), obj.get('rotation.1'), obj.get('rotation.2')));

                } else if (path.startsWith('scale')) {
                    entity.scaling = new BABYLON.Vector3(obj.get('scale.0'), obj.get('scale.1'), obj.get('scale.2'));

                } else if (path.startsWith('enabled')) {
                    entity.setEnabled(obj.get('enabled'));
                } else if (path.startsWith('checkCollisions')) {
                    entity.checkCollisions = obj.get('checkCollisions');
                } else if (path.startsWith('pickable')) {
                    // TODO: 编辑场景下entity不改，一直为true，publish加载才真改
                    // entity.isPickable = obj.get('pickable');

                } else if (path.startsWith('isVisible')) {
                    entity.isVisible = obj.get('isVisible');
                } else if (path.startsWith('parent')) {
                    // 父子关系设定
                    var parent = editor.call('entities:get', obj.get('parent'));

                    // console.log('parent');
                    // console.warn(parent);
                    // TODO
                    // if (parent && parent.node && entity.parent !== parent.node)
                    //     entity.parent = parent.node;
                } else if (path === 'components.model.type' && value === 'asset') {
                    // WORKAROUND
                    // entity deletes asset when switching to primitive, restore it
                    // do this in a timeout to allow the model type to change first
                    // setTimeout(function () {
                    //     var assetId = obj.get('components.model.asset');
                    // if (assetId)
                    //     entity.model.asset = assetId;
                    // });
                }


                BabylonLoader.updateSceneData(obj.get('resource_id'), obj._data2);
                // console.error(obj._data2);
                editor.call('make:scene:dirty');

                // console.warn(entity);
                // render
                // editor.call('viewport:render');
            });

            var reparent = function (child: string, index: number) {
                // console.warn('reparent : ' + child);
                var childEntity = editor.call('entities:get', child);
                if (childEntity && childEntity.node) {
                    // var oldParent = childEntity.node.parent;
                    // TODO: Light、Camera等不是TransformNode对象
                    if (childEntity.node instanceof BABYLON.TransformNode) {
                        // console.warn(childEntity.node);
                        let absPos = BABYLON.Vector3.Zero().copyFrom((<BABYLON.TransformNode>childEntity.node).getAbsolutePosition());

                        // TODO: children中的数据要删除

                        // 还有灯和摄像机怎么办
                        // (<BABYLON.TransformNode>childEntity.node).setAbsolutePosition(absPos);
                        // console.warn(childEntity.node);
                        // VeryEngine.viewScene.render();

                        (<BABYLON.TransformNode>childEntity.node).setParent(obj.node ? obj.node : null);

                        // (<BABYLON.TransformNode>childEntity.node).parent =(obj.node ? obj.node : null);

                        // console.log(absPos);

                        // (<BABYLON.TransformNode>childEntity.node).position = new BABYLON.Vector3(5,5,5);
                        // console.warn(childEntity.node);
                        let localPosition = childEntity.node.position.clone();
                        let localRotation = Tools.radianToEulerAngle(childEntity.node.rotation.clone());
                        childEntity.set('position.0', localPosition.x);
                        childEntity.set('position.1', localPosition.y);
                        childEntity.set('position.2', localPosition.z);
                        childEntity.set('rotation.0', localRotation.x);
                        childEntity.set('rotation.1', localRotation.y);
                        childEntity.set('rotation.2', localRotation.z);
                    } else {
                        console.error('当前类型还未考虑');
                        console.error(childEntity);
                    }
                    // childEntity.node.parent = null;
                    // childEntity.node.parent = obj.node;
                    // if (oldParent)
                    //     oldParent.removeChild(childEntity.node);

                    // skip any graph nodes
                    // if (index > 0) {
                    //     var children = obj.node.getChildren();
                    //     for (var i = 0, len = children.length; i < len && index > 0; i++) {
                    //         if (children[i] instanceof BABYLON.Node) {
                    //             index--;
                    //         }
                    //     }

                    //     index = i;
                    // }

                    // re-insert TODO
                    // obj.node.insertChild(childEntity.node, index);

                    // persist the positions and sizes of elements if they were previously
                    // under control of a layout group but have now been reparented
                    // if (oldParent && oldParent.layoutgroup) {
                    //     editor.call('entities:layout:storeLayout', [childEntity.node.getGuid()]);
                    // }
                }
            };

            obj.on('children:insert', reparent);
            obj.on('children:move', reparent);

            obj.on('destroy', function () {
                if (obj.node) {
                    obj.node.dispose();
                    editor.call('viewport:render');
                }
            });
        });

        editor.on('entities:remove', function (obj: Observer) {
            var entity = obj.node;
            if (!entity)
                return;

            entity.dispose();
            // editor.call('viewport:render');
        });


    }




}