import { TopElementContainer } from "./top-element-container";

export class TopElementPanel extends TopElementContainer {

    private _suspendReflow: boolean;

    private _containerHeader: TopElementContainer;
    private _domHeaderTitle: HTMLElement;
    private _headerSize: number = 0

    private _containerContent: TopElementContainer;

    private _collapsible: boolean = false;
    private _collapsed: boolean = false;
    private _collapseHorizontally: boolean = false;

    private _reflowTimeout: Nullable<number> = null;
    private _widthBeforeCollapse: Nullable<number> = null;
    private _heightBeforeCollapse: Nullable<number> = null;

    private _evtAppend: Nullable<EventHandle>;
    private _evtRemove: Nullable<EventHandle>;


    public get collapsible(): boolean {
        return this._collapsible;
    }
    public set collapsible(value: boolean) {
        if (value === this._collapsible) return;

        this._collapsible = value;

        if (this._evtAppend) {
            this._evtAppend.unbind();
            this._evtAppend = null;
        }

        if (this._evtRemove) {
            this._evtRemove.unbind();
            this._evtRemove = null;
        }

        if (value) {
            // listen to append / remove events so we can change our height
            var onChange = this._onChildrenChange.bind(this);
            this._evtAppend = this._containerContent.on('append', onChange);
            this._evtRemove = this._containerContent.on('remove', onChange);

            this.class!.add('pcui-collapsible');
        } else {
            this.class!.remove('pcui-collapsible');
        }

        this._reflow();

        if (this.collapsed) {
            this.emit(value ? 'collapse' : 'expand');
        }
    }

    public get collapsed(): boolean {
        return this._collapsed;
    }
    public set collapsed(value: boolean) {
        if (this._collapsed === value) return;

        this._collapsed = value;

        if (value) {
            this.class!.add('pcui-collapsed');
        } else {
            this.class!.remove('pcui-collapsed');
        }

        this._reflow();

        if (this.collapsible) {
            this.emit(value ? 'collapse' : 'expand');
        }
    }

    public get collapseHorizontally(): boolean {
        return this._collapseHorizontally;
    }
    public set collapseHorizontally(value: boolean) {
        if (this._collapseHorizontally === value) return;

        this._collapseHorizontally = value;
        if (value) {
            this.class!.add('pcui-panel-horizontal');
        } else {
            this.class!.remove('pcui-panel-horizontal');
        }

        this._reflow();
    }

    public get content(): TopElementContainer {
        return this._containerContent;
    }

    public get header(): TopElementContainer {
        return this._containerHeader;
    }

    public get headerText(): string {
        return this._domHeaderTitle.textContent || '';
    }
    public set headerText(value: string) {
        this._domHeaderTitle.textContent = value;
    }

    public get headerSize(): number {
        return this._headerSize;
    }
    public set headerSize(value: number) {
        this._headerSize = value;
        let style = this._containerHeader.dom!.style;
        style.height = Math.max(0, value) + 'px';
        style.lineHeight = style.height;
        this._reflow();
    }



