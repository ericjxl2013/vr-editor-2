import { Element } from "./element";
import { TopElement } from "./top";

export class TextAreaField extends Element {

  public elementInput: HTMLTextAreaElement;
  public evtKeyChange: boolean;
  public ignoreChange: boolean;
  public blurOnEnter: boolean;
  public refocusable: boolean;

  public get value(): string {
    if (this._link) {
      return this._link.get(this.path);
    } else {
      return this.elementInput.value;
    }
  }
  public set value(val: string) {
    if (this._link) {
      // TODO
      // if (!this._link.set(this.path, value)) {
      //   this.elementInput.value = this._link.get(this.path);
      // }

      this._link.set(this.path, val);
      this.elementInput.value = this._link.get(this.path);
    } else {
      if (this.elementInput.value === val)
        return;

      this.elementInput.value = val || '';
      this.emit('change', val);
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

  public get keyChange(): boolean {
    return this.evtKeyChange;
  }
  public set keyChange(val: boolean) {
    if (this.evtKeyChange === !!val)
      return;

    if (val) {
      this.elementInput.addEventListener('keyup', this._onChange.bind(this), false);
    } else {
      this.elementInput.removeEventListener('keyup', this._onChange.bind(this));
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

  public constructor(placeholder?: string, value?: string, blurOnEnter?: boolean) {
    super();

    this.element = document.createElement('div');
    this.element.classList.add('ui-textarea-field');

    this.elementInput = document.createElement('textarea');
    this.elementInput.ui = this;
    this.elementInput.classList.add('field');
    this.elementInput.tabIndex = 0;
    this.elementInput.addEventListener('focus', this._onInputFocus.bind(this), false);
    this.elementInput.addEventListener('blur', this._onInputBlur.bind(this), false);
    this.element.appendChild(this.elementInput);

    if (value !== undefined)
      this.value = value;

    this.elementInput.addEventListener('change', this._onChange.bind(this), false);
    this.elementInput.addEventListener('keydown', this._onKeyDown.bind(this), false);
    this.elementInput.addEventListener('contextmenu', this._onFullSelect.bind(this), false);
    this.evtKeyChange = false;
    this.ignoreChange = false;

    this.blurOnEnter = blurOnEnter !== undefined ? blurOnEnter : true;
    this.refocusable = true;

    this.on('disable', this._onDisable);
    this.on('enable', this._onEnable);
    this.on('change', this._onChangeField);

    if (placeholder)
      this.placeholder = placeholder;

  }

  private _onChange(): void {
    if (this.ignoreChange) return;

    this.value = this.value || '';

    if (!this._link)
      this.emit('change', this.value);
  }

  private _onKeyDown(evt: KeyboardEvent): void {
    if (evt.keyCode === 27) {
      (<HTMLElement>evt.target).blur();
    } else if (this.blurOnEnter && evt.keyCode === 13 && !evt.shiftKey) {
      let focused: boolean = false;

      let parent: Nullable<Element> | Nullable<TopElement> = this.parent;
      while (parent) {
        if (parent.element && parent.element.focus) {
          parent.element.focus();
          focused = true;
          break;
        }
        parent = parent.parent;
      }

      if (!focused)
        (<HTMLElement>evt.target).blur();
    }
  }

  private _onFullSelect(): void {
    this.elementInput.select();
  }

  private _onInputFocus(): void {
    this.class!.add('focus');
    this.emit('input:focus');
  }

  private _onInputBlur(): void {
    this.class!.remove('focus');
    this.emit('input:blur');
  }

  private _onDisable(): void {
    this.elementInput.readOnly = true;
  }

  private _onEnable() {
    this.elementInput.readOnly = false;
  }

  private _onChangeField(): void {
    if (!this.renderChanges)
      return;

    this.flash();
  };

  public focus(select: boolean) {
    this.elementInput.focus();
    if (select) this.elementInput.select();
  }

  public _onLinkChange(value: string) {
    this.elementInput.value = value;
    this.emit('change', value);
  }



}