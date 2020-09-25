import { Element } from './element';

export class ContainerElement extends Element {


    private _innerElement: Nullable<HTMLElement> = null;
    public get innerElement(): Nullable<HTMLElement> {
        return this._innerElement;
    }
    public set innerElement(val: Nullable<HTMLElement>) {
        if (this._innerElement) {
            this._observer.disconnect();
        }

        this._innerElement = val;

        this._observer.observe(this._innerElement!, this._observerOptions);
    }

    private _observerChanged: boolean = false;

    private _observer: MutationObserver;

    private _observerOptions: {} = {
        childList: true,
        attributes: true,
        characterData: false,
        subtree: true,
        attributeOldValue: false,
        characterDataOldValue: false
    };


    public get flexible(): boolean {
        return this.element ? this.element.classList.contains('flexible') : false;
    }
    public set flexible(val: boolean) {
        if (!this.element || this.element.classList.contains('flexible') === val)
            return;

        if (val) {
            this.element.classList.add('flexible');
        } else {
            this.element.classList.remove('flexible');
        }
    }

    public get flex(): boolean {
        return this.element ? this.element.classList.contains('flex') : false;
    }
    public set flex(val: boolean) {
        if (!this.element || this.element.classList.contains('flex') === val)
            return;

        if (val) {
            this.element.classList.add('flex');
        } else {
            this.element.classList.remove('flex');
        }
    }

    public get flexDirection(): string {
        return this._innerElement ? (this._innerElement!.style.flexDirection || '') : '';
    }
    public set flexDirection(val: string) {
        if (this._innerElement) {
            this._innerElement.style.flexDirection = val;
            this._innerElement.style.webkitFlexDirection = val!;
        }
    }

    public get flexWrap(): string {
        return this._innerElement ? (this._innerElement!.style.flexWrap || '') : '';
    }
    public set flexWrap(val: string) {
        if (this._innerElement) {
            this._innerElement.style.flexWrap = val;
            this._innerElement.style.webkitFlexWrap = val!;
        }
    }

    public get flexGrow(): string {
        return this.element ? (this.element.style.flexGrow || '') : '';
    }
    public set flexGrow(val: string) {
        if (!!val) this.flex = true;

        if (this.element) {
            this.element.style.flexGrow = val;
            this.element.style.webkitFlexGrow = val!;
        }

        if (this._innerElement) {
            this._innerElement.style.flexGrow = val;
            this._innerElement.style.webkitFlexGrow = val!;
        }
    }

    public get flexShrink(): string {
        return this.element ? (this.element.style.flexShrink || '') : '';
    }
    public set flexShrink(val: string) {
        if (!!val) this.flex = true;

        if (this.element) {
            this.element.style.flexShrink = val;
            this.element.style.webkitFlexShrink = val!;
        }

        if (this._innerElement) {
            this._innerElement.style.flexShrink = val;
            this._innerElement.style.webkitFlexShrink = val!;
        }
    }

    public get scroll(): boolean {
        return this.class ? this.class.contains('scrollable') : false;
    }
    public set scroll(val: boolean) {
        if (this.class) this.class.add('scrollable');
    }


    public constructor() {
        super();

        let self = this;

        let observerTimeout = function () {
            self._observerChanged = false;
            self.emit('nodesChanged');
            // console.warn('nodesChanged');
        };

        this._observer = new MutationObserver(function () {
            if (self._observerChanged)
                return;
            self._observerChanged = true;
            setTimeout(observerTimeout, 0);
        });

    }

    public append(element: HTMLElement | Element): void {
        let html: boolean = element instanceof HTMLElement;
        let node: HTMLElement = html ? <HTMLElement>element : (<Element>element).element!;
        this._innerElement!.appendChild(node);

        if (!html) {
            (<Element>element).parent = this;
            this.emit('append', element);
        }
    }


    public appendBefore(element: HTMLElement | Element, reference: HTMLElement | Element | null): void {
        let html: boolean = (element instanceof HTMLElement);
        let node: HTMLElement = html ? <HTMLElement>element : (<Element>element).element!;

        if (reference instanceof Element) reference = reference.element;

        this._innerElement!.insertBefore(node, reference);

        if (!html) {
            (<Element>element).parent = this;
            this.emit('append', element);
        }
    };

    public appendAfter(element: HTMLElement | Element, reference: HTMLElement | Element | null): void {
        let html: boolean = (element instanceof HTMLElement);
        let node: HTMLElement = html ? <HTMLElement>element : (<Element>element).element!;

        if (reference instanceof Element) reference = reference.element;

        if (reference) {
            this._innerElement!.insertBefore(node, reference.nextSibling);
        } else {
            this._innerElement!.appendChild(node);
        }

        if (!html) {
            (<Element>element).parent = this;
            this.emit('append', element);
        }
    };


    public prepend(element: HTMLElement | Element): void {
        let first = this._innerElement!.firstChild;
        let html: boolean = (element instanceof HTMLElement);
        let node: HTMLElement = html ? <HTMLElement>element : (<Element>element).element!;

        if (first) {
            this._innerElement!.insertBefore(node, first);
        } else {
            this._innerElement!.appendChild(node);
        }

        if (!html) {
            (<Element>element).parent = this;
            this.emit('append', element);
        }
    };

    public remove(element: HTMLElement | Element): void {
        let html: boolean = (element instanceof HTMLElement);
        let node: HTMLElement = html ? <HTMLElement>element : (<Element>element).element!;

        if (!node.parentElement || node.parentElement !== this._innerElement)
            return;

        this._innerElement.removeChild(node);

        if (!html) {
            (<Element>element).parent = null;
            this.emit('remove', element);
        }
    };

    // TODO：怕不对
    public clear(): void {
        // console.log('clear');
        let node: HTMLElement;
        this._observer.disconnect();
        // console.log(this._innerElement);
        let i: number = this._innerElement!.children.length;
        while (i--) {
            node = <HTMLElement>(this._innerElement!.children[i]);

            if (!node.ui)
                continue;

            node.ui.destroy();
        }
        this._innerElement!.innerHTML = '';

        this._observer.observe(this._innerElement!, this._observerOptions);
    };


}