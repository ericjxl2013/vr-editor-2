import { Element } from '../ui';
import { EventHandle } from '../lib';

// TODO
export class Link {

  private _element: Element;

  private _value: { [key: string]: any } = {};

  public history: any;

  public schema!: LinkSchema;

  public constructor(ele: Element) {
    this._element = ele;
  }

  public get(path: string): any {
    return this._value[path];
  }

  // TODO
  public set(path: string, value: any): boolean {
    this._value[path] = value;
    return true;
  }

  public on(name: string, fn: Function): EventHandle {
    return this._element.on(name, fn);
  }
}


export class LinkSchema {

  public constructor() {

  }

  public has(path: string): boolean {
    return true;
  }

  public get(path: string): any {
    return true;
  }

}