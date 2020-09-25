
interface Events {

}

interface Editor {
  method(name: string, fn: Function): void;
  methodRemove(name: string): void;
  call(name: string, ...args: any[]): any;
  on(name: string, fn: Function): EventHandle;
  once(name: string, fn: Function): EventHandle;
  emit(name: string,
    arg0?: any,
    arg1?: any,
    arg2?: any,
    arg3?: any,
    arg4?: any,
    arg5?: any,
    arg6?: any,
    arg7?: any
  ): Events;
  unbind(name: string, fn: Function): Events;
}

interface EventHandle {
  name: Nullable<string>;
  owner: Nullable<Events>;
  fn: Nullable<Function>;
  unbind(): void;
  call(): void;
  on(name: string, fn: Function): EventHandle;
}

declare type Nullable<T> = T | null;


declare interface Window {
  editor: Editor;
  debug: Debug;
}

declare var editor: Editor;

// declare var debug: debug;

declare interface Element1 {
  destroy(): void;
}


declare interface SelectField {

}

declare interface HTMLElement {
  ui: Element1;
  uiElement: SelectField;
  uiValue: any;
  _ref: IDrop;
}

declare interface TreeItemArgs {
  text?: string;
  classList?: string[];
  allowDrop?: false;
}

interface Debug {
  log(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

declare var debug: Debug;

declare var debug: Debug;


declare interface IDrop {
    ref?: HTMLElement;
    type?: string;
    hole?: boolean;
    passThrough?: boolean;
    filter?: (type: string, data: any) => boolean;
    drop?: (type: string, data: any) => void;
    over?: (type: string, data: any) => void;
    leave?: () => void;
    element?: HTMLElement;
    evtDrop?: (e: DragEvent | MouseEvent) => void;
    unregister?: () => void;
}


