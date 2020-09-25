import { Element } from "./element";
import { Observer } from "../lib";

export class ListItem extends Element {

    public entity?: Observer;

    private _text: string;
    public get text(): string {
        return this._text;
    }
    public set text(val: string) {
        if (this._text === val) return;
        this._text = val;
        this.elementText.textContent = this._text;
    }

    private _selected: boolean;
    public get selected(): boolean {
        return this._selected;
    }
    public set selected(val: boolean) {
        if (this._selected === val)
            return;

        this._selected = val;

        if (this._selected) {
            this.element!.classList.add('selected');
        } else {
            this.element!.classList.remove('selected');
        }

        this.emit(this.selected ? 'select' : 'deselect');

        if (this.parent)
            this.parent.emit(this.selected ? 'select' : 'deselect', this);

        this.emit('change', this.selected);
    }

    private _allowDeselect: boolean;

    public elementText: HTMLElement;

    public constructor(text?: string, selected?: boolean, allowDeselect?: boolean) {
        super();

        this._text = text || '';
        this._selected = selected || false;
        this._allowDeselect = allowDeselect || false;

        this.element = document.createElement('li');
        this.element.classList.add('ui-list-item');
        this.element.ui = this;

        this.elementText = document.createElement('span');
        this.elementText.textContent = this._text;
        this.element.appendChild(this.elementText);

        this.on('click', this._onClick);
    }


    private _onClick(): void {
        if (!this.selected) {
            this.selected = true;
        } else if (this._allowDeselect) {
            this.selected = false;
        }
    }



}