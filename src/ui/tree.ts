import { ContainerElement } from "./container-element";
import { TreeItem } from "./tree-item";
import { Hotkeys } from "../editor";
import { Element } from "./element";

export class Tree extends ContainerElement {

  private elementDrag: HTMLElement;
  public draggable: boolean;
  public _dragging: boolean;
  public _dragItems: TreeItem[] = [];
  public _dragOver: Nullable<TreeItem>;
  private _dragArea: string;
  private _evtDragMove: any;
  public reordering: boolean;
  public dragInstant: boolean;
  private _selected: TreeItem[] = [];

  public allowRenaming: boolean = true;

  public get selected(): TreeItem[] {
    return this._selected.slice(0);
  }

  public constructor() {
    super();

    this.element = document.createElement('div');
    this.element.classList.add('ui-tree');

    this.innerElement = this.element;


    this.elementDrag = document.createElement('div');
    this.elementDrag.classList.add('drag-handle');
    this.element.appendChild(this.elementDrag);

    let self = this;
    this.elementDrag.addEventListener('mousemove', function (evt: MouseEvent): void {
      evt.preventDefault();
      evt.stopPropagation();

      self._onDragMove(evt);
    });
    this.element.addEventListener('mouseleave', function (evt: MouseEvent): void {
      self._onDragOut();
    });

    this.on('select', this._onSelect);
    this.on('deselect', this._onDeselect);
    this.on('append', this._onAppend);
    this.on('remove', this._onRemove);

    this.draggable = true;
    this._dragging = false;
    this._dragItems = [];
    this._dragOver = null;
    this._dragArea = 'inside';
    this._evtDragMove = null;
    this.reordering = true;
    this.dragInstant = true;

    this._selected = [];

  }

  public static _ctrl(): boolean {
    return Hotkeys.ctrl;
  }

  public static _shift(): boolean {
    return Hotkeys.shift;
  }


  private _onDragMove(evt: MouseEvent): void {
    if (!this.draggable)
      return;

    this._hoverCalculate(evt);
    this.emit('dragmove', evt);
  }

  private _hoverCalculate(evt: MouseEvent): void {
    if (!this.draggable || !this._dragOver)
      return;

    let rect = this.elementDrag.getBoundingClientRect();
    let area: number = Math.floor((evt.clientY - rect.top) / rect.height * 5);

    let oldArea = this._dragArea;
    let oldDragOver = this._dragOver;

    if (this._dragOver.parent === this) {
      let parent = false;
      for (let i = 0; i < this._dragItems.length; i++) {
        if (this._dragItems[i].parent === this._dragOver) {
          parent = true;
          this._dragOver = null;
          break;
        }
      }
      if (!parent)
        this._dragArea = 'inside';
    } else {
      // check if we are trying to drag item inside any of its children
      let invalid = false;
      for (let i = 0; i < this._dragItems.length; i++) {
        let parent = this._dragOver.parent;
        while (parent) {
          if (parent === this._dragItems[i]) {
            invalid = true;
            break;
          }

          parent = parent.parent;
        }
      }

      if (invalid) {
        this._dragOver = null;
      } else if (this.reordering && area <= 1 && this._dragItems.indexOf(this._dragOver.prev!) === -1) {
        this._dragArea = 'before';
      } else if (this.reordering && area >= 4 && this._dragItems.indexOf(this._dragOver.next!) === -1 && (this._dragOver._children === 0 || !this._dragOver.open)) {
        this._dragArea = 'after';
      } else {
        let parent = false;
        if (this.reordering && this._dragOver.open) {
          for (let i = 0; i < this._dragItems.length; i++) {
            if (this._dragItems[i].parent === this._dragOver) {
              parent = true;
              this._dragArea = 'before';
              break;
            }
          }
        }
        if (!parent)
          this._dragArea = 'inside';
      }
    }

    if (oldArea !== this._dragArea || oldDragOver !== this._dragOver)
      this._updateDragHandle();
  }


