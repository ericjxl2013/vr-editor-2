import { Element } from "./element";
import { Tooltip } from "./tooltip";

export class Label extends Element {

  private _text: string;
  public get text(): string {
    if (this._link) {
      return this._link.get(this.path);
    } else {
      return this._text;
    }
  }
  public set text(val: string) {
    if (this._link) {
      // TODO 
      this._link.set(this.path, val)
      val = this._link.get(this.path);
      this._setText(val);
    } else {
      if (this._text === val) return;

      if (val === undefined || val === null) {
        this._text = '';
      } else {
        this._text = val;
      }

      this._setText(this._text);
      this.emit('change', val);
    }
  }

  // if unsafe is true then use innerHTML for the
  // contents
  private _unsafe: boolean;

  public get placeholder(): string {
    return this.element!.getAttribute('placeholder') || '';
  }
  public set placeholder(val: string) {
    this.element!.setAttribute('placeholder', val);
  }

  public get value(): string {
    return this.text;
  }
  public set value(val: string) {
    this.text = val;
  }


  public tooltip: Nullable<Tooltip> = null;


  public constructor(text?: string, placeholder?: string, unsafe?: boolean) {
    super();

    this._text = text ? text : '';
    this._unsafe = unsafe ? unsafe : false;

    this.element = document.createElement('span');
    this.element.classList.add('ui-label');

    if (this._text)
      this._setText(this._text);

    this.on('change', this._onChange);

    if (placeholder) {
      this.placeholder = placeholder;
    }
  }

  private _setText(text: string): void {
    if (this._unsafe) {
      this.element!.innerHTML = text;
    } else {
      this.element!.textContent = text;
    }
  }

  private _onChange(): void {
    if (!this.renderChanges)
      return;

    this.flash();
  };

  public _onLinkChange(value: any) {
    this.text = value;
    this.emit('change', value);
  };



}