import { TopElement } from "./top-element";
import { Element } from "../element";

export class TopElementContainer extends TopElement {


    public RESIZE_HANDLE_SIZE = 4;

    public VALID_RESIZABLE_VALUES = [
        null,
        'top',
        'right',
        'bottom',
        'left'
    ];

    private _flex: boolean = false;
    private _grid: boolean = false;
    private _scrollable: boolean = false;
    private _resizable: Nullable<string> = null;
    private _resizeMin: number = 0;
    private _resizeMax: number = 0;

    private _domContent: Nullable<HTMLElement> = null;

    private _domEventScroll: any;
    private _domResizeHandle: any;
    private _resizeHorizontally: boolean;

    private _domEventResizeStart: any;
    private _domEventResizeMove: any;
    private _domEventResizeEnd: any;
    private _domEventResizeTouchStart: any;
    private _domEventResizeTouchMove: any;
    private _domEventResizeTouchEnd: any;
    private _resizeTouchId: any;
    private _resizeData: any;


    public get flex(): boolean {
        return this._flex;
    }
    public set flex(value: boolean) {
        if (value === this._flex) return;

        this._flex = value;

        if (value) {
            this.class!.add('pcui-flex');
        } else {
            this.class!.remove('pcui-flex');
        }
    }

    public get grid(): boolean {
        return this._grid;
    }
    public set grid(value: boolean) {
        if (value === this._grid) return;

        this._grid = value;

        if (value) {
            this.class!.add('pcui-grid');
        } else {
            this.class!.remove('pcui-grid');
        }
    }

    public get scrollable(): boolean {
        return this._scrollable;
    }
    public set scrollable(value: boolean) {
        if (value === this._scrollable) return;

        this._scrollable = value;

        if (value) {
            this.class!.add('pcui-scrollable');
        } else {
            this.class!.remove('pcui-scrollable');
        }
    }

    public get resizable(): Nullable<string> {
        return this._resizable;
    }
    public set resizable(value: Nullable<string>) {
        if (value === this._resizable) return;

        if (this.VALID_RESIZABLE_VALUES.indexOf(value) === -1) {
            console.error('Invalid resizable value: must be one of ' + this.VALID_RESIZABLE_VALUES.join(','));
            return;
        }

        // remove old class
        if (this._resizable) {
            this.class!.remove('pcui-resizable-' + this._resizable);
        }

        this._resizable = value;
        this._resizeHorizontally = (value === 'right' || value === 'left');

        if (value) {
            // add resize class and create / append resize handle
            this.class!.add('pcui-resizable');
            this.class!.add('pcui-resizable-' + value);

            if (!this._domResizeHandle) {
                this._createResizeHandle();
            }
            this.dom!.appendChild(this._domResizeHandle);
        } else {
            // remove resize class and resize handle
            this.class!.remove('pcui-resizable');
            if (this._domResizeHandle) {
                this.dom!.removeChild(this._domResizeHandle);
            }
        }
    }

    public get resizeMin(): number {
        return this._resizeMin;
    }
    public set resizeMin(value: number) {
        this._resizeMin = Math.max(0, Math.min(value, this._resizeMax));
    }

    public get resizeMax(): number {
        return this._resizeMax;
    }
    public set resizeMax(value: number) {
        this._resizeMax = Math.max(this._resizeMin, value);
    }

    public get domContent(): Nullable<HTMLElement> {
        return this._domContent;
    }
    public set domContent(value: Nullable<HTMLElement>) {
        if (this._domContent === value) return;

        if (this._domContent) {
            this._domContent.removeEventListener('scroll', this._domEventScroll);
        }

        this._domContent = value;

        if (this._domContent) {
            this._domContent.addEventListener('scroll', this._domEventScroll);
        }
    }

    public get innerElement(): Nullable<HTMLElement> {
        return this.domContent;
    }
    public set innerElement(value: Nullable<HTMLElement>) {
        this.domContent = value;
    }


