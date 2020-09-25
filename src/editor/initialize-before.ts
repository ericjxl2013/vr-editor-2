import { Hotkeys } from "./hotkeys";
import { ComponentsLogos, ContextMenu } from "./utility";
import { Selector } from "./selector";
import { Realtime } from "./web/realtime";
import { LocalStorage } from "./localstorage";

export class InitializeBefore {

    public constructor() {

        editor.method('permissions:write', () => {
            return true;
        });

        this.init();
    }

    private init(): void {

        // axois默认请求头设置，全局通过json方式传送和接收数据
        // axios.defaults.headers.post["Content-Type"] = "application/json";

        // 全局快捷键注册
        let hotkeys = new Hotkeys();

        // localstorage
        let localstorage = new LocalStorage();

        // components-logos
        let logos = new ComponentsLogos();

        // 屏蔽浏览器默认右键菜单
        let systemContextMenu = new ContextMenu();

        // selector 
        let selector = new Selector();

        // Websocket
        // let io = new Realtime();

    }

}