import { Transform } from "./transform";
import { GameObject } from "./gameobject";

export class Component {


  public get transform(): Transform {
    return new Transform();
  }

  public get gameObject(): GameObject {
    return new GameObject();
  }

  public get tag(): string {
    return '';
  }

  public get camera(): Component {
    return new Component();
  }


  public get light(): Component {
    return new Component();
  }

  public get renderer(): Component {
    return new Component();
  }

  public get collider(): Component {
    return new Component();
  }

  public constructor() {

  }



}