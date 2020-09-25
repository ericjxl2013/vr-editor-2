import { Observer } from "../../lib";
import { BabylonLoader } from "../middleware/loader/babylonLoader";

export class AssetsPreview {


    constructor() {



        editor.method('preview:render', function (asset: Observer, width: number, height: number, canvas: HTMLCanvasElement, args: any) {
            width = width || 1;
            height = height || 1;

            // render
            editor.call('preview:' + asset.get('type') + ':render', asset, width, height, canvas, args);
        });


        let matPreviewCanvas = document.createElement('canvas');
        matPreviewCanvas.width = 64;
        matPreviewCanvas.height = 64;
        matPreviewCanvas.style.display = 'none';
        document.body.append(matPreviewCanvas);

        // TODO: 需要按队列渲染，不然异步流程导致同时开的webgl context太多，会崩溃
        let engine = new BABYLON.Engine(matPreviewCanvas, true);
        let scene = new BABYLON.Scene(engine);

        // scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Green());
        scene.clearColor.a = 0;

        // let light = new BABYLON.DirectionalLight('__previewlight', new BABYLON.Vector3(1, 1, 3), scene);
        let light = new BABYLON.HemisphericLight('__previewlight', new BABYLON.Vector3(-3, 1, -5), scene);
        light.intensity = 0.6;

        var camera = new BABYLON.UniversalCamera('__previewCamera', new BABYLON.Vector3(0, 62, -120), scene);
        var node = new BABYLON.TransformNode('__previewNode', scene);
        node.position.copyFrom(camera.position);
        node.rotation.copyFrom(camera.rotation);
        camera.parent = node;
        camera.position = BABYLON.Vector3.Zero();
        camera.rotation = BABYLON.Vector3.Zero();
        camera.inputs.clear();
        node.rotation.x = 27.2 * Math.PI / 180;
        // camera.setTarget(BABYLON.Vector3.Zero());

        let previewSphere = BABYLON.MeshBuilder.CreateSphere('__previewSphere', { diameter: 100 }, scene);

        let defaultMat = new BABYLON.StandardMaterial('__previewShere', scene);
        // defaultMat.diffuseColor = BABYLON.Color3.Green();
        previewSphere.material = defaultMat;
        // engine.runRenderLoop(() => {
        //     if (scene) {
        //         scene.render();
        //     }
        // });


        // engine.dispose();

        let queueMaterialAssets: any[] = [];
        let matQueuing: boolean = false;

        let createMatPreview = async() => {
            matQueuing = true;

            while (queueMaterialAssets.length > 0) {
                let queueElement = queueMaterialAssets.shift();
                // console.error(queueElement[1]._data2.data);
                let newMat =await BabylonLoader.loadMaterial(queueElement[1]._data2.data, scene, '');
                // console.warn(newMat);
                if (newMat) {
                    previewSphere.material = newMat;
                } else {
                    previewSphere.material = defaultMat;
                }

                if (scene.isReady()) {
                    // 球改一下
                    // (<BABYLON.StandardMaterial>previewSphere.material).diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                    scene.render();
                    // TODO: 需要更新
                    BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 64, (data: string) => {
                        // console.log(data);
                        queueElement[0].src = data;
                    });
                } else {
                    setTimeout(() => {
                        waitForRender(queueElement[0]);
                    }, 300);
                    matQueuing = false;
                    return;
                }
            }

            matQueuing = false;
        }


        let waitForRender = (element: any) => {
            if (scene.isReady()) {
                scene.render();
                // TODO: 需要更新
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 64, (data: string) => {
                    // console.log(data);
                    element.src = data;
                });
                setTimeout(createMatPreview, 0);
            } else {
                setTimeout(() => {
                    waitForRender(element);
                }, 300);
            }
        };

        editor.method('material:preview', (thumbnail: any, asset: Observer) => {
            queueMaterialAssets.push([thumbnail, asset]);

        });

        editor.method('material:preview:start', () => {
            if (!matQueuing) {
                // console.warn('入口打开material preview');
                // console.warn(asset);
                setTimeout(createMatPreview, 0);
            } else {
                // console.warn('中间排队material preview');
            }
        });

        // TODO: 简易处理
        editor.method('material:preview:assemble', (asset_data: any) => {
            if (asset_data && asset_data.babylon) {
                for (let firstKey in asset_data.babylon) {
                    if (asset_data.babylon[firstKey]['materials']) {
                        let materialData = asset_data.babylon[firstKey]['materials'];
                        for (let secondKey in materialData) {
                            if (materialData[secondKey]['asset_id']) {
                                let matAssetID = materialData[secondKey]['asset_id'];

                                if (materialData[secondKey]['diffuseTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.diffuseTexture.texture_id;
                                    asset_data.assets[matAssetID].data.diffuseTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['specularTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.specularTexture.texture_id;
                                    asset_data.assets[matAssetID].data.specularTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['reflectionTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.reflectionTexture.texture_id;
                                    asset_data.assets[matAssetID].data.reflectionTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['refractionTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.refractionTexture.texture_id;
                                    asset_data.assets[matAssetID].data.refractionTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['emissiveTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.emissiveTexture.texture_id;
                                    asset_data.assets[matAssetID].data.emissiveTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['bumpTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.bumpTexture.texture_id;
                                    asset_data.assets[matAssetID].data.bumpTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['opacityTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.opacityTexture.texture_id;
                                    asset_data.assets[matAssetID].data.opacityTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['ambientTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.ambientTexture.texture_id;
                                    asset_data.assets[matAssetID].data.ambientTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }

                                if (materialData[secondKey]['lightmapTexture']) {
                                    let textureID = asset_data.assets[matAssetID].data.lightmapTexture.texture_id;
                                    asset_data.assets[matAssetID].data.lightmapTexture.name = BabylonLoader.prefix + textureID + '/' + asset_data.assets[textureID].name;
                                }
                            }

                        }
                    }
                }
            }
        });



    }



}