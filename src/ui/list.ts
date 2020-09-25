import { ContainerElement } from "./container-element";
import { ListItem } from "./list-item";
import { Hotkeys } from "../editor";

export class List extends ContainerElement {


  private _selectable: boolean;
  public get selectable(): boolean {
    return this._selectable;
  }
  public set selectable(val: boolean) {
    if (this._selectable === !!val)
      return;

    this._selectable = val;

    if (this._selectable) {
      this.class!.add('selectable');
    } else {
      this.class!.remove('selectable');
    }
  }

  public _changing: boolean;

  private _selected: ListItem[];
  public get selected(): ListItem[] {
    return this._selected.slice(0);
  }
  public set selected(val: ListItem[]) {
    this._changing = true;

    // deselecting
    let items: ListItem[] = this.selected;
    for (let i = 0; i < items.length; i++) {
      if (val.indexOf(items[i]) !== -1)
        continue;

      items[i].selected = false;
    }

    // selecting
    for (let i = 0; i < val.length; i++) {
      val[i].selected = true;
    }

    this._changing = false;
  }

  public constructor(selectable?: boolean) {
    super();

    this.element = document.createElement('ul');
    this.element.classList.add('ui-list');
    this.innerElement = this.element;

    this._selectable = selectable || true;

    this._changing = false;
    this._selected = [];

    this.on('select', this._onSelect);
    this.on('deselect', this._onDeselect);
    this.on('append', this._onAppend);
  }

  private _onSelect(item: ListItem): void {
    let ind: number = this._selected.indexOf(item);
    if (ind === -1)
      this._selected.push(item);

    if (this._changing)
      return;

    if (List._ctrl && List._ctrl()) {

    } else if (List._shift && List._shift() && this.selected.length) {

    } else {
      this._changing = true;

      let items: ListItem[] = this.selected;

      if (items.length > 1) {
        for (let i = 0; i < items.length; i++) {
          if (items[i] === item)
            continue;

          items[i].selected = false;
        }
      }

      this._changing = false;
    }

    this.emit('change');
  }

  public _onDeselect(item: ListItem): void {
    let ind: number = this._selected.indexOf(item);
    if (ind !== -1) this._selected.splice(ind, 1);

    if (this._changing)
      return;

    if (List._ctrl && List._ctrl()) {

    } else {
      this._changing = true;

      let items: ListItem[] = this.selected;

      if (items.length) {
        for (let i = 0; i < items.length; i++)
          items[i].selected = false;

        item.selected = true;
      }

      this._changing = false;
    }

    this.emit('change');
  }

  private _onAppend(item: ListItem): void {
    if (!item.selected)
      return;

    let ind = this._selected.indexOf(item);
    if (ind === -1) this._selected.push(item);
  }

  public clear(): void {
    this._selected = [];
    ContainerElement.prototype.clear.call(this);
  }

  public static _ctrl(): boolean {
    return Hotkeys.ctrl;
  }

  public static _shift(): boolean {
    return Hotkeys.shift;
  }

}