    public constructor(args: any) {
        super(args);

        if (!args) args = {};

        var panelArgs = Object.assign({}, args);
        panelArgs.flex = true;
        delete panelArgs.flexDirection;
        delete panelArgs.scrollable;

        this.class!.add('pcui-panel');

        if (args.panelType) {
            this.class!.add('pcui-panel-' + args.panelType);
        }

        // do not call reflow on every update while
        // we are initializing
        this._suspendReflow = true;

        // initialize header container
        // this._initializeHeader(args);
        // header container
        this._containerHeader = new TopElementContainer({
            flex: true,
            flexDirection: 'row'
        });
        this._containerHeader.class!.add('pcui-panel-header');

        // header title
        this._domHeaderTitle = document.createElement('span');
        this._domHeaderTitle.textContent = args.headerText || '';
        this._domHeaderTitle.classList.add('pcui-panel-header-title');
        this._domHeaderTitle.ui = this._containerHeader;
        this._containerHeader.dom!.appendChild(this._domHeaderTitle);

        // use native click listener because the pcui.Element#click event is only fired
        // if the element is enabled. However we still want to catch header click events in order
        // to collapse them
        this._containerHeader.dom!.addEventListener('click', this._onHeaderClick.bind(this));

        this.append(this._containerHeader);

        // initialize content container
        // this._initializeContent(args);
        this._containerContent = new TopElementContainer({
            flex: args.flex,
            flexDirection: args.flexDirection,
            scrollable: args.scrollable
        });
        this._containerContent.class!.add('pcui-panel-content');
        this._containerContent.style.height = '100%';

        this.appendAfter(this._containerContent, this._containerHeader);

        // event handlers
        this._evtAppend = null;
        this._evtRemove = null;

        // header size
        this.headerSize = args.headerSize !== undefined ? args.headerSize : 32;

        // collapse related
        this._reflowTimeout = null;
        this._widthBeforeCollapse = null;
        this._heightBeforeCollapse = null;

        // if we initialize the panel collapsed
        // then use the width / height passed in the arguments
        // as the size to expand to
        if (args.collapsed) {
            if (args.width) {
                this._widthBeforeCollapse = args.width;
            }
            if (args.height) {
                this._heightBeforeCollapse = args.height;
            }
        }

        this.collapsible = args.collapsible || false;
        this.collapsed = args.collapsed || false;
        this.collapseHorizontally = args.collapseHorizontally || false;

        // set the contents container to be the content DOM element
        // from now on calling append functions on the panel will append themn
        // elements to the contents container
        this.domContent = this._containerContent.dom;

        // execute reflow now after all fields have been initialized
        this._suspendReflow = false;
        this._reflow();

    }


    private _onHeaderClick(evt: MouseEvent) {
        if (!this._collapsible) return;
        if (evt.target !== this.header.dom && evt.target !== this._domHeaderTitle) return;
        // toggle collapsed
        this.collapsed = !this.collapsed;
    };

    private _onChildrenChange() {
        if (!this.collapsible || this.collapsed || this._collapseHorizontally || this.hidden) {
            return;
        }
        this.height = this.headerSize + this._containerContent.dom!.clientHeight;
    };

    // Collapses or expands the panel as needed
    private _reflow() {
        let self = this;

        if (this._suspendReflow) {
            return;
        }

        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }

        if (this.hidden || !this.collapsible) return;

        if (this.collapsed && this.collapseHorizontally) {
            this._containerHeader.style.top = -this.headerSize + 'px';
        } else {
            this._containerHeader.style.top = '';
        }

        // we rely on the content width / height and we have to
        // wait for 1 frame before we can get the final values back
        this._reflowTimeout = requestAnimationFrame(function () {
            self._reflowTimeout = null;

            if (self.collapsed) {
                // remember size before collapse
                if (!self._widthBeforeCollapse) {
                    self._widthBeforeCollapse = self.dom!.clientWidth;
                }
                if (!self._heightBeforeCollapse) {
                    self._heightBeforeCollapse = self.dom!.clientHeight;
                }

                if (self._collapseHorizontally) {
                    self.height = '';
                    self.width = self.headerSize;
                } else {
                    self.height = self.headerSize;
                }
            } else {
                if (self._collapseHorizontally) {
                    self.height = '';
                    if (self._widthBeforeCollapse !== null) {
                        self.width = self._widthBeforeCollapse;
                    }
                } else {
                    if (self._heightBeforeCollapse !== null) {
                        self.height = self._heightBeforeCollapse;
                    }
                }

                // reset before collapse vars
                self._widthBeforeCollapse = null;
                self._heightBeforeCollapse = null;
            }
        }.bind(self));
    };

    public destroy() {
        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }

        super.destroy.call(this);
    };





}