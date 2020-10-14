import { getUrl } from "../../tools/ossfile";
import { VeryEngine } from "../../engine";
import { Observer } from "../../lib";
import { VeryCamera } from "../middleware";
import { BabylonLoader } from "../middleware/loader/babylonLoader";
import { Tools } from "../utility";
import { Config } from "../global";
import { GUIManager } from "../gui";

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
                // 事件绑定到创建时
                else if (path === 'clearColor') {
                    if (entity instanceof VeryCamera) {
                        entity.clearColor = BABYLON.Color4.FromArray(value);
                    }
                } else if (path === 'mode') {
                    if (entity instanceof VeryCamera) {
                        entity.mode = value;
                    }
                } else if (path === 'orthoSize') {
                    if (entity instanceof VeryCamera) {
                        entity.orthoSize = value;
                    }
                } else if (path === 'fov') {
                    if (entity instanceof VeryCamera) {
                        // entity.fov = Tools.eulerAngleFloatToRadian(value);
                        entity.fov = value;
                    }
                } else if (path === 'minZ') {
                    if (entity instanceof VeryCamera) {
                        entity.minZ = value;
                    }
                } else if (path === 'maxZ') {
                    if (entity instanceof VeryCamera) {
                        entity.maxZ = value;
                    }
                } else if (path === 'applyGravity') {
                    if (entity instanceof VeryCamera) {
                        entity.applyGravity = value;
                    }
                }
                // 2D-GUI
                else if (path === 'gui.isVisible') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).isVisible = value;
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.isVisible = value;
                    }
                } else if (path === 'gui.xType') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (value === 0) {
                            (<BABYLON.GUI.Control>entity).left = obj.get('gui.x') + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).left = obj.get('gui.x') + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (value === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.left = obj.get('gui.x') + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.left = obj.get('gui.x') + '%';
                        }
                    }
                } else if (path === 'gui.x') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (obj.get('gui.xType') === 0) {
                            (<BABYLON.GUI.Control>entity).left = value + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).left = value + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (obj.get('gui.xType') === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.left = value + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.left = value + '%';
                        }
                    }
                } else if (path === 'gui.yType') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (value === 0) {
                            (<BABYLON.GUI.Control>entity).top = obj.get('gui.y') + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).top = obj.get('gui.y') + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (value === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.top = obj.get('gui.y') + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.top = obj.get('gui.y') + '%';
                        }
                    }
                } else if (path === 'gui.y') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (obj.get('gui.yType') === 0) {
                            (<BABYLON.GUI.Control>entity).top = value + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).top = value + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (obj.get('gui.yType') === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.top = value + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.top = value + '%';
                        }
                    }
                } else if (path === 'gui.widthType') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (value === 0) {
                            (<BABYLON.GUI.Control>entity).width = obj.get('gui.width') + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).width = obj.get('gui.width') + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (value === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.width = obj.get('gui.width') + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.width = obj.get('gui.width') + '%';
                        }
                    }
                } else if (path === 'gui.width') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (obj.get('gui.widthType') === 0) {
                            (<BABYLON.GUI.Control>entity).width = value + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).width = value + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (obj.get('gui.widthType') === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.width = value + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.width = value + '%';
                        }
                    }
                } else if (path === 'gui.heightType') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (value === 0) {
                            (<BABYLON.GUI.Control>entity).height = obj.get('gui.height') + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).height = obj.get('gui.height') + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (value === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.height = obj.get('gui.height') + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.height = obj.get('gui.height') + '%';
                        }
                    }
                } else if (path === 'gui.height') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        if (obj.get('gui.heightType') === 0) {
                            (<BABYLON.GUI.Control>entity).height = value + 'px';
                        } else {
                            (<BABYLON.GUI.Control>entity).height = value + '%';
                        }
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        if (obj.get('gui.heightType') === 0) {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.height = value + 'px';
                        } else {
                            (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.height = value + '%';
                        }
                    }
                } else if (path === 'gui.horizontal_alignment') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).horizontalAlignment = value;
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.horizontalAlignment = value;
                    }
                } else if (path === 'gui.vertical_alignment') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).verticalAlignment = value;
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.verticalAlignment = value;
                    }
                } else if (path === 'gui.alpha') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).alpha = value;
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.alpha = value;
                    }
                } else if (path === 'gui.rotation') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).rotation = Tools.eulerAngleFloatToRadian(value);
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.rotation = Tools.eulerAngleFloatToRadian(value);
                    }
                } else if (path === 'gui.color') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).color = Tools.rgba2hsvString(value);
                    } else if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.color = Tools.rgba2hsvString(value);
                    }
                } else if (path === 'gui.background') {
                    if (entity instanceof BABYLON.GUI.Control) {
                        (<any>entity).background = Tools.rgba2hsvString(value);
                    }
                } else if (path === 'gui.textColor') {
                    if (entity instanceof BABYLON.GUI.Button) {
                        (<BABYLON.GUI.Button>entity).textBlock!.color = Tools.rgba2hsvString(value);
                    }
                } else if (path === 'gui.text') {
                    if (entity instanceof BABYLON.GUI.Button) {
                        (<BABYLON.GUI.Button>entity).textBlock!.text = value;
                    } else if (entity instanceof BABYLON.GUI.TextBlock) {
                        (<BABYLON.GUI.TextBlock>entity).text = value;
                    } else if (entity instanceof BABYLON.GUI.InputText) {
                        (<BABYLON.GUI.InputText>entity).text = value;
                    }
                } else if (path === 'gui.thickness') {
                    if (entity instanceof BABYLON.GUI.Button) {
                        (<BABYLON.GUI.Button>entity).thickness = value;
                    } else if (entity instanceof BABYLON.GUI.Rectangle) {
                        (<BABYLON.GUI.Rectangle>entity).thickness = value;
                    } else if (entity instanceof BABYLON.GUI.InputText) {
                        (<BABYLON.GUI.InputText>entity).thickness = value;
                    } else if (entity instanceof BABYLON.GUI.Checkbox) {
                        (<BABYLON.GUI.Checkbox>entity).thickness = value;
                    }
                } else if (path === 'gui.cornerRadius') {
                    if (entity instanceof BABYLON.GUI.Button) {
                        (<BABYLON.GUI.Button>entity).cornerRadius = value;
                    } else if (entity instanceof BABYLON.GUI.Rectangle) {
                        (<BABYLON.GUI.Rectangle>entity).cornerRadius = value;
                    }
                } else if (path === 'gui.fontSize') {
                    if (entity instanceof BABYLON.GUI.TextBlock) {
                        (<BABYLON.GUI.TextBlock>entity).fontSize = value;
                    } else if (entity instanceof BABYLON.GUI.InputText) {
                        (<BABYLON.GUI.InputText>entity).fontSize = value;
                    } else if (entity instanceof BABYLON.GUI.Button) {
                        (<BABYLON.GUI.Button>entity).textBlock!.fontSize = value;
                    }
                } else if (path === 'gui.placeholderText') {
                    if (entity instanceof BABYLON.GUI.InputText) {
                        (<BABYLON.GUI.InputText>entity).placeholderText = value;
                    }
                } else if (path === 'gui.placeholderColor') {
                    if (entity instanceof BABYLON.GUI.InputText) {
                        (<BABYLON.GUI.InputText>entity).placeholderColor = Tools.rgba2hsvString(value);
                    }
                } else if (path === 'gui.focusedBackground') {
                    if (entity instanceof BABYLON.GUI.InputText) {
                        (<BABYLON.GUI.InputText>entity).focusedBackground = Tools.rgba2hsvString(value);
                    }
                } else if (path === 'gui.isChecked') {
                    if (entity instanceof BABYLON.GUI.RadioButton) {
                        (<BABYLON.GUI.RadioButton>entity).isChecked = value;
                    }
                } else if (path === 'gui.textWrapping') {
                    if (entity instanceof BABYLON.GUI.TextBlock) {
                        (<BABYLON.GUI.TextBlock>entity).textWrapping = value;
                    }
                } else if (path === 'gui.textHorizontalAlignment') {
                    if (entity instanceof BABYLON.GUI.TextBlock) {
                        (<BABYLON.GUI.TextBlock>entity).textHorizontalAlignment = value;
                    }
                } else if (path === 'gui.textVerticalAlignment') {
                    if (entity instanceof BABYLON.GUI.TextBlock) {
                        (<BABYLON.GUI.TextBlock>entity).textVerticalAlignment = value;
                    }
                } else if (path === 'gui.isHighlighted') {
                    if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.isHighlighted = value;
                    } else if(entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).isHighlighted = value;
                    }
                }  else if (path === 'gui.zIndex') {
                    if (entity instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer.zIndex = value;
                        (<BABYLON.GUI.AdvancedDynamicTexture>entity).rootContainer._markAllAsDirty();
                    } else if(entity instanceof BABYLON.GUI.Control) {
                        (<BABYLON.GUI.Control>entity).zIndex = value;
                        (<BABYLON.GUI.Control>entity)._markAllAsDirty();
                    }
                } else if (path === 'gui.source') {
                    // console.error(value);
                    if(value) {
                        let asset = editor.call('assets:get', value);
                        if (asset) {
                            if (entity instanceof BABYLON.GUI.Image) {
                                getUrl(Config.projectID, asset.get('id'), asset.get('name'), asset.get('file.hash')).then(response => {
                                    (<BABYLON.GUI.Image>entity).source = response;
                                });
                                // (<BABYLON.GUI.TextBlock>entity).textVerticalAlignment = value;
                            } else if (entity instanceof BABYLON.GUI.Button) {
                                getUrl(Config.projectID, asset.get('id'), asset.get('name'), asset.get('file.hash')).then(response => {
                                    (<BABYLON.GUI.Button>entity).image!.source = response;
                                });
                            }
                        }
                    } else {
                        if (entity instanceof BABYLON.GUI.Image) {
                            (<BABYLON.GUI.Image>entity).source = '';
                            (<BABYLON.GUI.Image>entity)._markAsDirty();
                        } else if (entity instanceof BABYLON.GUI.Button) {
                            (<BABYLON.GUI.Button>entity).image!.source = '';
                            (<BABYLON.GUI.Button>entity)._markAsDirty();
                        }
                    }
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
                    } else if (childEntity.node instanceof BABYLON.GUI.Control) {
                        if (obj.node instanceof BABYLON.GUI.AdvancedDynamicTexture) {
                            if((<BABYLON.GUI.Control>(childEntity.node)).parent) {
                                (<BABYLON.GUI.Control>(childEntity.node)).parent?.removeControl(<BABYLON.GUI.Control>(childEntity.node));
                            }
                            obj.node.addControl(childEntity.node);
                            // console.error(childEntity.node.parent);
                            // console.error(childEntity.node.parent.parent);
                            // console.warn(index);
                            // console.log(obj.node.rootContainer.children);
                            let last = obj.node.rootContainer.children.pop();
                            obj.node.rootContainer.children.splice(index, 0, last!);
                            GUIManager.addUniqueIDIndex(childEntity.node.uniqueId, child);
                        } else if (obj.node instanceof BABYLON.GUI.Container) {
                            if((<BABYLON.GUI.Control>(childEntity.node)).parent) {
                                (<BABYLON.GUI.Control>(childEntity.node)).parent?.removeControl(<BABYLON.GUI.Control>(childEntity.node));
                            }
                            obj.node.addControl(childEntity.node);
                            let last = obj.node.children.pop();
                            obj.node.children.splice(index, 0, last!);
                            GUIManager.addUniqueIDIndex(childEntity.node.uniqueId, child);
                        } else {
                            // editor.call('', '');
                            console.warn(childEntity.get('subtype'));
                            console.warn(childEntity.node);
                            console.log('2D界面未知情况，请截图报错信息并联系管理员！');
                        }
                    } else if (childEntity.node instanceof BABYLON.GUI.AdvancedDynamicTexture) {

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