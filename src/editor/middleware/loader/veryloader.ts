import { GameObject } from "../gameobject";
import { Observer } from "../../../lib";

export class VeryLoader {

    constructor() {

    }


    // 各种回调函数
    public static Append(scene_data: any): void {
        // settings & entities
    }


    public static loadGameObject(entity: Observer): GameObject {

        // 事先并不知道类型，根据components参数进行获取



        return new GameObject();
    }





}