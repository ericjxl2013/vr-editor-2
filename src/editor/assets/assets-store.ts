import { Button } from "../../ui";
import { VeryEngine } from "../../engine";

export class AssetsStore {

    public constructor() {

        var assetsPanel = VeryEngine.assets;

        var btnStore = new Button('说明文档');
        btnStore.class!.add('store');
        assetsPanel.header.append(btnStore);

        btnStore.on('click', function () {
            window.open('http://doc.veryengine.cn/readme/web/?#/12', '_blank');
        });
    }
}