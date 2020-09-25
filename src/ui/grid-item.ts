import { Element } from "./element";
import { Observer } from "../lib";
import { TreeItem } from "./tree-item";

export class GridItem extends Element {

    private _clicked: boolean;
    public _selectPending: boolean;
    private _toggleSelectOnClick: boolean;

    private _text: string;
    public get text(): string {
        return this._text;
    }
    public set text(val: string) {
        if (this._text === val) return;
        this._text = val;
        this.element!.innerHTML = this._text;
    }

    // TODO
    public asset!: Observer;
    public tree!: TreeItem;
    public thumbnail?: any;
    public labelElement?: any;
    public users?: any;
    public script?: any;

    private _selected: boolean;
    public get selected(): boolean {
        return this._selected;
    }
    public set selected(val: boolean) {
        if (this._selected === val)
            return;

        this._selectPending = val;

        if (this.parent && this._clicked)
            this.parent.emit('before' + (val ? 'Select' : 'Deselect'), this, this._clicked);

        if (this._selected === this._selectPending)
            return;

        this._selected = this._selectPending;

        if (this._selected) {
            this.element!.classList.add('selected');
        } else {
            this.element!.classList.remove('selected');
        }

        this.emit(this.selected ? 'select' : 'deselect');
        this.emit('change', this.selected);

        if (this.parent)
            this.parent.emit(this.selected ? 'select' : 'deselect', this, this._clicked);
    }


    public constructor(args?: GridItemArgs) {
        super();
        args = args || {};

        this._text = args.text || '';
        this._selectPending = false;
        this._selected = args.selected || false;
        this._toggleSelectOnClick = args && args.toggleSelectOnClick !== undefined ? args.toggleSelectOnClick : true;
        this._clicked = false;

        this.element = document.createElement('li');
        this.element.ui = this;
        this.element.tabIndex = 0;
        this.element.classList.add('ui-grid-item');
        this.element.innerHTML = this._text;

        // this.element.removeEventListener('click', this._evtClick);
        this.element.addEventListener('click', this._onClick.bind(this), false);

        this.on('select', this._onSelect);
        this.on('deselect', this._onDeselect);

    }


    private _onClick() {
        this.emit('click');
        this._clicked = true;
        if (this._toggleSelectOnClick) {
            this.selected = !this.selected;
        } else {
            this.selected = true;
        }
        this._clicked = false;
    };

    private _onSelect() {
        this.element!.focus();
    };

    private _onDeselect() {
        this.element!.blur();
    };

}


export class GridItemArgs {
    text?: string;
    selected?: boolean;
    toggleSelectOnClick?: boolean;
}