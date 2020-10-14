import { Tools, AjaxRequest, Ajax, GUID } from "../../../editor/utility";
import { Observer } from "../../../lib";
import { VeryEngine } from "../../../engine";
import { Config } from "../../../editor/global";
import { VeryLight } from "../very-light";
import { VeryCamera } from "../very-camera";
import { getJsonAsset, uploadJsonAsset, getJsonConfig, getUrl, upLoadJsonConfig } from "../../../tools/ossfile";

export class BabylonLoader {


    public static prefix: string = '/assets/';

    public static assetsData: any = {};
    public static projectData: any = {};
    public static scenesData: any = {};
    public static sceneIndex: number = 0;


    public static babylonCacheData: { [key: string]: any } = {};
    public static babylonParsedData: { [key: string]: any } = {};


    constructor() {

    }

    public static loadFromBabylonAsset() {

    }


    public static loadBabylon(asset: Observer) {
        let assetID: string = asset.get('id');
        let dataBabylon: any = null;
        if (BabylonLoader.babylonCacheData[assetID]) {
            console.log(BabylonLoader.babylonCacheData[assetID]);
            dataBabylon = BabylonLoader.babylonCacheData[assetID];
            BabylonLoader.parseBabylon(assetID, dataBabylon);
            BabylonLoader.assembleBabylon(assetID, dataBabylon);
        } else {

            // 直接返回babylon json格式内容数据
            getJsonAsset(Config.projectID, assetID, asset.get('name'), asset.get('file.hash')).then(response => {
                var data = JSON.parse(response);
                // console.log(data);
                dataBabylon = data;
                BabylonLoader.babylonCacheData[assetID] = dataBabylon;
                BabylonLoader.parseBabylon(assetID, dataBabylon);
                BabylonLoader.assembleBabylon(assetID, dataBabylon);
            });
        }
    }


