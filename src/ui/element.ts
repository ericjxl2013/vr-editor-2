import { Events, EventHandle } from '../lib';
import { Link } from './link';
import { TopElement } from './top';

export class Element extends Events {

    private _parent: Nullable<Element> | Nullable<TopElement> = null;
    private _destroyed: boolean = false;

    // TODO
    public _link: Nullable<Link> = null;
    /*
      on get set .schema.has .schema.get .history .history.combine .entity
    */
    private _linkOnSet: Nullable<EventHandle> = null;
    private _linkOnUnset: Nullable<EventHandle> = null;
    public path: string = '';

    public renderChanges = false;
    // TODO
    // // render changes only from next ticks
    // setTimeout(function() {
    //   if (self.renderChanges === null) self.renderChanges = true;
    // }, 0);

    public disabledClick = false;
    private _disabled = false;
    private _disabledParent = false;

    private _evtParentDestroy: Nullable<EventHandle> = null;
    private _evtParentDisable: Nullable<EventHandle> = null;
    private _evtParentEnable: Nullable<EventHandle> = null;

    // public get selected(): boolean {
    //   return this.class!.contains('selected');
    // }

    // HTMLElement 
    private _element: Nullable<HTMLElement> = null;
    // public innerElement: Nullable<HTMLElement> = null;
    public get element(): Nullable<HTMLElement> {
        return this._element;
    }
    public set element(val: Nullable<HTMLElement>) {
        if (this._element) return;

        this._element = val;
        this._element!.ui = this;

        if (!this._element) return;

        let self = this;
        // click 事件
        this._element.addEventListener('click', (evt) => {
            if (self.disabled && !self.disabledClick) return;
            self.emit('click', evt);
        }, false);
        // hover 事件
        this._element.addEventListener('mouseover', (evt) => {
            self.emit('hover', evt);
        }, false);
        // blur 事件，mouse out
        this._element.addEventListener('mouseout', (evt) => {
            self.emit('blur', evt);
        }, false);

        // if (!this.innerElement) this.innerElement = this._element;
    }

    public get parent(): Nullable<Element> | Nullable<TopElement> {
        return this._parent;
    }
    public set parent(val: Nullable<Element> | Nullable<TopElement>) {
        if (this._parent) {
            this._parent = null;
            this._evtParentDestroy!.unbind();
            this._evtParentDisable!.unbind();
            this._evtParentEnable!.unbind();
        }
        // let self = this;

        if (val) {
            this._parent = val;
            this._evtParentDestroy = this._parent.once(
                'destroy',
                this._parentDestroy.bind(this)
            );
            this._evtParentDisable = this._parent.on('disable', this._parentDisable.bind(this));
            this._evtParentEnable = this._parent.on('enable', this._parentEnable.bind(this));

            if (this._disabledParent !== this._parent.disabled) {
                this._disabledParent = this._parent.disabled;

                if (this._disabledParent) {
                    this.class!.add('disabled');
                    this.emit('disable');
                } else {
                    this.class!.remove('disabled');
                    this.emit('enable');
                }

            }
        }

        this.emit('parent');
    }

    public get disabled(): boolean {
        return this._disabled || this._disabledParent;
    }
    public set disabled(val: boolean) {
        if (this._disabled === val) return;

        this._disabled = !!val;
        
        this.emit(this._disabled || this._disabledParent ? 'disable' : 'enable');

        if (this._disabled || this._disabledParent) {
            if (this.class) this.class.add('disabled');
        } else {
            if (this.class) this.class.remove('disabled');
        }
    }

    public get disabledSelf(): boolean {
        return this._disabled;
    }

    public get enabled(): boolean {
        return !this._disabled;
    }
    public set enabled(val: boolean) {
        this.disabled = !val;
    }

