import { Element } from "./element";
import { Tooltip } from "./tooltip";

export class Button extends Element {


  private _text: string;
  public get text(): string {
    return this._text;
  }
  public set text(val: string) {
    if (this._text === val) return;
    this._text = val;
    this.element!.innerHTML = this._text;
  }

  public tooltip: Nullable<Tooltip> = null;
  public op: string = '';


  public constructor(text?: string) {
    super();

    this._text = text ? text : '';

    this.element = document.createElement('div');
    this.element.classList.add('ui-button');
    this.element.innerHTML = this._text;
    this.element.ui = this;
    this.element.tabIndex = 0;

    // space > click
    // 鼠标抬起时完成keydown，才会触发；
    this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);
    this.on('click', this._onClick);
    // this.element.addEventListener('mousedown', this._onClick.bind(this));

  }


  private _onKeyDown(evt: KeyboardEvent): void {
    // console.log('c');
    if (evt.keyCode === 27)  // 27: Escape
      return (<HTMLElement>evt.target).blur();

    if (evt.keyCode !== 32 || this.disabled)  // 32: Space
      return;

    evt.stopPropagation();
    evt.preventDefault();
    this.emit('click');
  }

  private _onClick(): void {
    this.element!.blur();
  };

  // TODO
  public _onLinkChange(value: any): void {
    (<HTMLButtonElement>this.element).value = value;
  };



}