    public static assembleBabylon = async (assetID: string, dataBabylon: any) => {
        if (dataBabylon !== null) {
            // console.warn(dataBabylon);
            // console.log(dataBabylon.meshes);
            // console.log(dataBabylon.materials);
            // console.log(dataBabylon.lights);

            // if (dataBabylon.lights) {
            //     dataBabylon.lights.forEach((element: any) => {
            //         BabylonLoader.loadLight(element, VeryEngine.viewScene);
            //     });
            // }

            // material assemble
            if (BabylonLoader.assetsData.babylon[assetID]) {
                let mats = BabylonLoader.assetsData.babylon[assetID]['materials'];
                for (let key in mats) {
                    if (mats[key].asset_id && BabylonLoader.assetsData.assets[mats[key].asset_id]) {
                        let newMat = BabylonLoader.assetsData.assets[mats[key].asset_id].data;
                        await BabylonLoader.loadMaterial(newMat, VeryEngine.viewScene, '');
                    }
                }
            }

            // geometries assemble
            if (dataBabylon.geometries && dataBabylon.geometries.vertexData) {
                dataBabylon.geometries.vertexData.forEach((parsedVertexData: any) => {
                    BabylonLoader.loadGeometry(parsedVertexData, VeryEngine.viewScene, '');
                });
            }

            // transformNode assemble
            let newTransformNodes: Nullable<BABYLON.TransformNode>[] = [];
            if (dataBabylon.transformNodes) {
                dataBabylon.transformNodes.forEach((parsedTransformNode: any) => {
                    let node = BabylonLoader.loadTransformNode(parsedTransformNode, VeryEngine.viewScene, '');
                    newTransformNodes.push(node);
                });
            }

            // mesh assemble
            let newMeshes: Nullable<BABYLON.AbstractMesh>[] = [];
            let parentMeshes: Nullable<BABYLON.AbstractMesh>[] = [];

            let tempMeshDic: { [key: string]: Nullable<BABYLON.AbstractMesh> } = {};

            let tempMeshID: { [key: string]: string } = {};

            if (dataBabylon.meshes) {
                dataBabylon.meshes.forEach((element: any) => {
                    // 若当前scene数据中已包含mesh id，则重新创建resource_id
                    if (BabylonLoader.scenesData.entities[element.id]) {
                        let newID = GUID.create();
                        let oldID = element.id;
                        // element['babylon_id'] = oldID;
                        tempMeshID[newID] = oldID;
                        element.id = newID;
                        // 遍历，更改parentID
                        dataBabylon.meshes.forEach((element2: any) => {
                            if (element2.parentId === oldID) {
                                element2.parentId = newID;
                                // console.log('change parent id');
                            }
                        });
                    } else {
                        tempMeshID[element.id] = element.id;
                        // element['babylon_id'] = element.id;
                    }
                    // console.error(element);
                });

                dataBabylon.meshes.forEach((element: any) => {
                    let tempMesh = BabylonLoader.loadMesh(element, VeryEngine.viewScene, '');
                    newMeshes.push(tempMesh);
                    tempMeshDic[element.id] = tempMesh;
                });
            }

            // parent 
            // TODO: 若不为root，则mesh这里也要设定父子关系，parent为null则为当前选中物体
            let parent = null;
            let parentNode: Nullable<BABYLON.Node> = null;
            if (editor.call('selector:type') === 'entity')
                parent = editor.call('selector:items')[0];

            if (!parent) {
                parent = editor.call('entities:root');
            } else {
                // console.warn(parent);
                // console.warn(parent.node);
                if (parent.node) {
                    parentNode = parent.node;
                }
            }


            var entities: any[] = [];
            var data: any[] = [];

            // TODO: 还没有考虑有transformNode数据的情况
            for (let index = 0, cache = newTransformNodes.length; index < cache; index++) {
                var transformNode = newTransformNodes[index];
                if (transformNode && transformNode._waitingParentId) {
                    transformNode.parent = VeryEngine.viewScene.getLastEntryByID(transformNode._waitingParentId);
                    transformNode._waitingParentId = null;
                }
            }

            for (let i = 0, len = newMeshes.length; i < len; i++) {
                if (newMeshes[i] !== null) {
                    if (newMeshes[i]!._waitingParentId) {
                        if (tempMeshDic[newMeshes[i]!._waitingParentId!]) {
                            newMeshes[i]!.parent = tempMeshDic[newMeshes[i]!._waitingParentId!];
                        } else {
                            newMeshes[i]!.parent = parentNode;
                            parentMeshes.push(newMeshes[i]);
                        }
                    } else {
                        newMeshes[i]!.parent = parentNode;
                        parentMeshes.push(newMeshes[i]);
                    }
                    newMeshes[i]!._waitingParentId = null;
                    // console.warn(newMeshes[i]);
                }
            }



            for (let i = 0; i < parentMeshes.length; i++) {
                BabylonLoader.meshParseRecursion(parentMeshes[i], assetID, tempMeshID, entities, data);
            }

            editor.call('selector:history', false);
            editor.call('selector:set', 'entity', [editor.call('entities:get', parentMeshes[0]?.id)]);
            editor.once('selector:change', function () {
                editor.call('selector:history', true);
            });

            editor.call('make:scene:dirty');


            // editor.emit('entities:load', true);


            // TODO
            // VeryEngine.viewScene.onPointerObservable.add(pointerInfo => {
            //     switch (pointerInfo.type) {
            //         case BABYLON.PointerEventTypes.POINTERDOWN:
            //             // console.log('down');
            //             if (pointerInfo!.pickInfo!.pickedMesh != null) {
            //                 editor.call('pick', pointerInfo!.pickInfo!.pickedMesh);
            //             } else {
            //                 editor.call('pick', null);
            //             }
            //             // console.log(pointerInfo!.pickInfo!.pickedMesh);
            //             break;
            //     }
            // });
            // });
        }
    }

    public static parseBabylon(assetID: string, babylonData: any): void {
        if (babylonData) {
            let parsedData: any = {};
            // 材质
            if (babylonData.materials) {
                parsedData.materials = {};
                babylonData.materials.forEach((material: any) => {
                    parsedData.materials[material.id] = material;
                });
            }
            // geometries
            if (babylonData.geometries && babylonData.geometries.vertexData) {
                parsedData.geometries = {};
                babylonData.geometries.vertexData.forEach((geometry: any) => {
                    parsedData.geometries[geometry.id] = geometry;
                });
            }
            // mesh
            if (babylonData.meshes) {
                parsedData.meshes = {};
                babylonData.meshes.forEach((mesh: any) => {
                    parsedData.meshes[mesh.id] = mesh;
                });
            }
            // transformNodes
            if (babylonData.transformNodes) {
                parsedData.transformNodes = {};
                babylonData.transformNodes.forEach((transformNode: any) => {
                    parsedData.transformNodes[transformNode.id] = transformNode;
                });
            }
            BabylonLoader.babylonParsedData[assetID] = parsedData;
        }
    }

