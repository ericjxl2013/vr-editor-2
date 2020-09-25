import { GameObject } from "../gameobject";

export class Loader {


    constructor() {

    }



    public static append(scene: BABYLON.Scene, data: any, rootUrl: string): boolean {

        data = data || {};


        // scene settings 
        if (data.settings) {
            const settings = data.settings;
            if (settings.autoClear !== undefined && settings.autoClear !== null) {
                scene.autoClear = settings.autoClear;
            }

            if (settings.clearColor !== undefined && settings.clearColor !== null) {
                scene.clearColor = BABYLON.Color4.FromArray(settings.clearColor);
            }
            if (settings.ambientColor !== undefined && settings.ambientColor !== null) {
                scene.ambientColor = BABYLON.Color3.FromArray(settings.ambientColor);
            }
            if (settings.gravity !== undefined && settings.gravity !== null) {
                scene.gravity = BABYLON.Vector3.FromArray(settings.gravity);
            }

            // Fog
            if (settings.fogMode && settings.fogMode !== 0) {
                scene.fogMode = settings.fogMode;
                scene.fogColor = BABYLON.Color3.FromArray(settings.fogColor);
                scene.fogStart = settings.fogStart;
                scene.fogEnd = settings.fogEnd;
                scene.fogDensity = settings.fogDensity;
                // log += "\tFog mode for scene:  ";
                // switch (scene.fogMode) {
                //     // getters not compiling, so using hardcoded
                //     case 1: log += "exp\n"; break;
                //     case 2: log += "exp2\n"; break;
                //     case 3: log += "linear\n"; break;
                // }
            }

            //Physics
            if (settings.physicsEnabled) {
                // var physicsPlugin;
                // if (settings.physicsEngine === "cannon") {
                //     physicsPlugin = new CannonJSPlugin();
                // } else if (settings.physicsEngine === "oimo") {
                //     physicsPlugin = new OimoJSPlugin();
                // }
                // log = "\tPhysics engine " + (settings.physicsEngine ? settings.physicsEngine : "oimo") + " enabled\n";
                //else - default engine, which is currently oimo
                // var physicsGravity = settings.physicsGravity ? BABYLON.Vector3.FromArray(settings.physicsGravity) : null;
                // scene.enablePhysics(physicsGravity, physicsPlugin);
            }
        }

        // gameobjects
        if (data.entities) {
            const entities = data.entities;
            // const total = Object.keys(entities).length;
            // const i = 0;

            for (let key in entities) {
                const entity = entities[key];

                // Root为hirarchy的根元素
                if(entity.type) {
                    let type: string = entity.type.toLowerCase();
                    if(type === 'root') {
                        continue;
                    }
                }

                // 资源解析
                if(entity.components !== undefined) {
                    const components = entity.components;
                    // 先确认有没有mesh
                    if(components.model !== undefined) {
                        const model = components.model;
                        if(model.type === 'assets') {
                            // 加载模型
                            
                            let gameObject = new GameObject();

                            // 去到assets资源处下载
                            // 此时assets资源可能还没有下载完，下载完了也得解析
                            // 资源可能是.babylon，可能是.glTF

                            


                        } else {
                            // TODO： 元模型
                        }
                    }

                    for(let key in components) { 



                    }
                }

            }

        }



        return true;
    }


    // public static loadData(fileinfo: IFileInformation): void {

    // }

}


