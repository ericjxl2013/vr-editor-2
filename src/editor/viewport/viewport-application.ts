import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
import { CameraGizmo, LightGizmo } from '../gizmos';
import { Config } from '../global';
import { VeryLight } from '../middleware';
import { BabylonLoader } from '../middleware/loader/babylonLoader';
import { Tools } from '../utility';
import { getJsonAsset, getUrl } from "../../tools/ossfile";
import { GUIManager } from '../gui';

export class ViewportApplication {




    public constructor() {

        // entities indexes for parenting
        var childIndex: { [key: string]: any } = {};
        var entitiesIndex: { [key: string]: any } = {};
        var unknowns = {};
        var gizmos: { [key: string]: any } = {};

        editor.method('gizmo:get', (id: string) => {
            return (id in gizmos) ? gizmos[id] : null;
        });

        editor.method('create:scene:element', (entity: Observer) => {
            // console.log('create scene element');
            // console.error(entity);
            if (entity.get('type') === 'light') {
                // Lights
                let lightWraper = BabylonLoader.createLightWraper(entity.get('subtype'), entity.get('name'), VeryEngine.viewScene);

                // lightWraper.light.setEnabled(entity.has('enabled') ? entity.get('enabled') : true);
                lightWraper.light.intensity = entity.has('intensity') ? entity.get('intensity') : 1;
                if (entity.has('diffuse') && entity.get('diffuse').length === 3) {
                    lightWraper.light.diffuse = BABYLON.Color3.FromArray(entity.get('diffuse'));
                }
                if (entity.has('specular') && entity.get('specular').length === 3) {
                    lightWraper.light.specular = BABYLON.Color3.FromArray(entity.get('specular'));
                }
                if (lightWraper.light instanceof BABYLON.SpotLight) {
                    if (entity.has('angle')) {
                        lightWraper.light.angle = entity.get('angle');
                    }
                    if (entity.has('exponent')) {
                        lightWraper.light.exponent = entity.get('exponent');
                    }
                }

                lightWraper.id = entity.get('resource_id');
                entitiesIndex[entity.get('resource_id')] = lightWraper;
                entity.node = lightWraper;

                if (entity.has('enabled')) {
                    lightWraper.setEnabled(entity.get('enabled'));
                }
                if (entity.has('position') && entity.get('position').length === 3) {
                    lightWraper.position = BABYLON.Vector3.FromArray(entity.get('position'));
                }
                if (entity.has('rotation') && entity.get('rotation').length === 3) {
                    lightWraper.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    // 环境光不跟着父物体发生位置变化
                    if (lightWraper.type === BABYLON.Light.LIGHTTYPEID_HEMISPHERICLIGHT) {
                        (<BABYLON.HemisphericLight>lightWraper.light).direction.copyFrom(lightWraper.up);
                    }
                }
                if (entity.has('scale') && entity.get('scale').length === 3) {
                    lightWraper.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                }

                let lightGizmo = new LightGizmo();
                lightGizmo.scaleRatio = 2;
                lightGizmo.light = lightWraper.light;
                gizmos[entity.get('resource_id')] = lightGizmo;


                childAndParent(entity, lightWraper);
            } else if (entity.get('type') === 'camera') {
                // Cameras
                // 默认创建universalCamera，把input控制全删除
                let cameraWraper = BabylonLoader.createCameraWraper(entity.get('name'), VeryEngine.viewScene, VeryEngine.viewCanvasElement);

                // TODO: camera视窗
                let w = VeryEngine.viewEngine.getRenderWidth();
                let h = VeryEngine.viewEngine.getRenderHeight();
                // cameraWraper.camera.viewport = new BABYLON.Viewport(4 / w, (h - 241) / h, 260 / w, 200 / h);

                cameraWraper.camera.viewport = new BABYLON.Viewport(Config.x / w, (h - Config.y) / h, Config.width / w, Config.height / h);


                cameraWraper.id = entity.get('resource_id');
                entitiesIndex[entity.get('resource_id')] = cameraWraper;
                entity.node = cameraWraper;

                if (entity.has('enabled')) {
                    cameraWraper.setEnabled(entity.get('enabled'));
                }
                if (entity.has('position') && entity.get('position').length === 3) {
                    cameraWraper.position = BABYLON.Vector3.FromArray(entity.get('position'));
                }
                if (entity.has('rotation') && entity.get('rotation').length === 3) {
                    cameraWraper.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                }
                if (entity.has('scale') && entity.get('scale').length === 3) {
                    cameraWraper.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                }

                if (entity.has('checkCollisions')) {
                    // if (cameraWraper.camera instanceof BABYLON.FreeCamera) {
                    //     cameraWraper.camera.checkCollisions = entity.get('checkCollisions');
                    // }
                    cameraWraper.checkCollisions = entity.get('checkCollisions');
                }
                if (entity.has('applyGravity')) {
                    // if (cameraWraper.camera instanceof BABYLON.FreeCamera) {
                    //     cameraWraper.camera.applyGravity = entity.get('applyGravity');
                    // }
                    cameraWraper.applyGravity = entity.get('applyGravity');
                }
                if (entity.has('viewport')) {
                    // 编辑器条件下不用管
                    // let arr = entity.get('viewport');
                    // if (arr && arr.length && arr.length === 4) {
                    //     cameraWraper.camera.viewport = new BABYLON.Viewport(arr[0], arr[1], arr[2], arr[3]);
                    // }
                }
                // TODO: 设置clearColor
                if (entity.has('clearColor')) {
                    let arr = entity.get('clearColor');
                    if (arr && arr.length && arr.length === 4) {
                        cameraWraper.clearColor = new BABYLON.Color4(arr[0], arr[1], arr[2], arr[3]);
                    }
                } else {
                    cameraWraper.clearColor = new BABYLON.Color4(45 / 255, 145 / 255, 186 / 255, 1);
                }

                if (entity.has('mode')) {
                    cameraWraper.mode = entity.get('mode');
                }
                if (entity.has('fov')) {
                    cameraWraper.fov = entity.get('fov');
                }
                if (entity.has('inertia')) {
                    cameraWraper.inertia = entity.get('inertia');
                }
                if (entity.has('orthoSize')) {
                    cameraWraper.orthoSize = entity.get('orthoSize');
                }

                VeryEngine.addCamera(cameraWraper);

                VeryEngine.viewScene.activeCameras.push(cameraWraper.camera);

                let cameraGizmo = new CameraGizmo();
                cameraGizmo.camera = cameraWraper.camera;

                gizmos[entity.get('resource_id')] = cameraGizmo;

                cameraGizmo.displayFrustum = false;

                // 设置viewport
                cameraWraper.resize(true);
                // 先不要渲染出来
                cameraWraper.renderCamera(false);

                childAndParent(entity, cameraWraper);

            } else if (entity.get('type') === 'empty') {
                // 空物体
                let empty = new BABYLON.TransformNode(entity.get('name'), VeryEngine.viewScene);
                entity.node = empty;
                empty.id = entity.get('resource_id');
                empty.position = BABYLON.Vector3.FromArray(entity.get('position'));
                empty.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                empty.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                empty.isEnabled(entity.get('enabled'));
                entitiesIndex[entity.get('resource_id')] = empty;
                childAndParent(entity, empty);
            } else if (entity.get('type') === 'primitive') {
                if (entity.get('subtype') && entity.get('subtype') === 'box') {
                    // box
                    var box = BABYLON.MeshBuilder.CreateBox(entity.get('name'), { size: 100 }, VeryEngine.viewScene);

                    // var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VeryEngine.viewScene);
                    entity.node = box;
                    entitiesIndex[entity.get('resource_id')] = box;
                    box.id = entity.get('resource_id');

                    if (entity.has('enabled')) {
                        box.setEnabled(entity.get('enabled'));
                    }
                    if (entity.has('position') && entity.get('position').length === 3) {
                        box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    }
                    if (entity.has('rotation') && entity.get('rotation').length === 3) {
                        box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    }
                    if (entity.has('scale') && entity.get('scale').length === 3) {
                        box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    }
                    if (entity.has('checkCollisions')) {
                        box.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        box.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        box.isVisible = entity.get('isVisible');
                    }
                    // 加载自定义关联材质
                    if (entity.get('material_id')) {

                    }
                    childAndParent(entity, box);
                } else if (entity.get('subtype') && entity.get('subtype') === 'sphere') {
                    // box
                    var box = BABYLON.MeshBuilder.CreateSphere(entity.get('name'), { segments: 20, diameter: 100 }, VeryEngine.viewScene);

                    // var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VeryEngine.viewScene);
                    entity.node = box;
                    entitiesIndex[entity.get('resource_id')] = box;
                    box.id = entity.get('resource_id');

                    if (entity.has('enabled')) {
                        box.setEnabled(entity.get('enabled'));
                    }
                    if (entity.has('position') && entity.get('position').length === 3) {
                        box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    }
                    if (entity.has('rotation') && entity.get('rotation').length === 3) {
                        box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    }
                    if (entity.has('scale') && entity.get('scale').length === 3) {
                        box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    }
                    if (entity.has('checkCollisions')) {
                        box.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        box.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        box.isVisible = entity.get('isVisible');
                    }
                    // 加载自定义关联材质
                    if (entity.get('material_id')) {

                    }
                    childAndParent(entity, box);
                } else if (entity.get('subtype') && entity.get('subtype') === 'plane') {
                    // box
                    var box = BABYLON.MeshBuilder.CreateGround(entity.get('name'), { width: 5000, height: 5000, subdivisions: 10 }, VeryEngine.viewScene);

                    // var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VeryEngine.viewScene);
                    entity.node = box;
                    entitiesIndex[entity.get('resource_id')] = box;
                    box.id = entity.get('resource_id');

                    if (entity.has('enabled')) {
                        box.setEnabled(entity.get('enabled'));
                    }
                    if (entity.has('position') && entity.get('position').length === 3) {
                        box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    }
                    if (entity.has('rotation') && entity.get('rotation').length === 3) {
                        box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    }
                    if (entity.has('scale') && entity.get('scale').length === 3) {
                        box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    }
                    if (entity.has('checkCollisions')) {
                        box.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        box.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        box.isVisible = entity.get('isVisible');
                    }
                    // 加载自定义关联材质
                    if (entity.get('material_id')) {

                    }
                    childAndParent(entity, box);
                } else if (entity.get('subtype') && entity.get('subtype') === 'cylinder') {
                    // box
                    var box = BABYLON.MeshBuilder.CreateCylinder(entity.get('name'), { height: 200, diameter: 100 }, VeryEngine.viewScene);

                    // var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VeryEngine.viewScene);
                    entity.node = box;
                    entitiesIndex[entity.get('resource_id')] = box;
                    box.id = entity.get('resource_id');

                    if (entity.has('enabled')) {
                        box.setEnabled(entity.get('enabled'));
                    }
                    if (entity.has('position') && entity.get('position').length === 3) {
                        box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                    }
                    if (entity.has('rotation') && entity.get('rotation').length === 3) {
                        box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                    }
                    if (entity.has('scale') && entity.get('scale').length === 3) {
                        box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                    }
                    if (entity.has('checkCollisions')) {
                        box.checkCollisions = entity.get('checkCollisions');
                    }
                    if (entity.has('pickable')) {
                        box.isPickable = entity.get('pickable');
                    }
                    if (entity.has('isVisible')) {
                        box.isVisible = entity.get('isVisible');
                    }
                    // 加载自定义关联材质
                    if (entity.get('material_id')) {

                    }
                    childAndParent(entity, box);
                }
                // console.warn(box);
            } else if (entity.get('type') === 'mesh') {
                // 模型异步加载，因为mesh需要先加载.babylon文件；
                // console.warn('scene创建mesh：' + entity.get('name'));
                editor.call('scene:mesh:create', entity);
            } else if (entity.get('type') === '2d-gui') {
                if (entity.get('subtype') && entity.get('subtype') === 'root') {
                    let canvas2D = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(entity.get('name'));
                    GUIManager.add2DCanvas(entity.get('resource_id'), canvas2D);
                    entity.node = canvas2D;
                    set2DGUITransform(canvas2D.rootContainer, entity);
                    GUIManager.addUniqueIDIndex(canvas2D.uniqueId, entity.get('resource_id'));
                    entitiesIndex[entity.get('resource_id')] = canvas2D.rootContainer;

                    childAndParent(entity, canvas2D.rootContainer);
                } else if (entity.get('subtype') && entity.get('subtype') === 'panel') {
                    let panel = new BABYLON.GUI.Rectangle(entity.get('name'));
                    entity.node = panel;
                    set2DGUITransform(panel, entity);
                    if (entity.has('gui.color')) {
                        panel.color = Tools.rgba2hsvString(entity.get('gui.color'));
                    }
                    if (entity.has('gui.background')) {
                        panel.background = Tools.rgba2hsvString(entity.get('gui.background'));
                    }
                    if (entity.has('gui.thickness')) {
                        panel.thickness = entity.get('gui.thickness')
                    }
                    if (entity.has('gui.cornerRadius')) {
                        panel.cornerRadius = entity.get('gui.cornerRadius')
                    }
                    entitiesIndex[entity.get('resource_id')] = panel;

                    childAndParent(entity, panel);

                } else if (entity.get('subtype') && entity.get('subtype') === 'button') {
                    let btn = BABYLON.GUI.Button.CreateImageWithCenterTextButton(entity.get('name'), '', '');
                    entity.node = btn;
                    set2DGUITransform(btn, entity);
                    if (entity.has('gui.color')) {
                        btn.color = Tools.rgba2hsvString(entity.get('gui.color'));
                    }
                    if (entity.has('gui.background')) {
                        btn.background = Tools.rgba2hsvString(entity.get('gui.background'));
                    }
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
                    if (entity.has('gui.source') && entity.get('gui.source')) {
                        let asset = editor.call('assets:get', entity.get('gui.source'));
                        if (asset) {
                            getUrl(Config.projectID, asset.get('id'), asset.get('name'), asset.get('file.hash')).then(response => {
                                btn.image!.source = response;
                            });
                        }
                    }
                    entitiesIndex[entity.get('resource_id')] = btn;

                    childAndParent(entity, btn);

                } else if (entity.get('subtype') && entity.get('subtype') === 'image') {
                    let img = new BABYLON.GUI.Image(entity.get('name'), '');
                    entity.node = img;
                    set2DGUITransform(img, entity);
                    if (entity.has('gui.color')) {
                        img.color = Tools.rgba2hsvString(entity.get('gui.color'));
                    }
                    if (entity.has('gui.source') && entity.get('gui.source')) {
                        let asset = editor.call('assets:get', entity.get('gui.source'));
                        if (asset) {
                            getUrl(Config.projectID, asset.get('id'), asset.get('name'), asset.get('file.hash')).then(response => {
                                img.source = response;
                            });
                        }
                    }

                    entitiesIndex[entity.get('resource_id')] = img;

                    childAndParent(entity, img);

                } else if (entity.get('subtype') && entity.get('subtype') === 'text') {
                    let text = new BABYLON.GUI.TextBlock(entity.get('name'), '');
                    entity.node = text;
                    set2DGUITransform(text, entity);
                    if (entity.has('gui.color')) {
                        text.color = Tools.rgba2hsvString(entity.get('gui.color'));
                    }
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
                    entitiesIndex[entity.get('resource_id')] = text;

                    childAndParent(entity, text);

                } else if (entity.get('subtype') && entity.get('subtype') === 'input') {
                    let input = new BABYLON.GUI.InputText(entity.get('name'), '');
                    entity.node = input;
                    set2DGUITransform(input, entity);
                    if (entity.has('gui.color')) {
                        input.color = Tools.rgba2hsvString(entity.get('gui.color'));
                    }
                    if (entity.has('gui.background')) {
                        input.background = Tools.rgba2hsvString(entity.get('gui.background'));
                    }
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
                    entitiesIndex[entity.get('resource_id')] = input;

                    childAndParent(entity, input);

                } else if (entity.get('subtype') && entity.get('subtype') === 'checkbox') {
                    let checkbox = new BABYLON.GUI.RadioButton(entity.get('name'));
                    entity.node = checkbox;
                    set2DGUITransform(checkbox, entity);
                    if (entity.has('gui.color')) {
                        checkbox.color = Tools.rgba2hsvString(entity.get('gui.color'));
                    }
                    if (entity.has('gui.background')) {
                        checkbox.background = Tools.rgba2hsvString(entity.get('gui.background'));
                    }
                    if (entity.has('gui.thickness')) {
                        checkbox.thickness = entity.get('gui.thickness')
                    }
                    if (entity.has('gui.isChecked')) {
                        checkbox.isChecked = entity.get('gui.isChecked')
                    }
                    entitiesIndex[entity.get('resource_id')] = checkbox;

                    childAndParent(entity, checkbox);

                }

            }



        });




        let childAndParent = (entity: Observer, node: Nullable<BABYLON.Node> | Nullable<BABYLON.GUI.Control>) => {
            // children
            let children = entity.get('children');
            for (var i = 0; i < children.length; i++) {
                childIndex[children[i]] = {
                    index: i,
                    parent: node
                };

                if (entitiesIndex[children[i]]) {
                    insertChild(node, entitiesIndex[children[i]], i, entity.get('resource_id'));
                }
            }

            // parenting
            if (!entity.get('parent')) {
                // babylon root
            } else {
                // child
                var details = childIndex[entity.get('resource_id')];
                if (details && details.parent) {
                    insertChild(details.parent, node, details.index, entity.get('resource_id'));
                }
            }
        }

        let insertChild = (parent: Nullable<BABYLON.Node> | Nullable<BABYLON.GUI.Control>, node: Nullable<BABYLON.Node> | Nullable<BABYLON.GUI.Control>, index: number, resource_id: string) => {
            // try to insert the node at the right index
            // 但是babylon不支持直接操作children列表，_children为private类型，可以通过修改.d.ts文件获取，但是也没必要；

            if (node && node instanceof BABYLON.Node) {
                if (parent === null || parent instanceof BABYLON.Node) {
                    node.parent = parent;
                }
            } else if (node && node instanceof BABYLON.GUI.Control) {
                if (parent instanceof BABYLON.GUI.Container) {
                    parent.addControl(node);
                    let last = parent.children.pop();
                    parent.children.splice(index, 0, last!);
                    GUIManager.addUniqueIDIndex(node.uniqueId, resource_id);
                }
            }


            // for (var i = 0, len = parent._children.length; i < len; i++) {
            //     var child = parent._children[i];
            //     if (child instanceof pc.Entity && childIndex[child.getGuid()]) {
            //         // if our index is less than this child's index
            //         // then put the item here
            //         if (index < childIndex[child.getGuid()].index) {
            //             parent.insertChild(node, i);
            //             return;
            //         }
            //     }
            // }

            // // the node can be safely added to the end of the child list
            // parent.addChild(node);
        }

        let set2DGUITransform = (control: BABYLON.GUI.Control, entity: Observer) => {
            if (entity.has('gui.isVisible')) {
                control.isVisible = entity.get('gui.isVisible');
            }
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
            if (entity.has('gui.alpha')) {
                control.alpha = entity.get('gui.alpha');
            }
            if (entity.has('gui.rotation')) {
                control.rotation = Tools.eulerAngleFloatToRadian(entity.get('gui.rotation'));
            }
            if (entity.has('gui.isHighlighted')) {
                control.isHighlighted = entity.get('gui.isHighlighted');
            }

        }




        editor.method('scene:mesh:create', (entity: Observer) => {

            loadBabylon(entity);
            // // 变成异步事件
            // setTimeout(() => { }, 0);
        });


        let loadingBabylonFlag: { [key: string]: boolean } = {};
        let toLoadEntity: { [key: string]: Observer[] } = {};
        let loadBabylon = (entity: Observer) => {
            let assetID: string = entity.get('asset_id');
            let dataBabylon: any = null;

            if (BabylonLoader.hasBabylobData(assetID)) {
                dataBabylon = BabylonLoader.getParsedBabylonData(assetID);
                // BabylonLoader.assembleBabylon(assetID, dataBabylon);
                // 关联mesh
                assembleSceneMesh(entity, dataBabylon);
            } else {
                if (assetID in loadingBabylonFlag) {
                    toLoadEntity[assetID].push(entity);
                } else {
                    loadingBabylonFlag[assetID] = true;
                    toLoadEntity[assetID] = [entity];



                    getJsonAsset(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash).then(response => {
                        dataBabylon = JSON.parse(response);
                        BabylonLoader.babylonCacheData[assetID] = dataBabylon;
                        // BabylonLoader.parseBabylon(assetID, data);
                        BabylonLoader.parseBabylon(assetID, dataBabylon);
                        dataBabylon = BabylonLoader.getParsedBabylonData(assetID);
                        toLoadEntity[assetID].forEach((item: Observer) => {
                            assembleSceneMesh(item, dataBabylon);
                        });
                        // 关联mesh
                    })
                }
            }
        }


        let assembleSceneMesh = async (entity: Observer, parsedBabylon: any) => {
            // TODO: 暂时未考虑TransformNode数据的情况
            if (parsedBabylon) {
                let assetID: string = entity.get('asset_id');
                // 先从.babylon提取原始mesh数据
                let meshID: string = entity.get('babylon_id');
                if (parsedBabylon.meshes[meshID]) {
                    let meshData = parsedBabylon.meshes[meshID];
                    // 结合scene和babylon数据，更新mesh信息
                    meshData.position = entity.has('position') && entity.get('position') ? entity.get('position') : meshData.position;
                    let recordRotation = entity.get('rotation');
                    if (recordRotation && recordRotation.length > 0) {
                        recordRotation = Tools.vector3ToArray(Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(recordRotation)));
                    } else {
                        recordRotation = meshData.rotation;
                    }
                    meshData.rotation = recordRotation;
                    // console.log(meshData.name);
                    // console.warn(meshData.rotation);
                    meshData.scaling = entity.has('scale') && entity.get('scale') ? entity.get('scale') : meshData.scaling;
                    meshData.name = entity.has('name') && entity.get('name') ? entity.get('name') : meshData.name;
                    meshData.id = entity.has('resource_id') && entity.get('resource_id') ? entity.get('resource_id') : meshData.id;
                    meshData.isEnabled = entity.has('enabled') ? entity.get('enabled') : meshData.isEnabled;
                    meshData.isVisible = entity.has('isVisible') ? entity.get('isVisible') : meshData.isVisible;
                    // meshData.pickable = entity.has('pickable') ? entity.get('pickable') : meshData.pickable;
                    // TODO：scene编辑条件下默认就是加载状态；
                    meshData.pickable = true;
                    meshData.checkCollisions = entity.has('checkCollisions') ? entity.get('checkCollisions') : meshData.checkCollisions;
                    meshData.materialId = entity.has('material_id') ? entity.get('material_id') : meshData.materialId;
                    // 要注意是否为root id
                    meshData.parentId = entity.has('parent') ? entity.get('parent') : meshData.parentId;


                    // 判断是否关联了geometry
                    if (meshData.geometryId) {
                        if (VeryEngine.viewScene.getGeometryByID(meshData.geometryId) === null) {
                            if (parsedBabylon.geometries && parsedBabylon.geometries[meshData.geometryId]) {
                                let vertexData = parsedBabylon.geometries[meshData.geometryId];
                                await BabylonLoader.loadGeometry(vertexData, VeryEngine.viewScene, '');
                            }
                        }
                    }
                    // 组装material
                    // console.error(meshData.materialId);
                    if (meshData.materialId) {
                        if (VeryEngine.viewScene.getMaterialByID(meshData.materialId) === null) {
                            // console.error(BabylonLoader.assetsData.babylon[assetID]);
                            if (BabylonLoader.assetsData.babylon[assetID]) {
                                let mats = BabylonLoader.assetsData.babylon[assetID]['materials'];
                                if (mats && mats[meshData.materialId]) {
                                    let matAssetID = mats[meshData.materialId].asset_id;
                                    if (BabylonLoader.assetsData.assets[matAssetID]) {
                                        let newMat = BabylonLoader.assetsData.assets[matAssetID].data;

                                        // 检测texture
                                        if (newMat.diffuseTexture && newMat.diffuseTexture.texture_id) {
                                            newMat.diffuseTexture.name = BabylonLoader.prefix + newMat.diffuseTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.diffuseTexture.texture_id].name;

                                        }
                                        if (newMat.specularTexture && newMat.specularTexture.texture_id) {
                                            newMat.specularTexture.name = BabylonLoader.prefix + newMat.specularTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.specularTexture.texture_id].name;
                                        }
                                        if (newMat.reflectionTexture && newMat.reflectionTexture.texture_id) {
                                            newMat.reflectionTexture.name = BabylonLoader.prefix + newMat.reflectionTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.reflectionTexture.texture_id].name;
                                        }
                                        if (newMat.refractionTexture && newMat.refractionTexture.texture_id) {
                                            newMat.refractionTexture.name = BabylonLoader.prefix + newMat.refractionTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.refractionTexture.texture_id].name;
                                        }
                                        if (newMat.emissiveTexture && newMat.emissiveTexture.texture_id) {
                                            newMat.emissiveTexture.name = BabylonLoader.prefix + newMat.emissiveTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.emissiveTexture.texture_id].name;
                                        }
                                        if (newMat.bumpTexture && newMat.bumpTexture.texture_id) {
                                            newMat.bumpTexture.name = BabylonLoader.prefix + newMat.bumpTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.bumpTexture.texture_id].name;
                                        }
                                        if (newMat.opacityTexture && newMat.opacityTexture.texture_id) {
                                            newMat.opacityTexture.name = BabylonLoader.prefix + newMat.opacityTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.opacityTexture.texture_id].name;
                                        }
                                        if (newMat.ambientTexture && newMat.ambientTexture.texture_id) {
                                            newMat.ambientTexture.name = BabylonLoader.prefix + newMat.ambientTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.ambientTexture.texture_id].name;
                                        }
                                        if (newMat.lightmapTexture && newMat.lightmapTexture.texture_id) {
                                            newMat.lightmapTexture.name = BabylonLoader.prefix + newMat.lightmapTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.lightmapTexture.texture_id].name;
                                        }

                                        await BabylonLoader.loadMaterial(newMat, VeryEngine.viewScene, '');
                                    } else {
                                        console.warn('scene mesh warn');
                                    }
                                }
                            } else {
                                console.warn('scene mesh warn');
                            }
                        }
                    }

                    // 加载mesh
                    let mesh = BabylonLoader.loadMesh(meshData, VeryEngine.viewScene, '');
                    entity.node = mesh;
                    entitiesIndex[entity.get('resource_id')] = mesh;
                    childAndParent(entity, mesh);
                } else {
                    console.warn('scene mesh warn');
                }
            }
        }

    }



}