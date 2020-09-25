import { Element } from "./element";

export class Checkbox extends Element {


    private _text: string;

    public get value(): boolean {
        if (this._link) {
            return this._link.get(this.path);
        } else {
            return this.element!.classList.contains('checked');
        }
    }
    public set value(val: boolean) {
        if (this._link) {
            this._link.set(this.path, val);
        } else {
            if (this.element!.classList.contains('checked') !== val)
                this._onLinkChange(val);
        }
    }

    public constructor(text?: string) {
        super();

        this._text = text || '';

        this.element = document.createElement('div');
        this.element.classList.add('ui-checkbox', 'noSelect');
        this.element.tabIndex = 0;

        this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);

        this.on('click', this._onClick);
        this.on('change', this._onChange);

    }

    private _onClick(): void {
        // console.log('checkbox click');
        this.value = !this.value;
        this.element!.blur();
    }

    private _onChange(): void {
        // console.log('checkbox _onChange');
        if (!this.renderChanges)
            return;

        this.flash();
    }

    private _onKeyDown(evt: KeyboardEvent): void {
        // console.log('checkbox _onKeyDown');
        if (evt.keyCode === 27)  // Escape
            return (<HTMLElement>evt.target).blur();

        // Space
        if (evt.keyCode !== 32 || this.disabled)
            return;

        evt.stopPropagation();
        evt.preventDefault();
        this.value = !this.value;
    }

    // TODO
    public _onLinkChange(value: boolean) {
        // console.log('checkbox _onLinkChange');
        if (value === null) {
            this.element!.classList.remove('checked');
            this.element!.classList.add('null');
        } else if (value) {
            this.element!.classList.add('checked');
            this.element!.classList.remove('null');
        } else {
            this.element!.classList.remove('checked', 'null');
        }
        this.emit('change', value);
    }


}