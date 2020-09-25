import { Element } from "./element";
import { Tree } from "./tree";
import { TextField } from "./text-field";
import { Observer } from "../lib";

export class TreeItem extends Element {

    public tree: Nullable<Tree>;

    public elementTitle: HTMLElement;
    public elementIcon: HTMLElement;
    public elementText: HTMLElement;

    public _children: number;
    public selectable: boolean;

    public _onMouseUp: any;
    private _dragRelease: any;

    private _dragging: boolean;
    private _allowDrop: boolean;

    public _dragId: number = -1;

    public entity!: Observer;

    public asset: any;
    public users: any;

    public get selected(): boolean {
        return this.class!.contains('selected');
    }
    public set selected(val: boolean) {
        if (this.class!.contains('selected') === !!val)
            return;

        if (val) {
            this.class!.add('selected');

            // console.warn('tree selected');

            this.emit('select');
            if (this.tree)
                this.tree.emit('select', this);

        } else {
            this.class!.remove('selected');

            this.emit('deselect');
            if (this.tree)
                this.tree.emit('deselect', this);
        }
    }

    public get text(): string {
        return this.elementText.textContent || '';
    }
    public set text(val: string) {
        if (this.elementText.textContent === val)
            return;
        this.elementText.textContent = val;
    }

    public get open(): boolean {
        return this.class!.contains('open');
    }
    public set open(val: boolean) {
        if (this.class!.contains('open') === !!val)
            return;

        if (val) {
            this.class!.add('open');
            this.emit('open');
            this.tree!.emit('open', this);
        } else {
            this.class!.remove('open');
            this.emit('close');
            this.tree!.emit('close', this);
        }

        // if (this.element) {
        // }
    }

    public get prev(): Nullable<TreeItem> {
        if ((<HTMLElement>this.element).previousElementSibling && (<HTMLElement>(<HTMLElement>this.element).previousElementSibling).ui && (<HTMLElement>(<HTMLElement>this.element).previousElementSibling).ui instanceof TreeItem) {
            return (<TreeItem>(<HTMLElement>(<HTMLElement>this.element).previousElementSibling).ui);
        } else {
            return null;
        }
    }

    public get next(): Nullable<TreeItem> {
        if ((<HTMLElement>this.element).nextElementSibling && (<HTMLElement>(<HTMLElement>this.element).nextElementSibling).ui && (<HTMLElement>(<HTMLElement>this.element).nextElementSibling).ui instanceof TreeItem) {
            return (<TreeItem>(<HTMLElement>(<HTMLElement>this.element).nextElementSibling).ui);
        } else {
            return null;
        }
    }


    public get allowDrop(): boolean {
        return this._allowDrop;
    }
    public set allowDrop(val: boolean) {
        this._allowDrop = val;
    }


    public constructor(args: TreeItemArgs) {
        super();

        let self = this;
        args = args || {};

        this.tree = null;

        this.element = document.createElement('div');
        this.element.classList.add('ui-tree-item');
        this.element.ui = this;

        if (args.classList) {
            args.classList.forEach(function (className: string): void {
                self.element!.classList.add(className);
            }, this);
        }

        this.elementTitle = document.createElement('div');
        this.elementTitle.classList.add('title');
        this.elementTitle.draggable = true;
        this.elementTitle.tabIndex = 0;
        this.elementTitle.ui = this;
        this.element.appendChild(this.elementTitle);

        this.elementIcon = document.createElement('span');
        this.elementIcon.classList.add('icon');
        this.elementTitle.appendChild(this.elementIcon);

        this.elementText = document.createElement('span');
        this.elementText.textContent = args.text || '';
        this.elementText.classList.add('text');
        this.elementTitle.appendChild(this.elementText);

        this._children = 0;
        this.selectable = true;

        this._onMouseUp = function (evt: MouseEvent) {
            window.removeEventListener('mouseup', self._dragRelease);
            self._dragRelease = null;

            evt.preventDefault();
            evt.stopPropagation();

            self._dragging = false;
            self.emit('dragend');
        };

        this.elementTitle.addEventListener('click', this._onClick, false);
        this.elementTitle.addEventListener('dblclick', this._onDblClick, false);

        this._dragRelease = null;
        this._dragging = false;
        this._allowDrop = (args.allowDrop !== undefined ? !!args.allowDrop : true);

        this.elementTitle.addEventListener('mousedown', this._onMouseDown, false);
        this.elementTitle.addEventListener('dragstart', this._onDragStart, false);
        this.elementTitle.addEventListener('mouseover', this._onMouseOver, false);

        this.on('destroy', this._onDestroy);
        this.on('append', this._onAppend);
        this.on('remove', this._onRemove);
        this.on('select', this._onSelect);
        this.on('deselect', this._onDeselect);

        this.elementTitle.addEventListener('keydown', this._onKeyDown, false);


    }

