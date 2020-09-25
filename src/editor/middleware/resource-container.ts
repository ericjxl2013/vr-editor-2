import { GameObject } from "./gameobject";

export class ResourceContainer {

    public gameObjects: GameObject[] = [];


    public constructor() {

    }


    public addGameObject(object: GameObject): void {
        this.gameObjects.push();
        
    }

}