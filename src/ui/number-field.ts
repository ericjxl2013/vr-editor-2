import { Element } from "./element";

export class NumberField extends Element {

  public precision: Nullable<number>;
  public step: Nullable<number>;
  public max: Nullable<number>;
  public min: Nullable<number>;

  public allowNull: boolean;

  public elementInput: HTMLInputElement;

  private _lastValue: number = -1;

  public blurOnEnter: boolean;
  public refocusable: boolean;
  public _dragging: boolean;

  private _dragDiff: number;
  private _dragStart: number;

  public get value(): number {
    if (this._link) {
      return this._link.get(this.path);
    } else {
      return this.elementInput.value !== '' ? parseFloat(this.elementInput.value) : -1;
    }
  }
  public set value(val: number) {
    if (this._link) {
      if (!this._link.set(this.path, val)) {
        this.elementInput.value = this._link.get(this.path);
      }
    } else {
      if (val !== null) {
        if (this.max !== null && this.max < val)
          val = this.max;

        if (this.min !== null && this.min > val)
          val = this.min;
      }

      val = (val !== null && val !== undefined && (this.precision !== null) ? parseFloat(val.toFixed(this.precision)) : val);
      if (val === undefined)
        val = -1;

      let different = this._lastValue !== val;
      this._lastValue = val;
      this.elementInput.value = val.toString();

      if (different) {
        this.emit('change', val);
      }
    }
  }

  public get placeholder(): string {
    return this.element!.getAttribute('placeholder') || '';
  }
  public set placeholder(val: string) {
    if (!val) {
      this.element!.removeAttribute('placeholder');
    } else {
      this.element!.setAttribute('placeholder', val);
    }
  }

  public get proxy(): string {
    return this.element!.getAttribute('proxy') || '';
  }
  public set proxy(val: string) {
    if (!val) {
      this.element!.removeAttribute('proxy');
    } else {
      this.element!.setAttribute('proxy', val);
    }
  }


  public constructor(args?: NumberFieldArgs) {
    super();

    args = args || {};

    this.precision = (args.precision !== undefined) ? args.precision : null;
    this.step = (args.step != undefined) ? args.step : ((args.precision != null) ? 1 / Math.pow(10, args.precision) : 1);

    this.max = (args.max !== undefined) ? args.max : null;
    this.min = (args.min !== undefined) ? args.min : null;

    this.allowNull = !!args.allowNull;

    this.element = document.createElement('div');
    this.element.classList.add('ui-number-field');

    this.elementInput = document.createElement('input');
    this.elementInput.ui = this;
    this.elementInput.tabIndex = 0;
    this.elementInput.classList.add('field');
    this.elementInput.type = 'text';
    this.elementInput.addEventListener('focus', this._onInputFocus.bind(this), false);
    this.elementInput.addEventListener('blur', this._onInputBlur.bind(this), false);
    this.elementInput.addEventListener('keydown', this._onKeyDown.bind(this), false);
    this.elementInput.addEventListener('dblclick', this._onFullSelect.bind(this), false);
    this.elementInput.addEventListener('contextmenu', this._onFullSelect.bind(this), false);
    this.element.appendChild(this.elementInput);

    if (args.default !== undefined)
      this.value = args.default;

    this.elementInput.addEventListener('change', this._onChange.bind(this), false);
    // this._element.addEventListener('mousedown', this._onMouseDown.bind(this), false);
    // this._element.addEventListener('mousewheel', this._onMouseDown.bind(this), false);

    this.blurOnEnter = true;
    this.refocusable = true;

    this._lastValue = this.value;
    // this._mouseMove = null;
    this._dragging = false;
    this._dragDiff = 0;
    this._dragStart = 0;

    this.on('disable', this._onDisable);
    this.on('enable', this._onEnable);
    this.on('change', this._onChangeField);

    if (args.placeholder)
      this.placeholder = args.placeholder;

  }


  public _onLinkChange(value: string) {
    this.elementInput.value = value || '0';
    this.emit('change', value || '0');
  };

  public _onChange(): void {
    let value = parseFloat(this.elementInput.value);
    if (isNaN(value)) {
      if (this.allowNull) {
        this.value = -1;
      } else {
        this.elementInput.value = '0';
        this.value = 0;
      }
    } else {
      // this.elementInput.value = value;
      this.value = value;
    }
  };


  public focus(select?: boolean) {
    this.elementInput.focus();
    if (select) this.elementInput.select();
  };

  private _onInputFocus() {
    this.class!.add('focus');
  };

  private _onInputBlur() {
    this.class!.remove('focus');
  };

  private _onKeyDown(evt: KeyboardEvent) {
    if (evt.keyCode === 27)
      return this.elementInput.blur();

    if (this.blurOnEnter && evt.keyCode === 13) {
      let focused = false;

      let parent = this.parent;
      while (parent) {
        if (parent.element && parent.element.focus) {
          parent.element.focus();
          focused = true;
          break;
        }

        parent = parent.parent;
      }

      if (!focused)
        this.elementInput.blur();

      return;
    }

    if (this.disabled || [38, 40].indexOf(evt.keyCode) === -1)
      return;

    let inc = evt.keyCode === 40 ? -1 : 1;

    if (evt.shiftKey)
      inc *= 10;

    let value = this.value + (this.step || 1) * inc;

    if (this.max != null)
      value = Math.min(this.max, value);

    if (this.min != null)
      value = Math.max(this.min, value);

    if (this.precision != null)
      value = parseFloat(value.toFixed(this.precision));

    this.value = value;
    // this.ui.value = value;
  };

  private _onFullSelect() {
    this.elementInput.select();
  };

  private _onDisable() {
    this.elementInput.readOnly = true;
  };

  private _onEnable() {
    this.elementInput.readOnly = false;
  };

  private _onChangeField() {
    if (!this.renderChanges)
      return;

    this.flash();
  };




}



export interface NumberFieldArgs {
  default?: number;
  placeholder?: string;
  precision?: number;
  step?: number;
  min?: number;
  max?: number;
  allowNull?: boolean;
}