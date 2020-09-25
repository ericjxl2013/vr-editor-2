import { Transform } from "./transform";
import { BabylonEngine } from "../../engine";

export class GameObject {


  public get gameObject(): GameObject {
    return this;
  }

  public get transform(): Transform {
    return this._transform;
  }
  public set transform(val: Transform) {
    this._transform = val;
  }
  private _transform: Transform;

  public get name(): string {
    return this.transform.name;
  }
  public set name(val: string) {
    this.transform.name = val;
  }

  private _guid: string = '';
  public get guid(): string {
    return this._guid;
  }
  public set guid(val: string) {
    this._guid = val;
  }

  public get isEmpty(): boolean {
    return this._transform.isEmpty;
  }

  public get mesh(): Nullable<BABYLON.AbstractMesh> {
    return this._transform.mesh;
  }

  private _tag: string = '';
  public get tag(): string {
    return this._tag;
  }
  public set tag(val: string) {
    this._tag = val;
  }

  public get isActive(): boolean {
    return this.isEmpty ? false : this.transform.transformNode!.isEnabled();
  }

  constructor(name?: string, mesh: Nullable<BABYLON.AbstractMesh> = null, node: Nullable<BABYLON.TransformNode> = null) {
    if (mesh) {
      this._transform = new Transform('', mesh);
    } else {
      if (node) {
        this._transform = new Transform('', null, node);
      } else if (name) {
        this._transform = new Transform(name);
      } else {
        this._transform = new Transform();
      }
    }
  }

  // TODO
  public static Find(name: string, scene?: BABYLON.Scene): Nullable<GameObject> {
    if (!scene) {
      scene = BabylonEngine.Scene;
    }
    let node: Nullable<BABYLON.Node> = scene.getNodeByName(name);
    if (!node) {
      return null;
    } else {
      if (node instanceof BABYLON.AbstractMesh) {
        return new GameObject('', <BABYLON.AbstractMesh>node);
      } else if (node instanceof BABYLON.TransformNode) {
        return new GameObject('', null, <BABYLON.TransformNode>node);
      } else {
        console.error('GameObject.Find函数查找到不支持的类型：' + node.getClassName());
        return null;
      }
    }
  }



  public static FindGameObjectWithTag(tag: string): void {

  }

  public static FindGameObjectsWithTag(tag: string): void {

  }




  // TODO
  public static Destroy(obj: GameObject): void {
    if (obj) {
      obj.transform.destroy();
    }
  }


  public static CreateInstance(game_object: GameObject): Nullable<GameObject> {
    if (!game_object) {
      return null;
    }

    if (game_object.isEmpty) {
      return new GameObject();
    } else {
      if (game_object.transform.mesh) {
        let tempMesh: BABYLON.AbstractMesh;
        if (game_object.transform.mesh instanceof BABYLON.Mesh) {
          tempMesh = (<BABYLON.Mesh>game_object.transform.mesh).createInstance(game_object.name + '_instance');
        } else {
          tempMesh = (<BABYLON.InstancedMesh>game_object.transform.mesh).sourceMesh.createInstance(game_object.name + '_instance');
        }
        return new GameObject('', tempMesh);
      } else {
        let newNode: Nullable<BABYLON.TransformNode> = game_object.transform.transformNode!.clone(game_object.name + '_intance');
        return new GameObject('', null, newNode);
      }
    }
  }


  public addMesh(mesh: BABYLON.AbstractMesh): void {
    // 删除空物体
    if (this._transform.mesh === null && this._transform.transformNode) {
      this._transform.transformNode.dispose();
    }
    this._transform.mesh = mesh;
  }

  public setActive(value: boolean): void {

  }

  public setActiveRecursively(value: boolean): void {

  }

  public static AddComponent(): void {

  }




  // public static empty(name: string): GameObject {

  // }

}