  public _onItemClick(item: TreeItem): void {
    if (Tree._ctrl && Tree._ctrl()) {
      // 按住ctrl键，针对某个item，按第1次选中，按第2次取消选中
      item.selected = !item.selected;
    } else if (Tree._shift && Tree._shift() && this._selected.length) {
      // shift按住以后，往上往下都可进行选择，不断添加选择项，不减少
    //   console.log('shift按钮')
      let from: TreeItem = this._selected[this._selected.length - 1];
      let to: TreeItem = item;

      let up: TreeItem[] = [];
      let down: TreeItem[] = [];

      let prev = function (refItem: TreeItem): Nullable<TreeItem> {
        if (!refItem) return null;
        let result: Nullable<TreeItem> = null;
        let prevItem = refItem.element!.previousElementSibling;
        let item: Nullable<TreeItem> = null;
        if (prevItem) item = <TreeItem>(<HTMLElement>prevItem).ui;

        if (item) {
          if (refItem.parent && refItem.parent === item && refItem.parent instanceof TreeItem) {
            result = refItem.parent;
          } else if (item.open && item._children) {  // 没有open貌似就没有选中
            // element above is open, find last available element
            let lastItem = item.element!.lastElementChild;
            let last: Nullable<TreeItem> = null;
            if (lastItem && (<HTMLElement>lastItem).ui)
              last = <TreeItem>(<HTMLElement>lastItem).ui;

            if (last) {
              let findLast = function (inside: Nullable<TreeItem>) {
                if (inside && inside.open && inside._children) {
                  if (inside.element!.lastElementChild && (<HTMLElement>inside.element!.lastChild).ui) {
                    return <TreeItem>(<HTMLElement>inside.element!.lastChild).ui;
                  } else {
                    return null;
                  }
                } else {
                  return null;
                }
              }

              let found: boolean = false;
              while (!found) {
                let deeper: Nullable<TreeItem> = findLast(last);
                if (deeper) {
                  last = deeper;
                } else {
                  found = true;
                }
              }

              result = last;
            } else {
              result = item;
            }
          } else {
            result = item;
          }
        }

        return result;
      };

      let next = function (refItem: TreeItem): Nullable<TreeItem> {
        let result: Nullable<TreeItem> = null;
        let nextItem = refItem.element!.nextElementSibling;
        let item: Nullable<TreeItem> = null;
        if (nextItem) item = <TreeItem>(<HTMLElement>nextItem).ui;

        if (refItem.open && refItem._children) {
          // select a child
          let first = refItem.element!.firstElementChild!.nextElementSibling;
          if (first && (<HTMLElement>first).ui) {
            result = <TreeItem>(<HTMLElement>first).ui;
          } else if (item) {
            result = item;
          }
        } else if (item) {
          // select next item
          result = item;
        } else if (refItem.parent && refItem.parent instanceof TreeItem) {
          // no next element, go to parent
          let parent: Nullable<TreeItem> = refItem.parent;

          let findNext = function (from: TreeItem): Nullable<TreeItem> {
            let next: Nullable<TreeItem> = from.next;
            if (next) {
              result = next;
            } else if (from.parent instanceof TreeItem) {
              return from.parent;
            }
            return null;
          }
          parent = findNext(parent);
          while (parent) {
            parent = findNext(parent);
          }
        }

        return result;
      };

      let done: boolean = false;
      let path: TreeItem[] = [];
      let lookUp: boolean = true;
      let lookDown: boolean = true;
      let lookingUp: boolean = true;
      // TODO
      while (!done) {
        lookingUp = !lookingUp;

        let item: Nullable<TreeItem> = null;
        let lookFrom: TreeItem = from;
        if ((!lookDown || lookingUp) && lookUp) {
          // up
          if (up.length)
            lookFrom = up[up.length - 1];

          item = prev(lookFrom);
          if (item) {
            up.push(item);

            if (item === to) {
              done = true;
              path = up;
              break;
            }
          } else {
            lookUp = false;
          }
        } else if (lookDown) {
          // down
          if (down.length)
            lookFrom = down[down.length - 1];

          item = next(lookFrom);
          if (item) {
            down.push(item);

            if (item === to) {
              done = true;
              path = down;
              break;
            }
          } else {
            lookDown = false;
          }
        } else {
          done = true;
        }
      }

      if (path) {
        for (let i = 0; i < path.length; i++) {
          path[i].selected = true;
        }
      }


    } else {
      let selected: boolean = item.selected && ((this._selected.indexOf(item) === -1) || (this._selected.length === 1 && this._selected[0] === item));
      this.clear();

      if (!selected)
        item.selected = true;
    }
  }