    public get hidden(): boolean {
        return this._element ? this._element.classList.contains('hidden') : false;
    }
    public set hidden(val: boolean) {
        if (!this._element) return;

        if (this._element.classList.contains('hidden') === !!val) return;

        if (val) {
            this._element.classList.add('hidden');
            this.emit('hide');
        } else {
            this._element.classList.remove('hidden');
            this.emit('show');

        }
    }

    // TODO
    public get value(): any {
        if (!this._link) return null;
        return this._link.get(this.path);
    }
    public set value(val: any) {
        if (!this._link) return;
        this._link.set(this.path, val);
    }

    /* DOM Element */

    public get class(): Nullable<DOMTokenList> {
        if (this._element) {
            return this._element.classList;
        }
        return null;
    }

    public get style(): Nullable<CSSStyleDeclaration> {
        if (this._element) {
            return this._element.style;
        }
        return null;
    }

    // flex-grow 属性用于设置或检索弹性盒子的扩展比率，用作css动画效果
    public get flexGrow(): string {
        return this._element ? (this._element.style.flexGrow || '') : '';
    }
    public set flexGrow(val: string) {
        if (this._element) {
            this._element.style.flexGrow = val;
            this._element.style.webkitFlexGrow = val;
        }
    }

    // flex-shrink 属性规定项目将相对于同一容器内其他灵活的项目进行收缩的量，用作css动画效果
    public get flexShrink(): string {
        return this._element ? (this._element.style.flexShrink || '') : '';
    }
    public set flexShrink(val: string) {
        if (this._element) {
            this._element.style.flexShrink = val;
            this._element.style.webkitFlexShrink = val!;
        }
    }


    public constructor() {
        super();
        // this._element!.addEventListener('click', )

        this._parent = null;
        // let self = this;
        // this._parentDestroy = function () {
        //   self.destroy();
        // };
    }

    // 设置元素闪烁效果
    public flash(): void {
        if (this.class) {
            this.class.add('flash');
            setTimeout(this._onFlashDelay, 200);
        }
    }


    private _onFlashDelay(): void {
        if (this.class) {
            this.class.remove('flash');
        }
    }

    public link(link: Link, path: string): void {
        let self = this;

        if (this._link) this.unlink();
        this._link = link;
        this.path = path;

        this.emit('link', path);

        // add :set link
        if (this._onLinkChange) {
            let renderChanges = this.renderChanges;
            this.renderChanges = false;
            this._linkOnSet = this._link.on(this.path + ':set', function (value: any) {
                self._onLinkChange(value);
            });
            this._linkOnUnset = this._link.on(this.path + ':unset', function (value: any) {
                self._onLinkChange(value);
            });
            this._onLinkChange(this._link.get(this.path));
            this.renderChanges = renderChanges;
        }
    };


    public unlink(): void {
        if (!this._link) return;

        this.emit('unlink', this.path);

        // remove :set link
        if (this._linkOnSet) {
            this._linkOnSet.unbind();
            this._linkOnSet = null;

            this._linkOnUnset!.unbind();
            this._linkOnUnset = null;
        }

        this._link = null;
        this.path = '';
    };

    public _onLinkChange(value: any): void {

    }


    public destroy(): void {
        if (this._destroyed) return;

        this._destroyed = true;

        if (this._parent) {
            this._evtParentDestroy!.unbind();
            this._evtParentDisable!.unbind();
            this._evtParentEnable!.unbind();
            this._parent = null;
        }

        if (this._element && this._element.parentNode) {
            this._element.parentNode.removeChild(this._element);
        }

        this.unlink();

        this.emit('destroy');

        this.unbind();

        // console.error('destroy');
    };

    private _parentDestroy(): void {
        this.destroy();
    };

    private _parentDisable(): void {
        if (this._disabledParent) return;

        this._disabledParent = true;

        if (!this._disabled) {
            this.emit('disable');
            this.class!.add('disabled');
        }
    };

    private _parentEnable(): void {
        if (!this._disabledParent) return;

        this._disabledParent = false;

        if (!this._disabled) {
            this.emit('enable');
            this.class!.remove('disabled');
        }
    };


}