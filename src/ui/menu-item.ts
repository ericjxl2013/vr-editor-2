import { ContainerElement } from './container-element';

export class MenuItem extends ContainerElement {


  private _hasChildren: boolean;
  private _clickableSubmenus: boolean = false;
  private _container: boolean;

  public _index: { [key: string]: MenuItem } = {};

  public elementTitle: HTMLElement;
  public elementIcon: Nullable<HTMLElement>;
  public elementText: HTMLElement;

  private _value: string;
  public get value(): string {
    return this._value;
  }
  public set value(val: string) {
    if (this._value === val)
      return;

    let valueOld = this._value;
    this._value = val;
    this.emit('value', val, valueOld);
  }

  public get text(): string {
    return this.elementText.textContent || '';
  }
  public set text(val: string) {
    if (this.elementText.textContent === val)
      return;

    this.elementText.textContent = val;
  }

  public get icon(): string {
    if (this.elementIcon !== null) {
      return this.elementIcon.textContent || '';
    } else {
      return '';
    }
  }
  public set icon(val: string) {
    if ((!val && !this.elementIcon) || (this.elementIcon && this.elementIcon.textContent === val))
      return;

    if (!val) {
      if (this.elementIcon && this.elementIcon.parentNode)
        this.elementIcon.parentNode.removeChild(this.elementIcon);
      this.elementIcon = null;
    } else {
      if (!this.elementIcon) {
        this.elementIcon = document.createElement('span');
        this.elementIcon.classList.add('icon');
        this.elementTitle.insertBefore(this.elementIcon, this.elementText);
      }

      this.elementIcon.innerHTML = val;
    }
  }

  public constructor(args?: MenuItemArgs) {
    super();

    args = args || {};
    this._value = args.value || '';
    this._hasChildren = args.hasChildren || false;
    this._clickableSubmenus = args.clickableSubmenus || false;

    this.element = document.createElement('div');
    this.element.classList.add('ui-menu-item');

    if (args.className) {
      this.element.classList.add(args.className);
    }

    this.elementTitle = document.createElement('div');
    this.elementTitle.classList.add('title');
    this.elementTitle.ui = this;
    this.element.appendChild(this.elementTitle);

    this.elementIcon = null;

    this.elementText = document.createElement('span');
    this.elementText.classList.add('text');
    this.elementText.textContent = args.text || 'Untitled';
    this.elementTitle.appendChild(this.elementText);

    this.innerElement = document.createElement('div');
    this.innerElement.classList.add('content');
    this.element.appendChild(this.innerElement);

    this._index = {};

    this._container = false;

    this.elementTitle.addEventListener('mouseenter', this._onMouseEnter.bind(this), false);
    this.elementTitle.addEventListener('touchstart', this._onTouchStart, false);
    this.elementTitle.addEventListener('touchend', this._onTouchEnd, false);
    this.elementTitle.addEventListener('click', this._onClick.bind(this), false);

    this.on('over', this._onOver.bind(this));
    this.on('select-propagate', this._onSelectPropagate.bind(this));
    this.on('append', this._onAppend.bind(this));

    if (args.icon)
      this.icon = args.icon;

  }


  private _onMouseEnter(evt: MouseEvent): void {
    evt.stopPropagation();
    evt.preventDefault();

    let htmlEle: HTMLElement = <HTMLElement>evt.target;
    (<MenuItem>(htmlEle.ui)).parent!.emit('over', [this._value]);
  }

  private _onTouchStart(evt: TouchEvent): void {
    let item: MenuItem = (<MenuItem>(<HTMLElement>evt.target).ui);

    if (!item.parent || item.disabled)
      return;

    if (!item._container || item.class!.contains('hover')) {
      item.emit('select', item._value, item._hasChildren);
      item.parent.emit('select-propagate', [item._value], item._hasChildren);
      item.class!.remove('hover');
    } else {
      item.parent.emit('over', [item._value]);
    }
  }

  private _onTouchEnd(evt: TouchEvent): void {
    let item: MenuItem = (<MenuItem>(<HTMLElement>evt.target).ui);

    if (!item.parent || item.disabled)
      return;

    evt.preventDefault();
    evt.stopPropagation();
  }

  private _onClick(): void {

    if (!this.parent || this.disabled)
      return;

    this.emit('select', this._value, this._hasChildren);
    this.parent.emit('select-propagate', [this._value], this._hasChildren);

    if (!this._clickableSubmenus || !this._hasChildren) {
      this.class!.remove('hover');
    }
  }

  private _onOver(path: string[]): void {
    if (!this.parent)
      return;
    path.splice(0, 0, this._value);
    this.parent.emit('over', path);
  }

  private _onSelectPropagate(path: string[], selectedItemHasChildren: boolean): void {
    if (!this.parent)
      return;

    path.splice(0, 0, this._value);
    this.parent.emit('select-propagate', path, selectedItemHasChildren);

    if (!this._clickableSubmenus || !selectedItemHasChildren) {
      this.class!.remove('hover');
    }
  }

  private _onAppend(item: MenuItem) {
    let self = this;

    this._container = true;
    this.class!.add('container');

    this._index[item.value] = item;

    item.on('value', function (value: string, valueOld: string) {
      delete self._index[valueOld];
      self._index[value] = item;
    });
    item.once('destroy', function () {
      delete self._index[item.value];
    });
  }

}


export interface MenuItemArgs {
  text?: string;
  className?: string;
  value?: string;
  icon?: string;
  hasChildren?: boolean;
  clickableSubmenus?: boolean;
}