import { Events } from '../lib';

export class Editor extends Events {

  // 相较于Events，同一个函数名只可代表一个函数；

  // 某个name对应的某个事件，name与Function是1对1的关系；
  private _hooks: { [key: string]: Function } = {};

  public constructor() {
    super();
  }

  /**
   * 添加全局函数，函数名与函数本体一一对应，不能重名；
   * @param name 函数名；
   * @param fn 函数本体；
   */
  public method(name: string, fn: Function): void {
    if (this._hooks[name] !== undefined) {
      throw new Error("can't override hook: " + name);
    }
    this._hooks[name] = fn;
  };

  /**
   * 移除某个函数；
   * @param name 函数名；
   */
  public methodRemove(name: string): void {
    delete this._hooks[name];
  };

  /**
   * 执行某个函数；
   * @param name 函数名；
   */
  public call(name: string, ...args: any[]): any {
    if (this._hooks[name]) {
      var args = Array.prototype.slice.call(arguments, 1);

      try {
        return this._hooks[name].apply(null, args);
      } catch (ex) {
        console.error(
          "%c%s %c(editor.method error)",
          "color: #06f",
          name,
          "color: #f00"
        );
        console.error(ex.stack);
      }
    }
    return null;
  };
}