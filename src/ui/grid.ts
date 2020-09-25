import { ContainerElement } from "./container-element";
import { GridItem } from "./grid-item";
import { Hotkeys } from "../editor";

export class Grid extends ContainerElement {

    public dragOver: any;

    private _lastSelect: Nullable<GridItem>;

    private _selecting: boolean;
    private _multiSelect: boolean;


    public get selected(): GridItem[] {
        var items: GridItem[] = [];
        var elements = this.element!.querySelectorAll('.ui-grid-item.selected');

        for (var i = 0; i < elements.length; i++)
            items.push(<GridItem>((<HTMLElement>elements[i]).ui));

        return items;
    }

    public set selected(val: GridItem[]) {
        if (this._selecting)
            return;

        this._selecting = true;

        // deselecting
        var items = this.selected;
        for (var i = 0; i < items.length; i++) {
            if (val && val.indexOf(items[i]) !== -1)
                continue;
            items[i].selected = false;
        }

        if (!val)
            return;

        // selecting
        for (var i = 0; i < val.length; i++) {
            if (!val[i])
                continue;

            val[i].selected = true;
        }

        this._selecting = false;
    }

    public constructor(multiSelect?: boolean) {
        super();

        this.element = document.createElement('ul');
        this.element.tabIndex = 0;
        this.element.classList.add('ui-grid');

        this.innerElement = this.element;

        this._lastSelect = null;
        this._selecting = false;
        this._multiSelect = multiSelect !== undefined ? multiSelect : true;

        this.on('select', this._onSelect);
        this.on('beforeDeselect', this._onBeforeDeselect);

        this.on('append', this._onAppend);
        this.on('remove', this._onRemove);

    }

    public static _ctrl(): boolean {
        return Hotkeys.ctrl;
    }

    public static _shift(): boolean {
        return Hotkeys.shift;
    }

    private _onAppend(): void {

    }

    private _onRemove(): void {

    }

    private _onSelect(item: GridItem) {
        if (this._selecting)
            return;

        if (this._multiSelect && Grid._shift && Grid._shift()) {
            var children = Array.prototype.slice.call(this.element!.childNodes, 0);

            // multi select from-to
            if (this._lastSelect) {
                this._selecting = true;

                var startInd = children.indexOf(this._lastSelect.element);
                var endInd = children.indexOf(item.element);

                // swap if backwards
                if (startInd > endInd) {
                    var t = startInd;
                    startInd = endInd;
                    endInd = t;
                }

                for (var i = startInd; i < endInd; i++) {
                    if (!children[i] || !children[i].ui || children[i].ui.hidden)
                        continue;

                    children[i].ui.selected = true;
                }

                this._selecting = false;
            } else {
                this._lastSelect = item;
            }
        } else if (this._multiSelect && Grid._ctrl && Grid._ctrl()) {
            // multi select
            this._lastSelect = item;
        } else {
            // single select
            var items = this.element!.querySelectorAll('.ui-grid-item.selected');

            if (items.length > 1) {
                for (var i = 0; i < items.length; i++) {
                    if ((<HTMLElement>items[i]).ui === item)
                        continue;

                    (<GridItem>(<HTMLElement>items[i]).ui).selected = false;
                }
            }

            this._lastSelect = item;
        }
    };

    private _onBeforeDeselect(item: GridItem) {
        if (this._selecting)
            return;

        this._selecting = true;

        if (this._multiSelect && Grid._shift && Grid._shift()) {
            this._lastSelect = null;
        } else if (this._multiSelect && Grid._ctrl && Grid._ctrl()) {
            this._lastSelect = null;
        } else {
            var items = this.element!.querySelectorAll('.ui-grid-item.selected');
            if (items.length > 1) {
                for (var i = 0; i < items.length; i++) {
                    if ((<HTMLElement>items[i]).ui === item)
                        continue;
                    (<GridItem>(<HTMLElement>items[i]).ui).selected = false;
                }
                item._selectPending = true;
                this._lastSelect = item;
            }
        }

        this._selecting = false;
    };

    public filter(fn: Function) {
        this.forEach(function (item: HTMLElement) {
            item.hidden = !fn(item);
        });
    };

    public forEach(fn: Function) {
        var child = this.element!.firstChild;
        while (child) {
            if ((<HTMLElement>child).ui)
                fn((<HTMLElement>child).ui);

            child = child.nextSibling;
        };
    };


}