import { Element } from "./element";

export class Slider extends Element {

  private _value: number;
  private _lastValue: number;
  public precision: number;

  public elementBar: HTMLElement;
  public elementHandle: HTMLElement;
  public evtTouchId: any;

  private _min: number;
  public get min(): number {
    return this._min;
  }
  public set min(val: number) {
    if (this._min === val)
      return;

    this._min = val;
    this._updateHandle(this._value);
  }

  private _max: number;
  public get max(): number {
    return this._max;
  }
  public set max(val: number) {
    if (this._max === val)
      return;

    this._max = val;
    this._updateHandle(this._value);
  }

  public get value(): number {
    if (this._link) {
      return this._link.get(this.path);
    } else {
      return this._value;
    }
  }
  public set value(val: number) {
    if (this._link) {
      if (!this._link.set(this.path, val))
        this._updateHandle(this._link.get(this.path));
    } else {
      if (this._max !== null && this._max < val)
        val = this._max;

      if (this._min !== null && this._min > val)
        val = this._min;

      // TODO
      if (val === null) {
        this.class!.add('null');
      } else {
        if (typeof val !== 'number')
          val = 0;

        val = (val !== undefined && this.precision !== null) ? parseFloat(val.toFixed(this.precision)) : val;
        this.class!.remove('null');
      }

      this._updateHandle(val);
      this._value = val;

      if (this._lastValue !== val) {
        this._lastValue = val;
        this.emit('change', val);
      }
    }
  }


  public constructor(args?: SliderArgs) {
    super();

    args = args || {};
    this._value = 0;
    this._lastValue = 0;

    this.precision = (args.precision === undefined) ? 2 : args.precision;
    this._min = (args.min === undefined) ? 0 : args.min;
    this._max = (args.max === undefined) ? 1 : args.max;

    this.element = document.createElement('div');
    this.element.classList.add('ui-slider');

    this.elementBar = document.createElement('div');
    this.elementBar.ui = this;
    this.elementBar.classList.add('bar');
    this.element.appendChild(this.elementBar);

    this.elementHandle = document.createElement('div');
    this.elementHandle.ui = this;
    this.elementHandle.tabIndex = 0;
    this.elementHandle.classList.add('handle');
    this.elementBar.appendChild(this.elementHandle);

    this.element.addEventListener('mousedown', this._onMouseDown.bind(this), false);
    this.element.addEventListener('touchstart', this._onTouchStart.bind(this), false);

    this.evtTouchId = null;

    this.on('change', this._onChange);

    // arrows - change
    this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);

  }


  private evtMouseMove(evt: MouseEvent) {
    evt.stopPropagation();
    evt.preventDefault();

    this._onSlideMove(evt.pageX);
  };

  private evtMouseUp(evt: MouseEvent) {
    evt.stopPropagation();
    evt.preventDefault();

    this._onSlideEnd(evt.pageX);
  };

  private evtTouchMove(evt: TouchEvent) {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      let touch = evt.changedTouches[i];

      if (touch.identifier !== this.evtTouchId)
        continue;

      evt.stopPropagation();
      evt.preventDefault();

      this._onSlideMove(touch.pageX);
      break;
    }
  };

  private evtTouchEnd(evt: TouchEvent) {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      let touch = evt.changedTouches[i];

      if (touch.identifier !== this.evtTouchId)
        continue;

      evt.stopPropagation();
      evt.preventDefault();

      this._onSlideEnd(touch.pageX);
      this.evtTouchId = null;
      break;
    }
  };

  private _onChange() {
    if (!this.renderChanges)
      return;

    this.flash();
  };

  private _onKeyDown(evt: KeyboardEvent) {
    if (evt.keyCode === 27)
      return this.elementHandle.blur();

    if (this.disabled || [37, 39].indexOf(evt.keyCode) === -1)
      return;

    evt.stopPropagation();
    evt.preventDefault();

    let x = evt.keyCode === 37 ? -1 : 1;

    if (evt.shiftKey)
      x *= 10;

    let rect = this.element!.getBoundingClientRect();
    let step = (this._max - this._min) / rect.width;
    let value = Math.max(this._min, Math.min(this._max, this.value + x * step));
    value = parseFloat(value.toFixed(this.precision));

    this.renderChanges = false;
    this._updateHandle(value);
    this.value = value;
    this.renderChanges = true;
  };

  public _onLinkChange(value: number) {
    this._updateHandle(value);
    this._value = value;
    this.emit('change', value || 0);
  };

  private _updateHandle(value: number) {
    this.elementHandle.style.left = (Math.max(0, Math.min(1, ((value || 0) - this._min) / (this._max - this._min))) * 100) + '%';
  };

  private _onMouseDown(evt: MouseEvent) {
    if (evt.button !== 0 || this.disabled)
      return;

    this._onSlideStart(evt.pageX);
  };

  private _onTouchStart(evt: TouchEvent) {
    if (this.disabled)
      return;

    for (let i = 0; i < evt.changedTouches.length; i++) {
      let touch = evt.changedTouches[i];
      if (!(<HTMLElement>(touch.target)).ui || (<HTMLElement>(touch.target)).ui !== this)
        continue;

      this.evtTouchId = touch.identifier;
      this._onSlideStart(touch.pageX);
      break;
    }
  };

  private _onSlideStart(pageX: number) {
    this.elementHandle.focus();

    this.renderChanges = false;

    if (this.evtTouchId === null) {
      window.addEventListener('mousemove', this.evtMouseMove.bind(this), false);
      window.addEventListener('mouseup', this.evtMouseUp.bind(this), false);
    } else {
      window.addEventListener('touchmove', this.evtTouchMove.bind(this), false);
      window.addEventListener('touchend', this.evtTouchEnd.bind(this), false);
    }

    this.class!.add('active');

    this.emit('start', this.value);

    this._onSlideMove(pageX);

    if (this._link && this._link.history)
      this._link.history.combine = true;
  };

  private _onSlideMove(pageX: number) {
    let rect = this.element!.getBoundingClientRect();
    let x = Math.max(0, Math.min(1, (pageX - rect.left) / rect.width));

    let range = this._max - this._min;
    let value = (x * range) + this._min;
    value = parseFloat(value.toFixed(this.precision));

    this._updateHandle(value);
    this.value = value;
  };

  private _onSlideEnd(pageX: number) {
    this._onSlideMove(pageX);

    this.renderChanges = true;

    this.class!.remove('active');

    if (this.evtTouchId === null) {
      window.removeEventListener('mousemove', this.evtMouseMove.bind(this));
      window.removeEventListener('mouseup', this.evtMouseUp.bind(this));
    } else {
      window.removeEventListener('touchmove', this.evtTouchMove.bind(this));
      window.removeEventListener('touchend', this.evtTouchEnd.bind(this));
    }

    if (this._link && this._link.history)
      this._link.history.combine = false;

    this.emit('end', this.value);
  };




}


export interface SliderArgs {
  precision?: number;
  min?: number;
  max?: number;
}