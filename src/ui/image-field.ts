import { Element } from "./element";
import { Label } from "./label";

export class ImageField extends Element {

  private _value: any;

  public elementImage: HTMLImageElement | HTMLCanvasElement;

  public _lable: Nullable<Label> = null;


  public get image(): string {
    if (this.elementImage instanceof HTMLCanvasElement) {
      return '';
    } else {
      return (<HTMLImageElement>this.elementImage).src;
    }
  }
  public set image(val: string) {
    if (this.elementImage instanceof HTMLImageElement) {
      this.elementImage.src = val;
    }
  }

  public get empty(): boolean {
    return this.class!.contains('empty');
  }
  public set empty(val: boolean) {
    if (this.class!.contains('empty') === !!val)
      return;

    if (val) {
      this.class!.add('empty');
      this.image = '';
    } else {
      this.class!.remove('empty');
    }
  }

  public get value(): any {
    if (this._link) {
      return this._link.get(this.path);
    } else {
      return this._value;
    }
  }
  public set value(val: any) {
    val = val && parseInt(val) || null;

    if (this._link) {
      if (!this._link.set(this.path, val))
        this._value = this._link.get(this.path);
    } else {
      if (this._value === val && !this.class!.contains('null'))
        return;

      this._value = val;
      this.emit('change', val);
    }
  }


  public constructor(canvas?: boolean) {
    super();

    this.element = document.createElement('div');
    this.element.classList.add('ui-image-field', 'empty');

    if (canvas) {
      this.elementImage = document.createElement('canvas');
      this.elementImage.width = 64;
      this.elementImage.height = 64;
    } else {
      this.elementImage = new Image();
    }

    this.elementImage.classList.add('preview');
    this.element.appendChild(this.elementImage);

    this._value = null;

    // this.element.removeEventListener('click', this._evtClick);
    this.element.addEventListener('click', this._onClick.bind(this), false);
    this.on('change', this._onChange.bind(this));

    // space > click
    this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);

  }

  private _onClick(evt: MouseEvent) {
    this.emit('click', evt);
  };

  private _onChange() {
    if (!this.renderChanges)
      return;

    this.flash();
  };

  private _onKeyDown(evt: KeyboardEvent) {
    if (evt.keyCode === 27)
      return this.element!.blur();

    if (evt.keyCode !== 32 || this.disabled)
      return;

    evt.stopPropagation();
    evt.preventDefault();
    this.emit('pick');
  };

  public _onLinkChange(value: any) {
    this._value = value;
    this.emit('change', value);
  };

}