    public constructor(args: any) {
        super(document.createElement('div'), args);

        if (!args) args = {}

        var dom = this.dom!;
        dom.classList.add('pcui-container');

        this._domEventScroll = this._onScroll.bind(this);
        this.domContent = dom;

        // pcui.Element.call(this, dom, args);
        // pcui.IContainer.call(this);
        // pcui.IFlex.call(this);
        // pcui.IGrid.call(this);
        // pcui.IScrollable.call(this);
        // pcui.IResizable.call(this);

        // scroll
        this.scrollable = args.scrollable !== undefined ? args.scrollable : false;

        // flex
        this.flex = !!args.flex;

        // grid
        var grid = !!args.grid;
        if (grid) {
            if (this.flex) {
                console.error('Invalid pcui.Container arguments: "grid" and "flex" cannot both be true.');
                grid = false;
            }
        }
        this.grid = grid;

        // resize related
        this._domResizeHandle = null;
        this._domEventResizeStart = this._onResizeStart.bind(this);
        this._domEventResizeMove = this._onResizeMove.bind(this);
        this._domEventResizeEnd = this._onResizeEnd.bind(this);
        this._domEventResizeTouchStart = this._onResizeTouchStart.bind(this);
        this._domEventResizeTouchMove = this._onResizeTouchMove.bind(this);
        this._domEventResizeTouchEnd = this._onResizeTouchEnd.bind(this);
        this._resizeTouchId = null;
        this._resizeData = null;
        this._resizeHorizontally = true;

        this.resizable = args.resizable || null;
        this._resizeMin = 100;
        this._resizeMax = 300;

        if (args.resizeMin !== undefined) {
            this.resizeMin = args.resizeMin;
        }
        if (args.resizeMax !== undefined) {
            this.resizeMax = args.resizeMax;
        }

    }

    public append(element: HTMLElement | TopElement | Element) {
        var dom = this._getDomFromElement(element);
        this._domContent!.appendChild(dom);
        this._onAppendChild(element);
    };

    public appendBefore(element: HTMLElement | TopElement | Element, referenceElement: HTMLElement | TopElement | Element) {
        var dom = this._getDomFromElement(element);
        this._domContent!.appendChild(dom);
        var referenceDom = referenceElement && this._getDomFromElement(referenceElement);

        if ((referenceDom)) {
            this._domContent!.insertBefore(dom, referenceDom);
        } else {
            this._domContent!.appendChild(dom);
        }

        this._onAppendChild(element);
    };

    public appendAfter(element: HTMLElement | TopElement | Element, referenceElement: HTMLElement | TopElement | Element) {
        var dom = this._getDomFromElement(element);
        var referenceDom = referenceElement && this._getDomFromElement(referenceElement);

        var elementBefore = referenceDom ? referenceDom.nextSibling : null;
        if (elementBefore) {
            this._domContent!.insertBefore(dom, elementBefore);
        } else {
            this._domContent!.appendChild(dom);
        }

        this._onAppendChild(element);
    };

    public prepend(element: HTMLElement | TopElement | Element) {
        var dom = this._getDomFromElement(element);
        var first = this._domContent!.firstChild;
        if (first) {
            this._domContent!.insertBefore(dom, first);
        } else {
            this._domContent!.appendChild(dom);
        }

        this._onAppendChild(element);
    };

    public remove(element: HTMLElement | TopElement | Element) {
        let html: boolean = (element instanceof HTMLElement);
        if (!html && (<TopElement>element).parent !== this) return;
        var dom = this._getDomFromElement(element);
        this._domContent!.removeChild(dom);
        if (!html)
            (<TopElement>element).parent = null;
        this.emit('remove', element);
    };

    public clear() {
        if (this._domContent) {
            var i = this._domContent.childNodes.length;
            while (i--) {
                var node = this._domContent.childNodes[i];
                if ((<HTMLElement>node).ui) {
                    (<HTMLElement>node).ui.destroy();
                }
            }

            this._domContent.innerHTML = '';
        }
    };

    private _getDomFromElement(element: HTMLElement | TopElement | Element) {
        if (element instanceof HTMLElement)
            return element;
        else if (element instanceof TopElement)
            return (<TopElement>element).dom!;
        else
            return (<Element>element).element!;
        // if (element.dom) {
        //     return element.dom;
        // }
        // if (element.element) {
        //     // console.log('Legacy ui.Element passed to pcui.Container', this.class, element.class);
        //     return element.element;
        // }
        // return element;
    };

