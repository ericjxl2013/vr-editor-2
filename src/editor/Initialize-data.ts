import { Config } from './global';
import { BabylonLoader } from './middleware/loader/babylonLoader';
import { UUid } from './utility/uuid'

export class InitializeData {

    public constructor() {
        this.init();
    }
    private init = async () => {
        // TODO
        Config.projectID = window.location.pathname.substring(8);
        try {
            var refer = document.referrer;
            var data = await ossfile.login(Config.projectID, refer);
            if (data.code === '00000') {
                Config.projectName = data.data;
                document.title = Config.projectName + ' - 万维引擎';
                editor.call('toolbar.project.set', Config.projectName);
                let tmpStr = await ossfile.getJsonConfig(Config.projectID, 'assets');
                if (tmpStr === '') {
                    // console.log(tmpStr);
                    ossfile.upLoadJsonConfig(Config.assetStandard, Config.projectID, 'assets');
                    Config.assetsData = JSON.parse(Config.assetStandard);
                }
                else {
                    Config.assetsData = JSON.parse(tmpStr);
                }
                //地址引用？
                BabylonLoader.assetsData = Config.assetsData;
                editor.call('initAssets', Config.assetsData);
                tmpStr = await ossfile.getJsonConfig(Config.projectID, 'scenes');
                if (tmpStr === '') {
                    tmpStr = Config.sceneStandard;
                    var sceneData = JSON.parse(tmpStr);
                    sceneData['scenes'][0]['id'] = UUid.createUuid().substring(0, 8);
                    var createdTime = UUid.createdAtTime();
                    sceneData['scenes'][0]['projectId'] = Config.projectID;
                    sceneData['scenes'][0]['created'] = createdTime;
                    sceneData['scenes'][0]['modified'] = createdTime;
                    tmpStr = JSON.stringify(sceneData);
                    ossfile.upLoadJsonConfig(tmpStr, Config.projectID, 'scenes');
                }
                let tmpData = JSON.parse(tmpStr);
                let lastScene: number = tmpData.last;
                Config.scenesData = tmpData.scenes[lastScene];
                Config.sceneIndex = lastScene;
                BabylonLoader.scenesData = Config.scenesData;
                BabylonLoader.sceneIndex = lastScene;
                editor.emit('scene:raw', Config.scenesData);
                editor.call('toolbar.scene.set', Config.scenesData.name);
            }
            else {
                console.error(data.message);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}