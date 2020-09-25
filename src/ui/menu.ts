import { ContainerElement } from "./container-element";
import { MenuItem } from "./menu-item";

export class Menu extends ContainerElement {


  public elementOverlay: HTMLElement;
  private _clickableSubmenus: boolean = false;
  private _hovered: MenuItem[] = [];
  public _index: { [key: string]: MenuItem } = {};


  public get open(): boolean {
    return this.class!.contains('open');
  }
  public set open(val: boolean) {
    if (this.class!.contains('open') === !!val)
      return;

    if (val) {
      this.class!.add('open');
      this.element!.focus();
    } else {
      this.class!.remove('open');
    }

    this.emit('open', !!val);
  }


  public constructor(args?: any) {
    super();

    args = args || {};

    this.element = document.createElement('div');
    this.element.tabIndex = 1;
    this.element.classList.add('ui-menu');
    this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);

    this.elementOverlay = document.createElement('div');
    this.elementOverlay.ui = this;
    this.elementOverlay.classList.add('overlay');
    this.elementOverlay.addEventListener('click', this._onClick.bind(this), false);
    this.elementOverlay.addEventListener('contextmenu', this._onContextMenu.bind(this), false);
    this.element.appendChild(this.elementOverlay);

    this.innerElement = document.createElement('div');
    this.innerElement.classList.add('inner');
    this.element.appendChild(this.innerElement);

    // this._index = { };
    // this._hovered = [ ];
    this._clickableSubmenus = args.clickableSubmenus;

    this.on('select-propagate', this._onSelectPropagate.bind(this));
    this.on('append', this._onAppend.bind(this));
    this.on('over', this._onOver.bind(this));
    this.on('open', this._onOpen.bind(this));

  }

  private _onClick(): void {
    this.open = false;
  }

  private _onContextMenu(): void {
    this.open = false;
  }

  private _onKeyDown(evt: KeyboardEvent): void {
    if (this.open && evt.keyCode === 27)
      this.open = false;
  }

  private _onAppend(item: MenuItem) {
    let self = this;
    this._index[item.value] = item;

    item.on('value', function (value: string, valueOld: string) {
      delete self._index[valueOld];
      self._index[value] = item;
    });
    item.once('destroy', function () {
      delete self._index[item.value];
    });
  }

  private _onOver(path: string[]): void {
    this._updatePath(path);
  }

  private _onOpen(state: boolean): void {
    if (state) return;
    this._updatePath([]);
  }

  private _onSelectPropagate(path: string[], selectedItemHasChildren: boolean): void {
    if (this._clickableSubmenus && selectedItemHasChildren) {
      this._updatePath(path);
    } else {
      this.open = false;
      this.emit(path.join('.') + ':select', path);
      this.emit('select', path);
    }
  }

  public findByPath(path: string[] | string): Nullable<MenuItem> {
    if (!(path instanceof Array))
      path = path.split('.');

    let item: Nullable<MenuItem> = null;

    for (let i = 0; i < path.length; i++) {
      if (i === 0) {
        item = this._index[path[i]];
      } else {
        item = item!._index[path[i]];
      }
      if (!item)
        return null;
    }

    return item;
  }

  private _updatePath(path: string[]): void {
    let node: Nullable<MenuItem>;

    // 把之前hover的取消
    for (let i = 0; i < this._hovered.length; i++) {
      node = this._hovered[i];
      if (!node) continue;
      // if (path.length <= i || path[i] !== this._hovered[i]) {
      node.class!.remove('hover');
      node.innerElement!.style.top = '';
      node.innerElement!.style.left = '';
      node.innerElement!.style.right = '';
      // }
    }

    this._hovered = [];
    // node = this;

    for (let i = 0; i < path.length; i++) {
      node = this.findByPath(path.slice(0, i + 1));

      if (!node)
        continue;

      this._hovered.push(node);

      node.class!.add('hover');
      node.innerElement!.style.top = '';
      node.innerElement!.style.left = '';
      node.innerElement!.style.right = '';

      let rect = node.innerElement!.getBoundingClientRect();

      // limit to bottom / top of screen
      if (rect.bottom > window.innerHeight) {
        node.innerElement!.style.top = -(rect.bottom - window.innerHeight) + 'px';
      }
      if (rect.right > window.innerWidth) {
        node.innerElement!.style.left = 'auto';
        // TODO
        node.innerElement!.style.right = (node.parent!.element!.clientWidth) + 'px';
      }
    }
  }


  public position(x: number, y: number): void {

    this.element!.style.display = 'block';
    this.innerElement!.style.width = '158px';
    let rect = this.innerElement!.getBoundingClientRect();
    let left = (x || 0);
    let top = (y || 0);

    // limit to bottom / top of screen
    if (top + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height;
    } else if (top < 0) {
      top = 0;
    }
    if (left + rect.width > window.innerWidth) {
      left = window.innerWidth - rect.width;
    } else if (left < 0) {
      left = 0;
    }

    this.innerElement!.style.left = left + 'px';
    this.innerElement!.style.top = top + 'px';

    this.element!.style.display = '';
  }

  public createItem(key: string, data: any): MenuItem {
    let item = new MenuItem({
      text: data.title || key,
      className: data.className || null,
      value: key,
      icon: data.icon,
      hasChildren: !!(data.items && Object.keys(data.items).length > 0),
      clickableSubmenus: this._clickableSubmenus
    });

    if (data.select) {
      item.on('select', data.select);
    }

    if (data.filter) {
      this.on('open', function () {
        item.enabled = data.filter();
      });
    }

    if (data.hide) {
      this.on('open', function () {
        item.hidden = data.hide();
      });
    }

    return item;
  }


  public static fromData(data: any, args: any) {
    let menu = new Menu(args);

    let listItems = function (data: any, parent: ContainerElement): void {
      for (let key in data) {
        let item = menu.createItem(key, data[key]);
        parent.append(item);
        // console.warn(item.parent);
        if (data[key].items)
          listItems(data[key].items, item);
      }
    };

    listItems(data, menu);

    return menu;
  }

}