    private _onAppendChild(element: HTMLElement | TopElement | Element) {
        if (element instanceof TopElement)
            (<TopElement>element).parent = this;
        else if (element instanceof Element)
            (<Element>element).parent = this;
        this.emit('append', element);
    };

    private _onScroll(evt: MouseEvent) {
        this.emit('scroll', evt);
    };

    private _createResizeHandle() {
        var handle = document.createElement('div');
        handle.classList.add('pcui-resizable-handle');
        handle.ui = this;

        handle.addEventListener('mousedown', this._domEventResizeStart);
        handle.addEventListener('touchstart', this._domEventResizeTouchStart);

        this._domResizeHandle = handle;
    };

    private _onResizeStart(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        window.addEventListener('mousemove', this._domEventResizeMove);
        window.addEventListener('mouseup', this._domEventResizeEnd);

        this._resizeStart();
    };

    private _onResizeMove(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        this._resizeMove(evt.clientX, evt.clientY);
    };

    private _onResizeEnd(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        window.removeEventListener('mousemove', this._domEventResizeMove);
        window.removeEventListener('mouseup', this._domEventResizeEnd);

        this._resizeEnd();
    };

    private _onResizeTouchStart(evt: TouchEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.target === this._domResizeHandle) {
                this._resizeTouchId = touch.identifier;
            }
        }

        window.addEventListener('touchmove', this._domEventResizeTouchMove);
        window.addEventListener('touchend', this._domEventResizeTouchEnd);

        this._resizeStart();
    };

    private _onResizeTouchMove(evt: TouchEvent) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier !== this._resizeTouchId) {
                continue;
            }

            evt.stopPropagation();
            evt.preventDefault();

            this._resizeMove(touch.clientX, touch.clientY);

            break;
        }
    };

    private _onResizeTouchEnd(evt: TouchEvent) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier === this._resizeTouchId) {
                continue;
            }

            this._resizeTouchId = null;

            evt.preventDefault();
            evt.stopPropagation();

            window.removeEventListener('touchmove', this._domEventResizeTouchMove);
            window.removeEventListener('touchend', this._domEventResizeTouchEnd);

            this._resizeEnd();

            break;
        }
    };

    private _resizeStart() {
        this.class!.add('pcui-resizable-resizing');
    };

    private _resizeMove(x: number, y: number) {
        // if we haven't initialized resizeData do so now
        if (!this._resizeData) {
            this._resizeData = {
                x: x,
                y: y,
                width: this.dom!.clientWidth,
                height: this.dom!.clientHeight
            };

            return;
        }

        if (this._resizeHorizontally) {
            // horizontal resizing
            var offsetX = this._resizeData.x - x;

            if (this._resizable === 'right') {
                offsetX = -offsetX;
            }

            this.width = this.RESIZE_HANDLE_SIZE + Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.width + offsetX)));
        } else {
            // vertical resizing
            var offsetY = this._resizeData.y - y;

            if (this._resizable === 'bottom') {
                offsetY = -offsetY;
            }

            this.height = Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.height + offsetY)));
        }

        this.emit('resize');
    };

    private _resizeEnd() {
        this._resizeData = null;
        this.class!.remove('pcui-resizable-resizing');
    };

    public destroy() {
        this.domContent = null;

        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('mousedown', this._domEventResizeStart);
            window.removeEventListener('mousemove', this._domEventResizeMove);
            window.removeEventListener('mouseup', this._domEventResizeEnd);

            this._domResizeHandle.removeEventListener('touchstart', this._domEventResizeTouchStart);
            window.removeEventListener('touchmove', this._domEventResizeTouchMove);
            window.removeEventListener('touchend', this._domEventResizeTouchEnd);
        }

        this._domResizeHandle = null;
        this._domEventResizeStart = null;
        this._domEventResizeMove = null;
        this._domEventResizeEnd = null;
        this._domEventResizeTouchStart = null;
        this._domEventResizeTouchMove = null;
        this._domEventResizeTouchEnd = null;

        super.destroy.call(this);
    };



}