    public static hasBabylobData(assetID: string): boolean {
        return assetID in BabylonLoader.babylonCacheData;
    }

    public static getBabylonData(assetID: string): any {
        if (assetID in BabylonLoader.babylonCacheData) {
            return BabylonLoader.babylonCacheData[assetID];
        } else {
            return null;
        }
    }

    public static hasParsedBabylonData(assetID: string): boolean {
        return assetID in BabylonLoader.babylonParsedData;
    }

    public static getParsedBabylonData(assetID: string): any {
        if (assetID in BabylonLoader.babylonParsedData) {
            return BabylonLoader.babylonParsedData[assetID];
        } else {
            return null;
        }
    }


    private static meshParseRecursion(mesh: Nullable<BABYLON.AbstractMesh>, assetID: string, tempMeshID: any, entities: any[], data: any[]): void {
        if (mesh) {

            let parentID: string = '';
            if (mesh.parent !== null) {
                parentID = mesh.parent!.id;
            } else {
                let root = editor.call('entities:root');
                parentID = root.get('resource_id');
                // root.insert('children', mesh.id);
                // BabylonLoader.updateSceneData(parentID, root._data2);
                // editor.call('make:scene:dirty');
            }

            var childs = mesh.getChildren();
            var myChildren = [];
            for (let k = 0; k < childs.length; k++) {
                myChildren.push(childs[k].id);
            }

            let eulerAngle = Tools.radianToEulerAngle(mesh.rotation);

            let entityData = {
                name: mesh.name,
                resource_id: mesh.id,
                babylon_id: tempMeshID[mesh.id],  // 原始的mesh id
                asset_id: assetID,  // 对应babylon资源id
                parent: parentID,
                position: [mesh.position.x, mesh.position.y, mesh.position.z],
                rotation: [eulerAngle.x, eulerAngle.y, eulerAngle.z],
                scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                children: myChildren,
                enabled: mesh.isEnabled(),
                checkCollisions: mesh.checkCollisions,
                pickable: mesh.isPickable,
                isVisible: mesh.isVisible,
                tags: [],
                type: 'mesh'
            }

            // editor模式下，isPickable必须为true
            mesh.isPickable = true;

            let entity = editor.call('entities:new', entityData);
            entities.push(entity);
            data.push(entity.origin);

            for (let k = 0; k < childs.length; k++) {
                BabylonLoader.meshParseRecursion(<BABYLON.AbstractMesh>childs[k], assetID, tempMeshID, entities, data);
            }
        }
    }


    public static addSceneData(resource_id: string, data: any): void {
        BabylonLoader.scenesData.entities[resource_id] = data;
        BabylonLoader.scenesData['modified'] = BabylonLoader.createdAtTime();
    }

    public static removeSceneData(resource_id: string): void {
        delete BabylonLoader.scenesData.entities[resource_id];
        BabylonLoader.scenesData['modified'] = BabylonLoader.createdAtTime();
    }

    public static updateSceneData(resource_id: string, data: any): void {
        BabylonLoader.scenesData.entities[resource_id] = data;
        BabylonLoader.scenesData['modified'] = BabylonLoader.createdAtTime();
    }

    public static changeSceneName(resource_id: string, name: string) {
        BabylonLoader.scenesData.entities[resource_id].name = name;
        BabylonLoader.scenesData['name'] = name;
        BabylonLoader.scenesData['modified'] = BabylonLoader.createdAtTime();
        editor.call('make:scene:dirty');
    }

    public static createdAtTime(): string {
        var now = new Date();
        var Y = now.getFullYear();
        var m = BabylonLoader.getRealTime(now.getMonth() + 1);
        var d = BabylonLoader.getRealTime(now.getDate());
        var H = BabylonLoader.getRealTime(now.getHours());
        var i = BabylonLoader.getRealTime(now.getMinutes());
        // var s = getRealTime(now.getSeconds());
        return Y + "-" + m + "-" + d + " " + H + ":" + i;
    }

