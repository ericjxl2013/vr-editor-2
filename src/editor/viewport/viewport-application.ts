import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
import { CameraGizmo, LightGizmo } from '../gizmos';
import { Config } from '../global';
import { VeryLight } from '../middleware';
import { BabylonLoader } from '../middleware/loader/babylonLoader';
import {Tools } from '../utility';
import {getJsonAsset,getUrl} from "../../tools/ossfile";

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
                    if (cameraWraper.camera instanceof BABYLON.FreeCamera) {
                        cameraWraper.camera.checkCollisions = entity.get('checkCollisions');
                    }
                }
                if (entity.has('applyGravity')) {
                    if (cameraWraper.camera instanceof BABYLON.FreeCamera) {
                        cameraWraper.camera.applyGravity = entity.get('applyGravity');
                    }
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
            }



        });




        let childAndParent = (entity: Observer, node: Nullable<BABYLON.Node>) => {
            // children
            let children = entity.get('children');
            for (var i = 0; i < children.length; i++) {
                childIndex[children[i]] = {
                    index: i,
                    parent: node
                };

                if (entitiesIndex[children[i]]) {
                    insertChild(node, entitiesIndex[children[i]], i);
                }
            }

            // parenting
            if (!entity.get('parent')) {
                // babylon root
            } else {
                // child
                var details = childIndex[entity.get('resource_id')];
                if (details && details.parent) {
                    insertChild(details.parent, node, details.index);
                }
            }
        }

        let insertChild = (parent: Nullable<BABYLON.Node>, node: Nullable<BABYLON.Node>, index: number) => {
            // try to insert the node at the right index
            // 但是babylon不支持直接操作children列表，_children为private类型，可以通过修改.d.ts文件获取，但是也没必要；
            if (node !== null) {
                node.parent = parent;
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

                    getJsonAsset(Config.projectID,assetID,BabylonLoader.assetsData.assets[assetID].name,BabylonLoader.assetsData.assets[assetID].file.hash).then(response=>{
                        dataBabylon=JSON.parse(response);
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


        let assembleSceneMesh = async(entity: Observer, parsedBabylon: any) => {
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
                                        BabylonLoader.loadMaterial(newMat, VeryEngine.viewScene, '');
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