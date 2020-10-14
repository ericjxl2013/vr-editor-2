import { Events } from "../../lib";

export class TopElement extends Events {

    public SIMPLE_CSS_PROPERTIES: {[key: string]: string} = {
        'flexDirection': 'flex-direction',
        'flexGrow': 'flex-grow',
        'flexBasis': 'flex-basis',
        'flexShrink': 'flex-shrink',
        'flexWrap': 'flex-wrap',
        'alignItems': 'align-items',
        'justifyContent': 'justify-content'
    };

    private _destroyed = false;
    private _enabled = true;
    private _hidden = false;
    private _parent: Nullable<TopElement> = null;

    private _domEventClick: any;
    private _domEventMouseOver: any;
    private _domEventMouseOut: any;

    private _evtParentDestroy: Nullable<EventHandle> = null;
    private _evtParentDisable: Nullable<EventHandle> = null;
    private _evtParentEnable: Nullable<EventHandle> = null;

    private _dom: Nullable<HTMLElement>;
    // private domContent: Nullable<HTMLElement> = null;


    public get enabled(): boolean {
        return this._enabled && (!this._parent || this._parent.enabled);
    }
    public set enabled(value: boolean) {
        if (this._enabled === value) return;

        // remember if enabled in hierarchy
        let enabled = this.enabled;

        this._enabled = value;

        // only fire event if hierarchy state changed
        if (enabled !== value) {
            this._onEnabledChange(value);
        }
    }

    public get dom(): Nullable<HTMLElement> {
        return this._dom;
    }
    public set dom(value: Nullable<HTMLElement>) {
        this._dom = value;
    }

    public get parent(): Nullable<TopElement> {
        return this._parent;
    }
    public set parent(value: Nullable<TopElement>) {
        if (value === this._parent) return;

        var oldEnabled = this.enabled;

        if (this._parent) {
            this._evtParentDestroy!.unbind();
            this._evtParentDisable!.unbind();
            this._evtParentEnable!.unbind();
        }

        this._parent = value;

        if (this._parent) {
            this._evtParentDestroy = this._parent.once('destroy', this._onParentDestroy.bind(this));
            this._evtParentDisable = this._parent.on('disable', this._onParentDisable.bind(this));
            this._evtParentEnable = this._parent.on('enable', this._onParentEnable.bind(this));
        }

        this.emit('parent', this._parent);

        var newEnabled = this.enabled;
        if (newEnabled !== oldEnabled) {
            this._onEnabledChange(newEnabled);
        }
    }

    public get hidden(): boolean {
        return this._hidden;
    }
    public set hidden(value: boolean) {
        if (value === this._hidden) return;

        this._hidden = value;

        if (value) {
            this.class!.add('pcui-hidden');
        } else {
            this.class!.remove('pcui-hidden');
        }

        this.emit(value ? 'hide' : 'show');
    }

    public get style(): CSSStyleDeclaration {
        return this._dom!.style;
    }

    public get class(): Nullable<DOMTokenList> {
        return this._dom!.classList;
    }

    public get width(): number | string {
        return this._dom!.clientWidth;
    }
    public set width(value: number | string) {
        if (typeof value === 'number') {
            value = value.toString() + 'px';
        }
        this.style.width = value;
    }

    public get height(): number | string {
        return this._dom!.clientHeight;
    }
    public set height(value: number | string) {
        if (typeof value === 'number') {
            value = value.toString() + 'px';
        }
        this.style.height = value;
    }

    public get disabled(): boolean {
        return !this.enabled;
    }
    public set disabled(value: boolean) {
        this.enabled = !value;
    }


    public get element(): Nullable<HTMLElement> {
        return this.dom;
    }
    public set element(value: Nullable<HTMLElement>) {
        this.dom = value;
    }

    // public get innerElement(): Nullable<HTMLElement> {
    //     return this.domContent;
    // }
    // public set innerElement(value: Nullable<HTMLElement>) {
    //     this.domContent = value;
    // }



    public constructor(dom: HTMLElement, args: any) {
        super();

        if (!args) args = {};

        this._destroyed = false;
        this._enabled = true;
        this._hidden = false;
        this._parent = null;

        this._domEventClick = this._onClick.bind(this);
        this._domEventMouseOver = this._onMouseOver.bind(this);
        this._domEventMouseOut = this._onMouseOut.bind(this);

        this._evtParentDestroy = null;
        this._evtParentDisable = null;
        this._evtParentEnable = null;

        this._dom = dom;

        if (args.id !== undefined) {
            this._dom.id = args.id;
        }

        // add ui reference
        this._dom.ui = this;

        // add event listeners
        this._dom.addEventListener('click', this._domEventClick);
        this._dom.addEventListener('mouseover', this._domEventMouseOver);
        this._dom.addEventListener('mouseout', this._domEventMouseOut);

        // add element class
        this._dom.classList.add('pcui-element');

        if (args.enabled !== undefined) {
            this.enabled = args.enabled;
        }
        if (args.hidden !== undefined) {
            this.hidden = args.hidden;
        }
        if (args.width !== undefined) {
            this.width = args.width;
        }
        if (args.height !== undefined) {
            this.height = args.height;
        }

        // copy CSS properties from args
        for (var key in args) {
            if (args[key] === undefined) continue;
            if (this.SIMPLE_CSS_PROPERTIES[key] !== null) {
                this.style.setProperty(this.SIMPLE_CSS_PROPERTIES[key], args[key]);
            }
        }

    }

    public exposeCssProperty(name: string) {
        Object.defineProperty(TopElement.prototype, name, {
            get: function () {
                return this.style[name];
            },
            set: function (value) {
                this.style[name] = value;
            }
        });
    }


    public link(observer: any, path: any) {
        throw new Error('Not implemented');
    };

    public unlink() {
        throw new Error('Not implemented');
    };

    public flash() {
        let self = this;
        this.class!.add('flash');
        setTimeout(function () {
            self.class!.remove('flash');
        }.bind(self), 200);
    };

    private _onClick(evt: MouseEvent) {
        if (this.enabled) {
            this.emit('click', evt);
        }
    };

    private _onMouseOver(evt: MouseEvent) {
        this.emit('hover', evt);
    };

    private _onMouseOut(evt: MouseEvent) {
        this.emit('hoverend', evt);
    };

    private _onEnabledChange(enabled: boolean) {
        if (enabled) {
            this.class!.remove('pcui-disabled');
        } else {
            this.class!.add('pcui-disabled');
        }

        this.emit(enabled ? 'enable' : 'disable');
    };

    private _onParentDestroy() {
        this.destroy();
    };

    private _onParentDisable() {
        if (this._enabled) {
            this._onEnabledChange(false);
        }
    };

    private _onParentEnable() {
        if (this._enabled) {
            this._onEnabledChange(true);
        }
    };

    public destroy() {
        if (this._destroyed) return;

        this._destroyed = true;

        if (this.parent && this.parent.element) {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.parent.element);
            }
        }

        if (this._dom) {
            // remove event listeners
            this._dom.removeEventListener('click', this._domEventClick);
            this._dom.removeEventListener('mouseover', this._domEventMouseOver);
            this._dom.removeEventListener('mouseout', this._domEventMouseOut);

            // remove ui reference
            if(this._dom.ui)
                this._dom.ui.destroy();

            this._dom = null;
        }

        this._domEventClick = null;
        this._domEventMouseOver = null;
        this._domEventMouseOut = null;
    };


}