    private static getRealTime(str: number): string {
        if (str < 10) {
            return "0" + str;
        }
        return str.toString();
    }

    public static saveScene(): void {
        if (Config.isSceneDirty) {

            // var data = {
            //     url: '/api/addScene',
            //     method: 'POST',
            //     // auth: true,
            //     data: { sceneIndex: BabylonLoader.sceneIndex, scene: BabylonLoader.scenesData, projectID: Config.projectID },
            //     ignoreContentType: true,
            //     headers: {
            //         Accept: 'application/json'
            //     }
            // };

            // // 上传全部scene数据
            // (<AjaxRequest>new Ajax(data))
            //     .on('load', (status: any, data: any) => {
            //         // console.log('status: ' + status);
            //         console.log(data);
            //         if (data.code === '0000') {
            //             for (let i = 0, len = data.data.length; i < len; i++) {
            //                 var asset = new Observer(data.data[i]);
            //                 editor.call('assets:add', asset);
            //             }
            //         }
            //     });

            getJsonConfig(Config.projectID, 'scenes').then(function (data) {
                var oldData = JSON.parse(data);
                oldData.scenes[BabylonLoader.sceneIndex] = BabylonLoader.scenesData;
                upLoadJsonConfig(JSON.stringify(oldData), Config.projectID, 'scenes');
                editor.call('make:scene:clear');
            })
        }
    }


    public static loadLight(parsedLight: any, scene: BABYLON.Scene): Nullable<BABYLON.Light> {
        // Light
        if (parsedLight !== undefined && parsedLight !== null) {
            var light = BABYLON.Light.Parse(parsedLight, scene);
            return light;
        }
        return null;
    }

    public static loadReflectionProbe(parsedReflectionProbe: any, scene: BABYLON.Scene, rootUrl: string): Nullable<BABYLON.ReflectionProbe> {
        // ReflectionProbe
        if (parsedReflectionProbe !== undefined && parsedReflectionProbe !== null) {
            var reflectionProbe = BABYLON.ReflectionProbe.Parse(parsedReflectionProbe, scene, rootUrl);
            return reflectionProbe;
        }
        return null;
    }

    public static loadAnimation(parsedAnimation: any): Nullable<BABYLON.Animation[]> {
        // Animation
        if (parsedAnimation !== undefined && parsedAnimation !== null) {
            const internalClass = BABYLON._TypeStore.GetClass("BABYLON.Animation");
            if (internalClass) {
                let animation = internalClass.Parse(parsedAnimation);
                return animation;
            } else {
                return null;
            }
        }
        return null;
    }

