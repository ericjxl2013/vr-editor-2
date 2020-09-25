import { Vector2 } from "./vector2";

export class Material {

  public get color(): BABYLON.Color4 {
    return new BABYLON.Color4();
  }


  public mainTexture!: BABYLON.Texture;

  public mainTextureOffset!: Vector2;
  public mainTextureScale!: Vector2;


  public constructor() {

  }



}