    // TODO
    public child(index: number): HTMLElement {
        return <HTMLElement>this.element!.children[index + 1];
    };

    private _onClick(evt: MouseEvent): void {
        let htmlEle: HTMLElement = <HTMLElement>evt.target;

        // 可能点击title或者title子项
        if (!(<TreeItem>htmlEle.ui)) {
            if (htmlEle.parentElement && <TreeItem>(htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            } else {
                return;
            }
        }

        if (evt.button !== 0 || !(<TreeItem>htmlEle.ui).selectable)
            return;

        let rect = htmlEle.getBoundingClientRect();

        if ((<TreeItem>htmlEle.ui)._children && (evt.clientX - rect.left) < 0) {
            (<TreeItem>htmlEle.ui).open = !(<TreeItem>htmlEle.ui).open;
        } else {
            (<TreeItem>htmlEle.ui).tree!._onItemClick((<TreeItem>htmlEle.ui));
            evt.stopPropagation();
        }
    };

    private _onDblClick(evt: MouseEvent): void {
        let htmlEle: HTMLElement = <HTMLElement>evt.target;

        // 可能点击title或者title子项
        if (!(<TreeItem>htmlEle.ui)) {
            if (htmlEle.parentElement && <TreeItem>(htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            } else {
                return;
            }
        }

        if (!(<TreeItem>htmlEle.ui).tree!.allowRenaming || evt.button !== 0)
            return;

        evt.stopPropagation();
        let rect = htmlEle.getBoundingClientRect();

        if ((<TreeItem>htmlEle.ui)._children && (evt.clientX - rect.left) < 0) {
            return;
        } else {
            (<TreeItem>htmlEle.ui)._onRename(true);
        }
    };

    private _onMouseDown(evt: MouseEvent): void {
        let htmlEle: HTMLElement = <HTMLElement>evt.target;

        // 可能点击title或者title子项
        if (!(<TreeItem>htmlEle.ui)) {
            if (htmlEle.parentElement && <TreeItem>(htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            } else {
                return;
            }
        }

        if ((<TreeItem>htmlEle.ui).tree && !(<TreeItem>htmlEle.ui).tree!.draggable)
            return;

        evt.stopPropagation();

    };

    private _onDragStart = function (evt: MouseEvent): void {
        let htmlEle: HTMLElement = <HTMLElement>evt.target;

        // 可能点击title或者title子项
        if (!(<TreeItem>htmlEle.ui)) {
            if (htmlEle.parentElement && <TreeItem>(htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            } else {
                return;
            }
        }

        if (!(<TreeItem>htmlEle.ui).tree!.draggable) {
            evt.stopPropagation();
            evt.preventDefault();
            return;
        }

        (<TreeItem>htmlEle.ui)._dragging = true;

        if ((<TreeItem>htmlEle.ui)._dragRelease)
            window.removeEventListener('mouseup', (<TreeItem>htmlEle.ui)._dragRelease);

        (<TreeItem>htmlEle.ui)._dragRelease = (<TreeItem>htmlEle.ui)._onMouseUp;
        window.addEventListener('mouseup', (<TreeItem>htmlEle.ui)._dragRelease, false);

        evt.stopPropagation();
        evt.preventDefault();

        // console.log('drag start');

        (<TreeItem>htmlEle.ui).emit('dragstart');
    };

    private _onMouseOver(evt: MouseEvent): void {
        let htmlEle: HTMLElement = <HTMLElement>evt.target;

        // 可能点击title或者title子项
        if (!(<TreeItem>htmlEle.ui)) {
            if (htmlEle.parentElement && <TreeItem>(htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            } else {
                return;
            }
        }

        evt.stopPropagation();
        (<TreeItem>htmlEle.ui).emit('mouseover', evt);

    };


    private _onSelect(): void {
        this.elementTitle.focus();
    };

    private _onDeselect(): void {
        this.elementTitle.blur();
    };


    private _onKeyDown(evt: KeyboardEvent) {
        let htmlEle: HTMLElement = <HTMLElement>evt.target;

        if (!(<TreeItem>htmlEle.ui)) return;

        let currentItem: TreeItem = <TreeItem>htmlEle.ui;

        if (evt.target && htmlEle.tagName.toLowerCase() === 'input')
            return;

        if ([9, 38, 40, 37, 39].indexOf(evt.keyCode) === -1)
            return;

        evt.preventDefault();
        evt.stopPropagation();

        let selectedItem: Nullable<TreeItem> = null;
        let item: Nullable<TreeItem> = null;
        switch (evt.keyCode) {
            case 9: // tab
                break;
            case 40: // down
                let downItem = currentItem.element!.nextElementSibling;
                if (downItem)
                    item = <TreeItem>(<HTMLElement>downItem).ui;

                if (currentItem._children && currentItem.open) {
                    let first = currentItem.element!.firstElementChild!.nextElementSibling;
                    if (first && (<HTMLElement>first).ui) {
                        selectedItem = <TreeItem>(<HTMLElement>first).ui;
                        // first.ui.selected = true;
                    } else if (item) {
                        selectedItem = item;
                        // item.selected = true;
                    }
                } else if (item) {
                    selectedItem = item;
                    // item.selected = true;
                } else if (currentItem.parent && currentItem.parent instanceof TreeItem) {
                    let parent: Nullable<TreeItem> = currentItem.parent;

                    let findNext = function (from: TreeItem): Nullable<TreeItem> {
                        let next = from.next;
                        if (next) {
                            selectedItem = next;
                            // next.selected = true;
                        } else if (from.parent instanceof TreeItem) {
                            return from.parent;
                        }
                        return null;
                    };
                    parent = findNext(parent);
                    while (parent) {
                        parent = findNext(parent);
                    }
                }
                break;
            case 38: // up
                let itemUp = currentItem.element!.previousElementSibling;
                if (itemUp)
                    item = <TreeItem>(<HTMLElement>itemUp).ui;

                if (item) {
                    if (item._children && item.open && item !== currentItem.parent) {
                        let lastItem = item.element!.lastElementChild;
                        let last: Nullable<TreeItem> = null;
                        if (lastItem && (<HTMLElement>lastItem).ui)
                            last = <TreeItem>(<HTMLElement>lastItem).ui;

                        if (last) {
                            let findLast = function (inside: TreeItem): Nullable<TreeItem> {
                                if (inside._children && inside.open) {
                                    if (inside.element!.lastElementChild && (<HTMLElement>inside.element!.lastElementChild).ui) {
                                        return <TreeItem>(<HTMLElement>inside.element!.lastElementChild).ui;
                                    }
                                    return null;
                                } else {
                                    return null;
                                }
                            }

                            let found: boolean = false;
                            while (!found) {
                                let deeper: Nullable<TreeItem> = findLast(last);
                                if (deeper) {
                                    last = deeper
                                } else {
                                    found = true;
                                }
                            }

                            selectedItem = last;
                            // last.selected = true;
                        } else {
                            selectedItem = item;
                            // item.selected = true;
                        }
                    } else {
                        selectedItem = item;
                        // item.selected = true;
                    }
                } else if (currentItem.parent && currentItem.parent instanceof TreeItem) {
                    selectedItem = currentItem.parent;
                    // this.ui.parent.selected = true;
                }

                break;
            case 37: // left (close)
                if (currentItem.parent !== currentItem.tree && currentItem.open)
                    currentItem.open = false;
                break;
            case 39: // right (open)
                if (currentItem._children && !currentItem.open)
                    currentItem.open = true;
                break;
        }

        if (selectedItem) {
            if (!(Tree._ctrl && Tree._ctrl()) && !(Tree._shift && Tree._shift()))
                currentItem.tree!.clear();
            selectedItem.selected = true;
        }
    }

    private _onRename(select: boolean): void {
        if (select) {
            this.tree!.clear();
            this.tree!._onItemClick(this);
        }

        var self = this;
        this.class!.add('rename');
        // console.log('tree item rename');
        // add remaning field
        var field = new TextField();
        field.parent = this;
        field.renderChanges = false;
        field.value = this.text;
        // field.elementInput.readOnly = !this.tree!.allowRenaming;
        field.elementInput.addEventListener('blur', function () {
            field.destroy();
            self.class!.remove('rename');
        }, false);
        field.on('click', function (evt: MouseEvent) {
            evt.stopPropagation();
        });
        field.element!.addEventListener('dblclick', function (evt) {
            evt.stopPropagation();
        });
        field.on('change', function (value: string) {
            value = value.trim();
            if (value) {
                // 关联observer
                if (self.entity) {
                  self.entity.set('name', value);
                }
                self.emit('rename', value);
            }

            field.destroy();
            self.class!.remove('rename');
        });
        this.elementTitle.appendChild(field.element!);
        field.elementInput.focus();
        field.elementInput.select();
    }

    private _onDestroy(): void {
        this.elementTitle.removeEventListener('click', this._onClick);
        this.elementTitle.removeEventListener('dblclick', this._onDblClick);
        this.elementTitle.removeEventListener('mousedown', this._onMouseDown);
        this.elementTitle.removeEventListener('dragstart', this._onDragStart);
        this.elementTitle.removeEventListener('mouseover', this._onMouseOver);
        this.elementTitle.removeEventListener('keydown', this._onKeyDown);
    }

    private _onAppend(item: TreeItem): void {
        if (this.parent)
            this.parent.emit('append', item);
    }

    private _onRemove(item: TreeItem): void {
        if (this.parent)
            this.parent.emit('remove', item);
    }


    public focus(): void {
        this.elementTitle.focus();
    }

    public append(item: TreeItem): void {
        if (this._children === 1) {
            this.element!.children[1].classList.remove('single');
        }

        item.parent = this;
        this.element!.appendChild(item.element!);
        this._children++;

        if (this._children === 1) {
            item.class!.add('single');
            this.class!.add('container');
        } else if (this._children > 1) {
            item.class!.remove('single');
        }

        let appendChildren = function (treeItem: TreeItem): void {
            treeItem.emit('append', treeItem);

            if (treeItem._children) {
                for (let i = 1; i < treeItem.element!.children.length; i++) {
                    appendChildren(<TreeItem>(<HTMLElement>treeItem.element!.children[i]).ui);
                }
            }
        };
        appendChildren(item);
    }

    public appendBefore(item: TreeItem, referenceItem: TreeItem): void {
        if (this._children === 1) {
            this.element!.children[1].classList.remove('single');
        }

        item.parent = this;
        this.element!.insertBefore(item.element!, referenceItem.element);
        this._children++;

        if (this._children === 1) {
            item.class!.add('single');
            this.class!.add('container');
        } else if (this._children > 1) {
            item.class!.remove('single');
        }

        var appendChildren = function (treeItem: TreeItem): void {
            treeItem.emit('append', treeItem);

            if (treeItem._children) {
                for (var i = 1; i < treeItem.element!.children.length; i++) {
                    appendChildren(<TreeItem>(<HTMLElement>treeItem.element!.children[i]).ui);
                }
            }
        };
        appendChildren(item);
    }

    public appendAfter(item: TreeItem, referenceItem: TreeItem): void {
        item.parent = this;

        // might be last
        if (!referenceItem)
            this.append(item);

        this.element!.insertBefore(item.element!, referenceItem.element!.nextElementSibling);
        this._children++;

        if (this._children === 1) {
            item.class!.add('single');
            this.class!.add('container');
        } else if (this._children === 2) {
            this.element!.children[1].classList.remove('single');
        }

        var appendChildren = function (treeItem: TreeItem): void {
            treeItem.emit('append', treeItem);

            if (treeItem._children) {
                for (var i = 1; i < treeItem.element!.children.length; i++) {
                    appendChildren(<TreeItem>(<HTMLElement>treeItem.element!.children[i]).ui);
                }
            }
        };
        appendChildren(item);
    }


    public remove(item: TreeItem): void {
        if (!this._children || !this.element!.contains(item.element))
            return;

        this.element!.removeChild(item.element!);
        this._children--;

        if (this._children === 0) {
            this.class!.remove('container');
        } else if (this._children === 1 && this.element!.children.length > 2) {
            this.element!.children[1].classList.add('single');
        }

        let removeChildren = function (treeItem: TreeItem): void {
            treeItem.emit('remove', treeItem);

            if (treeItem._children) {
                for (let i: number = 1; i < treeItem.element!.children.length; i++) {
                    if ((<HTMLElement>treeItem.element!.children[i]).ui && (<HTMLElement>treeItem.element!.children[i]).ui instanceof TreeItem) {
                        removeChildren(<TreeItem>(<HTMLElement>treeItem.element!.children[i]).ui);
                    }
                }
            }
        };
        removeChildren(item);
    }
}