  private _onSelect(item: TreeItem): void {
    this._selected.push(item);
  }

  private _onDeselect(item: TreeItem): void {
    let index: number = this._selected.indexOf(item);
    if (index === -1)
      return;

    this._selected.splice(index, 1);
  }


  private _onDragStart(item: TreeItem): void {
    if (!this.draggable || this._dragging)
      return;

    this._dragItems = [];

    if (this._selected && this._selected.length > 1 && this._selected.indexOf(item) !== -1) {
      let items: TreeItem[] = [];
      let index: { [key: number]: TreeItem } = {};
      let defaultLevel = -1;

      // build index
      for (let i: number = 0; i < this._selected.length; i++) {
        // cant drag parent
        if (this._selected[i].parent === this)
          return;

        this._selected[i]._dragId = i + 1;
        index[this._selected[i]._dragId] = this._selected[i];
      }

      for (let i: number = 0; i < this._selected.length; i++) {
        let s: TreeItem = this._selected[i];
        let level: number = 0;
        let child: boolean = false;
        let parent: Nullable<Element> = this._selected[i].parent;
        if (!parent || !(parent instanceof TreeItem))
          parent = null;

        while (parent) {
          if (parent._dragId && index[parent._dragId]) {
            // child, to be ignored
            child = true;
            break;
          }

          parent = parent.parent;
          if (!(parent instanceof TreeItem)) {
            parent = null;
            break;
          }

          level++;
        }

        if (!child) {
          if (defaultLevel === -1) {
            defaultLevel = level;
          } else if (defaultLevel !== level) {
            // multi-level drag no allowed
            return;
          }

          items.push(this._selected[i]);
        }
      }

      // clean ids
      for (let i: number = 0; i < this._selected.length; i++)
        this._selected[i]._dragId = -1;

      this._dragItems = items;

      // sort items by their number of apperance in hierarchy
      if (items.length > 1) {
        let commonParent: Nullable<TreeItem> = null;

        // find common parent
        let findCommonParent = function (items: TreeItem[]): TreeItem[] {
          let parents: TreeItem[] = [];
          for (let i: number = 0; i < items.length; i++) {
            if (items[i].parent && items[i].parent instanceof TreeItem) {
              if (parents.indexOf(<TreeItem>items[i].parent) === -1)
                parents.push(<TreeItem>items[i].parent);
            }
          }
          if (parents.length === 1) {
            commonParent = parents[0];
          }
          return parents;
        };
        let parents: TreeItem[] = items;
        while (!commonParent && parents)
          parents = findCommonParent(parents);

        // calculate ind number
        for (let i: number = 0; i < items.length; i++) {
          let ind: number = 0;

          let countChildren = function (item: TreeItem): number {
            if (!item._children) {
              return 0;
            } else {
              let count: number = 0;
              let children = item.element!.children;
              for (let i: number = 0; i < children.length; i++) {
                if ((<HTMLElement>children[i]).ui && (<HTMLElement>children[i]).ui instanceof TreeItem)
                  count += countChildren(<TreeItem>(<HTMLElement>children[i]).ui) + 1;
              }
              return count;
            }
          };

          let scanUpForIndex = function (item: TreeItem): Nullable<TreeItem> {
            ind++;
            let sibling = item.element!.previousElementSibling;
            let siblingItem: Nullable<TreeItem> = null;
            if (sibling && (<HTMLElement>sibling).ui && (<HTMLElement>sibling).ui instanceof TreeItem) {
              siblingItem = <TreeItem>(<HTMLElement>sibling).ui;
            }

            if (siblingItem) {
              ind += countChildren(siblingItem);
              return siblingItem;
            } else if (item.parent === commonParent) {
              return null;
            } else {
              if (item.parent instanceof TreeItem) {
                return <TreeItem>item.parent;
              } else {
                return null;
              }
            }
          };

          let prev: Nullable<TreeItem> = scanUpForIndex(items[i]);
          while (prev)
            prev = scanUpForIndex(prev);

          items[i]._dragId = ind;
        }

        items.sort(function (a, b) {
          return a._dragId - b._dragId;
        });
      }
    } else {
      // single drag
      this._dragItems = [item];
    }

    if (this._dragItems.length) {
      this._dragging = true;

      this.class!.add('dragging');
      for (let i: number = 0; i < this._dragItems.length; i++) {
        this._dragItems[i].class!.add('dragged');
      }

      this._updateDragHandle();
      this.emit('dragstart');
    }
  }