    public static loadMaterial = async (newMat: any, scene: BABYLON.Scene, rootUrl: string) => {
        // Material
        return new Promise<Nullable<BABYLON.Material>>(async (resolve, reject) => {
            if (newMat !== undefined && newMat !== null) {
                let textureUrl = "";
                if (newMat.diffuseTexture && newMat.diffuseTexture.texture_id) {
                    let assetID = newMat.diffuseTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash);
                    newMat.diffuseTexture.name = textureUrl;
                }
                if (newMat.specularTexture && newMat.specularTexture.texture_id) {
                    let assetID = newMat.specularTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.specularTexture.name = textureUrl;
                }
                if (newMat.reflectionTexture && newMat.reflectionTexture.texture_id) {
                    let assetID = newMat.reflectionTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.reflectionTexture.name = textureUrl;
                }
                if (newMat.refractionTexture && newMat.refractionTexture.texture_id) {
                    let assetID = newMat.refractionTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.refractionTexture.name = textureUrl;
                }
                if (newMat.emissiveTexture && newMat.emissiveTexture.texture_id) {
                    let assetID = newMat.emissiveTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.emissiveTexture.name = textureUrl;
                }
                if (newMat.bumpTexture && newMat.bumpTexture.texture_id) {
                    let assetID = newMat.bumpTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.bumpTexture.name = textureUrl;
                }
                if (newMat.opacityTexture && newMat.opacityTexture.texture_id) {
                    let assetID = newMat.opacityTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.opacityTexture.name = textureUrl;
                }
                if (newMat.ambientTexture && newMat.ambientTexture.texture_id) {
                    let assetID = newMat.ambientTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.ambientTexture.name = textureUrl;
                }
                if (newMat.lightmapTexture && newMat.lightmapTexture.texture_id) {
                    let assetID = newMat.lightmapTexture.texture_id;
                    textureUrl = await getUrl(Config.projectID, assetID, BabylonLoader.assetsData.assets[assetID].name, BabylonLoader.assetsData.assets[assetID].file.hash)
                    newMat.lightmapTexture.name = textureUrl;
                }
                var mat = BABYLON.Material.Parse(newMat, scene, rootUrl);
                resolve(mat);
            }
            resolve(null);
        })

    }

    public static loadMultiMaterial(parsedMultiMaterial: any, scene: BABYLON.Scene): Nullable<BABYLON.MultiMaterial> {
        // MultiMaterial
        if (parsedMultiMaterial !== undefined && parsedMultiMaterial !== null) {
            var mmat = BABYLON.MultiMaterial.ParseMultiMaterial(parsedMultiMaterial, scene);
            return mmat;
        }
        return null;
    }

    public static loadMorphTargetManager(managerData: any, scene: BABYLON.Scene): Nullable<BABYLON.MorphTargetManager> {
        // MorphTargetManager
        if (managerData !== undefined && managerData !== null) {
            var morphTarget = BABYLON.MorphTargetManager.Parse(managerData, scene);
            return morphTarget;
        }
        return null;
    }

    public static loadSkeleton(parsedSkeleton: any, scene: BABYLON.Scene): Nullable<BABYLON.Skeleton> {
        // Skeleton
        if (parsedSkeleton !== undefined && parsedSkeleton !== null) {
            var skeleton = BABYLON.Skeleton.Parse(parsedSkeleton, scene);
            return skeleton;
        }
        return null;
    }

    public static loadGeometry(vertexData: any, scene: BABYLON.Scene, rootUrl: string): Nullable<BABYLON.Geometry> {
        // Geometry
        if (vertexData !== undefined && vertexData !== null) {
            var geometry = BABYLON.Geometry.Parse(vertexData, scene, rootUrl);
            return geometry;
        }
        return null;
    }

    public static loadTransformNode(parsedTransformNode: any, scene: BABYLON.Scene, rootUrl: string): Nullable<BABYLON.TransformNode> {
        // TransformNode
        if (parsedTransformNode !== undefined && parsedTransformNode !== null) {
            var node = BABYLON.TransformNode.Parse(parsedTransformNode, scene, rootUrl);
            return node;
        }
        return null;
    }


    public static loadMesh(parsedMesh: any, scene: BABYLON.Scene, rootUrl: string): Nullable<BABYLON.AbstractMesh> {
        // Mesh
        if (parsedMesh !== undefined && parsedMesh !== null) {
            var mesh = <BABYLON.AbstractMesh>BABYLON.Mesh.Parse(parsedMesh, scene, rootUrl);
            return mesh;
        }
        return null;
    }


    public static loadCamera(parsedCamera: any, scene: BABYLON.Scene): Nullable<BABYLON.Camera> {
        // Camera
        if (parsedCamera !== undefined && parsedCamera !== null) {
            var camera = BABYLON.Camera.Parse(parsedCamera, scene);
            return camera;
        }
        return null;
    }

    public static loadAnimationGroup(parsedAnimationGroup: any, scene: BABYLON.Scene): Nullable<BABYLON.AnimationGroup> {
        // AnimationGroup
        if (parsedAnimationGroup !== undefined && parsedAnimationGroup !== null) {
            var animationGroup = BABYLON.AnimationGroup.Parse(parsedAnimationGroup, scene);
            return animationGroup;
        }
        return null;
    }


    public static setBabylonParent(scene: BABYLON.Scene): void {
        let index, cache = 0;
        // Browsing all the graph to connect the dots
        for (let index = 0, cache = scene.cameras.length; index < cache; index++) {
            var camera = scene.cameras[index];
            if (camera._waitingParentId) {
                camera.parent = scene.getLastEntryByID(camera._waitingParentId);
                camera._waitingParentId = null;
            }
        }

        for (index = 0, cache = scene.lights.length; index < cache; index++) {
            let light = scene.lights[index];
            if (light && light._waitingParentId) {
                light.parent = scene.getLastEntryByID(light._waitingParentId);
                light._waitingParentId = null;
            }
        }

        //加载完所有资源以后，设立父子关系，加入在自己的引擎中，这些关系有scene数据确立，可以取消此处的操作
        // Connect parents & children and parse actions
        for (index = 0, cache = scene.transformNodes.length; index < cache; index++) {
            var transformNode = scene.transformNodes[index];
            if (transformNode._waitingParentId) {
                transformNode.parent = scene.getLastEntryByID(transformNode._waitingParentId);
                transformNode._waitingParentId = null;
            }
        }
        for (index = 0, cache = scene.meshes.length; index < cache; index++) {
            var mesh = scene.meshes[index];
            if (mesh._waitingParentId) {
                mesh.parent = scene.getLastEntryByID(mesh._waitingParentId);
                mesh._waitingParentId = null;
            }
        }

        // freeze world matrix application
        // 此部分为babylon隐藏方法
        // for (index = 0, cache = scene.meshes.length; index < cache; index++) {
        //     var currentMesh = scene.meshes[index];
        //     if (currentMesh._waitingFreezeWorldMatrix) {
        //         currentMesh.freezeWorldMatrix();
        //         currentMesh._waitingFreezeWorldMatrix = null;
        //     } else {
        //         currentMesh.computeWorldMatrix(true);
        //     }
        // }
    }


    // hierarchy创建灯光，直接创建wraper

    public static createCameraWraper(name: string, scene: BABYLON.Scene, canvas: HTMLCanvasElement): VeryCamera {
        var camera = new BABYLON.UniversalCamera(name, new BABYLON.Vector3(0, 100, -200), scene);
        // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        // camera.minZ = -800;
        camera.maxZ = 20000;

        let cameraWraper = new VeryCamera(camera, scene, canvas);

        cameraWraper.orthoSize = 0.5;

        return cameraWraper;
    }


    public static createLightWraper(type: string, name: string, scene: BABYLON.Scene): VeryLight {
        let light = BabylonLoader.createLight(type, name, scene);

        let lightWraper = new VeryLight(light, scene);

        return lightWraper;
    }



    public static createLight(type: string, name: string, scene: BABYLON.Scene): BABYLON.Light {
        let light: BABYLON.Light;

        type = type.toLowerCase();
        if (type === 'point') {
            light = new BABYLON.PointLight(name, BABYLON.Vector3.Zero(), scene);
        } else if (type === 'spot') {
            light = new BABYLON.SpotLight(name, BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, -1, 0), Math.PI * 0.75, 8, scene);
        } else if (type === 'hemispheric') {
            light = new BABYLON.HemisphericLight(name, BABYLON.Vector3.Up(), scene);
        } else {
            light = new BABYLON.DirectionalLight(name, BABYLON.Vector3.Forward(), scene);
        }

        return light;
    }

    public static createPrimitive(type: string, name: string, scene: BABYLON.Scene): BABYLON.TransformNode {
        let primitive: BABYLON.TransformNode;
        if (type === 'box') {
            primitive = BABYLON.MeshBuilder.CreateBox(name, {}, scene);
        } else if (type === 'sphere') {
            primitive = BABYLON.MeshBuilder.CreateSphere(name, {}, scene);
        } else if (type === 'plane') {
            primitive = BABYLON.MeshBuilder.CreateGround(name, {}, scene);
        }
        else if (type === 'cylinder') {
            primitive = BABYLON.MeshBuilder.CreateCylinder(name, {}, scene);
        }
        // else if (type === 'capsule') {
        //     primitive = BABYLON.MeshBuilder(name, {}, scene);
        // } 
        else {
            primitive = new BABYLON.TransformNode(name, scene);
        }
        return primitive;
    }


    public static load(rootUrl: string, sceneFilename: string | File = "", scene: BABYLON.Scene): any {

        // // Browsing all the graph to connect the dots
        // for (index = 0, cache = scene.cameras.length; index < cache; index++) {
        //     var camera = scene.cameras[index];
        //     if (camera._waitingParentId) {
        //         camera.parent = scene.getLastEntryByID(camera._waitingParentId);
        //         camera._waitingParentId = null;
        //     }
        // }

        // for (index = 0, cache = scene.lights.length; index < cache; index++) {
        //     let light = scene.lights[index];
        //     if (light && light._waitingParentId) {
        //         light.parent = scene.getLastEntryByID(light._waitingParentId);
        //         light._waitingParentId = null;
        //     }
        // }

        // //加载完所有资源以后，设立父子关系，加入在自己的引擎中，这些关系有scene数据确立，可以取消此处的操作
        // // Connect parents & children and parse actions
        // for (index = 0, cache = scene.transformNodes.length; index < cache; index++) {
        //     var transformNode = scene.transformNodes[index];
        //     if (transformNode._waitingParentId) {
        //         transformNode.parent = scene.getLastEntryByID(transformNode._waitingParentId);
        //         transformNode._waitingParentId = null;
        //     }
        // }
        // for (index = 0, cache = scene.meshes.length; index < cache; index++) {
        //     var mesh = scene.meshes[index];
        //     if (mesh._waitingParentId) {
        //         mesh.parent = scene.getLastEntryByID(mesh._waitingParentId);
        //         mesh._waitingParentId = null;
        //     }
        // }

        // // freeze world matrix application
        // for (index = 0, cache = scene.meshes.length; index < cache; index++) {
        //     var currentMesh = scene.meshes[index];
        //     if (currentMesh._waitingFreezeWorldMatrix) {
        //         currentMesh.freezeWorldMatrix();
        //         currentMesh._waitingFreezeWorldMatrix = null;
        //     } else {
        //         currentMesh.computeWorldMatrix(true);
        //     }
        // }

        // // Lights exclusions / inclusions
        // for (index = 0, cache = scene.lights.length; index < cache; index++) {
        //     let light = scene.lights[index];
        //     // Excluded check
        //     if (light._excludedMeshesIds.length > 0) {
        //         for (var excludedIndex = 0; excludedIndex < light._excludedMeshesIds.length; excludedIndex++) {
        //             var excludedMesh = scene.getMeshByID(light._excludedMeshesIds[excludedIndex]);

        //             if (excludedMesh) {
        //                 light.excludedMeshes.push(excludedMesh);
        //             }
        //         }

        //         light._excludedMeshesIds = [];
        //     }

        //     // Included check
        //     if (light._includedOnlyMeshesIds.length > 0) {
        //         for (var includedOnlyIndex = 0; includedOnlyIndex < light._includedOnlyMeshesIds.length; includedOnlyIndex++) {
        //             var includedOnlyMesh = scene.getMeshByID(light._includedOnlyMeshesIds[includedOnlyIndex]);

        //             if (includedOnlyMesh) {
        //                 light.includedOnlyMeshes.push(includedOnlyMesh);
        //             }
        //         }

        //         light._includedOnlyMeshesIds = [];
        //     }
        // }


    }




    private static _getFileInfo(rootUrl: string, sceneFilename: string | File): Nullable<IFileInformation> {
        let url: string;
        let name: string;
        let file: Nullable<File> = null;

        if (!sceneFilename) {
            url = rootUrl;
            name = Tools.GetFilename(rootUrl);
            rootUrl = Tools.GetFolderPath(rootUrl);
        }
        else if ((sceneFilename as File).name) {
            const sceneFile = sceneFilename as File;
            url = rootUrl + sceneFile.name;
            name = sceneFile.name;
            file = sceneFile;
        }
        else {
            const filename = sceneFilename as string;
            if (filename.substr(0, 1) === "/") {
                Tools.Error("Wrong sceneFilename parameter");
                return null;
            }

            url = rootUrl + filename;
            name = filename;
        }

        return {
            url: url,
            rootUrl: rootUrl,
            name: name,
            file: file
        };
    }


}


interface IFileInformation {
    /**
     * Gets the file url
     */
    url: string;
    /**
     * Gets the root url
     */
    rootUrl: string;
    /**
     * Gets filename
     */
    name: string;
    /**
     * Gets the file
     */
    file: Nullable<File>;
}