  private _onDragOver(item: TreeItem, evt: MouseEvent): void {
    if (!this.draggable || !this._dragging || (this._dragItems.indexOf(item) !== -1 && !this._dragOver) || this._dragOver === item)
      return;

    let dragOver = null;

    if (item.allowDrop) {
      if (this._dragItems.indexOf(item) === -1)
        dragOver = item;

      if (this._dragOver === null && dragOver)
        this.emit('dragin');
    }



    this._dragOver = dragOver;

    this._updateDragHandle();
    this._onDragMove(evt);
  }

  private _onDragEnd(): void {
    if (!this.draggable || !this._dragging)
      return;

    // TODO
    let reparentedItems: ReparentDragItems[] = [];
    this._dragging = false;
    this.class!.remove('dragging');

    let lastDraggedItem: Nullable<TreeItem> = this._dragOver;

    for (let i: number = 0; i < this._dragItems.length; i++) {
      this._dragItems[i].class!.remove('dragged');

      if (this._dragOver && this._dragOver !== this._dragItems[i]) {

        let oldParent: Nullable<Element> = this._dragItems[i].parent;

        if (oldParent !== this._dragOver || this._dragArea !== 'inside') {
          let newParent: Nullable<Element> = null;

          if (this.dragInstant) {
            if (this._dragItems[i].parent)
              (<TreeItem>(this._dragItems[i].parent!)).remove(this._dragItems[i]);
          }

          if (this._dragArea === 'before') {
            newParent = this._dragOver.parent;
            if (this.dragInstant)
              (<TreeItem>this._dragOver.parent).appendBefore(this._dragItems[i], this._dragOver);
          } else if (this._dragArea === 'inside') {
            newParent = this._dragOver;
            if (this.dragInstant) {
              this._dragOver.open = true;
              this._dragOver.append(this._dragItems[i]);
            }
          } else if (this._dragArea === 'after') {
            newParent = this._dragOver.parent;
            if (this.dragInstant) {
              (<TreeItem>this._dragOver.parent).appendAfter(this._dragItems[i], lastDraggedItem!);
              lastDraggedItem = this._dragItems[i];
            }
          }

          reparentedItems.push({
            item: this._dragItems[i],
            old: oldParent,
            new: newParent
          });
        }
      }
    }

    this.emit('reparent', reparentedItems);

    this._dragItems = [];

    if (this._dragOver)
      this._dragOver = null;

    this.emit('dragend');
  }

  private _onDragOut(): void {
    if (!this.draggable || !this._dragging || !this._dragOver)
      return;

    this._dragOver = null;
    this._updateDragHandle();
    this.emit('dragout');
  }

  public _updateDragHandle(): void {
    if (!this.draggable || !this._dragging)
      return;

    if (!this._dragOver) {
      this.elementDrag.classList.add('hidden');
    } else {
      let rect = this._dragOver.elementTitle.getBoundingClientRect();

      this.elementDrag.classList.remove('before', 'inside', 'after', 'hidden')
      this.elementDrag.classList.add(this._dragArea);

      this.elementDrag.style.top = rect.top + 'px';
      this.elementDrag.style.left = rect.left + 'px';
      this.elementDrag.style.width = (rect.width - 4) + 'px';
    }
  }

  private _onAppend(item: TreeItem): void {
    // console.error('_onAppend');
    item.tree = this;

    let self = this;

    item.on('dragstart', function () {
      // can't drag root  TODO
      if (item.parent === self)
        return;

      self._onDragStart(item);
    });

    item.on('mouseover', function (evt: MouseEvent) {
      self._onDragOver(item, evt);
    });

    item.on('dragend', function () {
      self._onDragEnd();
    });
  }

  private _onRemove(item: TreeItem): void {
    item.tree = null;
    item.unbind('dragstart');
    item.unbind('mouseover');
    item.unbind('dragend');
  }


  public clear(): void {
    if (!this._selected.length)
      return;

    let i: number = this._selected.length;
    while (i--) {
      this._selected[i].selected = false;
    }
    this._selected = [];
  }


}



export interface ReparentDragItems {
  item: TreeItem;
  old: Nullable<Element>;
  new: Nullable<Element>;
}