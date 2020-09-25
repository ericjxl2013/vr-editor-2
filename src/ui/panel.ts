import { ContainerElement } from './container-element';
import { Element } from './element';
import { Label } from './label';

export class Panel extends ContainerElement {

  public headerElement: Nullable<HTMLElement> = null;
  public headerElementTitle: Nullable<HTMLElement> = null;
  private _handleElement: Nullable<HTMLElement> = null;

  private _resizeEvtMove: any;
  private _resizeEvtEnd: any;
  private _resizeEvtTouchMove: any;
  private _resizeEvtTouchEnd: any;

  private _resizeData: { [key: string]: number } = { end: 0 };
  private _resizeLimits: { [key: string]: number } = {
    min: 0,
    max: Infinity
  };
  private _handle: string = '';
  public headerSize: number = 0;
  private _resizeTouchId: number = -100;

  public title: string = '';

  public _lable: Nullable<Label> = null;

  public get folded(): boolean {
    return this.class ? this.class.contains('foldable') && this.class.contains('folded') : false;
  }
  public set folded(val: boolean) {
    if (this.hidden)
      return;

    if (this.class!.contains('folded') === !!val)
      return;

    if (this.headerElement && this.headerSize === 0)
      this.headerSize = this.headerElement.clientHeight;

    if (val) {
      this.class!.add('folded');

      if (this.class!.contains('foldable'))
        this.emit('fold');
    } else {
      this.class!.remove('folded');

      if (this.class!.contains('foldable'))
        this.emit('unfold');
    }

    this._reflow();
  }

  public get horizontal(): boolean {
    return this.class ? this.class.contains('horizontal') : false;
  }
  public set horizontal(val: boolean) {
    if (val) {
      this.class!.add('horizontal');
    } else {
      this.class!.remove('horizontal');
    }
    this._reflow();
  }

  public get resizable(): string {
    return this._handle;
  }
  public set resizable(val: string) {
    if (this._handle === val)
      return;

    var oldHandle = this._handle;
    this._handle = val;

    if (this._handle !== '') {
      if (!this._handleElement) {
        this._handleElement = document.createElement('div');
        this._handleElement.ui = this;
        this._handleElement.classList.add('handle');
        this._handleElement.addEventListener('mousedown', this._resizeStart.bind(this), false);
        this._handleElement.addEventListener('touchstart', this._resizeStart.bind(this), false);
      }

      if (this._handleElement.parentNode)
        this.element!.removeChild(this._handleElement);
      // TODO
      // append in right place
      this.element!.appendChild(this._handleElement);
      this.class!.add('resizable', 'resizable-' + this._handle);
    } else {
      if (this._handleElement) this.element!.removeChild(this._handleElement);

      this.class!.remove('resizable', 'resizable-' + oldHandle);
    }

    this._reflow();
  }

  public get resizeMin(): number {
    return this._resizeLimits.min;
  }
  public set resizeMin(val: number) {
    this._resizeLimits.min = Math.max(0, Math.min(this._resizeLimits.max, val));
  }

  public get resizeMax(): number {
    return this._resizeLimits.max;
  }
  public set resizeMax(val: number) {
    this._resizeLimits.max = Math.max(this._resizeLimits.min, val);
  }

  public get foldable(): boolean {
    return this.class ? this.class.contains('foldable') : false;
  }
  public set foldable(val: boolean) {
    if (val) {
      this.class!.add('foldable');

      if (this.class!.contains('folded'))
        this.emit('fold');
    } else {
      this.class!.remove('foldable');

      if (this.class!.contains('folded'))
        this.emit('unfold');
    }

    this._reflow();
  }

  public get header(): string {
    return this.headerElementTitle ? (this.headerElementTitle.textContent || '') : '';
  }
  public set header(val: string) {
    if (!this.headerElement && val) {
      this.headerElement = document.createElement('header');
      this.headerElement.classList.add('ui-header');

      this.headerElementTitle = document.createElement('span');
      this.headerElementTitle.classList.add('title');
      this.headerElementTitle.textContent = val;
      this.headerElement.appendChild(this.headerElementTitle);

      let first = this.element!.firstChild;
      if (first) {
        this.element!.insertBefore(this.headerElement, first);
      } else {
        this.element!.appendChild(this.headerElement);
      }

      this.class!.remove('noHeader');

      let self = this;

      // folding
      this.headerElement.addEventListener('click', function (evt) {
        if (!self.foldable || (evt.target !== self.headerElement && evt.target !== self.headerElementTitle))
          return;

        self.folded = !self.folded;
      }, false);
    } else if (this.headerElement && !val) {
      if (this.headerElement.parentNode) {
        this.headerElement.parentNode.removeChild(this.headerElement);
      }
      this.headerElement = null;
      this.headerElementTitle = null;
      this.class!.add('noHeader');
    } else {
      this.headerElementTitle!.textContent = val || '';
      this.class!.remove('noHeader');
    }
  }

  public constructor(title?: string) {
    super();

    let self = this;
    this.element = document.createElement('div');
    this.element.classList.add('ui-panel', 'noHeader', 'noAnimation');

    // this.on('nodesChanged', this._onNodesChanged);

    // content
    this.innerElement = document.createElement('div');
    this.innerElement.ui = this;
    this.innerElement.classList.add('content');
    this.element.appendChild(this.innerElement);

    if (title) {
      this.title = title;
      this.header = title;
    }

    // this.innerElement.addEventListener('scroll', this._onScroll, false);

    this._resizeEvtMove = function (evt: MouseEvent) {
      evt.preventDefault();
      evt.stopPropagation();
      self._resizeMove(evt.clientX, evt.clientY);
    };

    this._resizeEvtEnd = function (evt: MouseEvent) {
      evt.preventDefault();
      evt.stopPropagation();
      self._resizeEnd();
    };

    this._resizeEvtTouchMove = function (evt: TouchEvent) {
      for (let i = 0; i < evt.changedTouches.length; i++) {
        let touch = evt.changedTouches[i];

        if (touch.identifier !== self._resizeTouchId)
          continue;

        evt.preventDefault();
        evt.stopPropagation();
        self._resizeMove(touch.clientX, touch.clientY);

        return;
      }
    };

    this._resizeEvtTouchEnd = function (evt: TouchEvent) {
      for (let i = 0; i < evt.changedTouches.length; i++) {
        let touch = evt.changedTouches[i];

        if (touch.identifier !== self._resizeTouchId)
          continue;

        self._resizeTouchId = -100;

        evt.preventDefault();
        evt.stopPropagation();
        self._resizeEnd();

        return;
      }
    };

    // HACK
    // skip 2 frames before enabling transitions
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        self.class!.remove('noAnimation');
      });
    });

    // on parent change
    this.on('parent', this._onParent);



  }




  private _resizeMove(x: number, y: number): void {
    if (this._resizeData.end === 0) {
      this._resizeData = {
        x: x,
        y: y,
        width: this.innerElement!.clientWidth,
        height: this.innerElement!.clientHeight,
        end: 1
      };
    } else {
      if (this._handle === 'left' || this._handle === 'right') {
        // horizontal
        let offsetX = this._resizeData.x - x;

        if (this._handle === 'right')
          offsetX = -offsetX;

        let width = Math.max(this._resizeLimits.min, Math.min(this._resizeLimits.max, (this._resizeData.width + offsetX)));

        this.style!.width = (width + 4) + 'px';
        this.innerElement!.style.width = (width + 4) + 'px';
      } else {
        // vertical
        let offsetY = this._resizeData.y - y;

        if (this._handle === 'bottom')
          offsetY = -offsetY;

        let height = Math.max(this._resizeLimits.min, Math.min(this._resizeLimits.max, (this._resizeData.height + offsetY)));

        this.style!.height = (height + (this.headerSize === -1 ? 0 : this.headerSize || 32)) + 'px';
        this.innerElement!.style.height = height + 'px';
      }
    }

    this.emit('resize');
  };

  private _resizeEnd(): void {
    window.removeEventListener('mousemove', this._resizeEvtMove, false);
    window.removeEventListener('mouseup', this._resizeEvtEnd, false);

    // window.removeEventListener('touchmove', this._resizeEvtTouchMove, false);
    // window.removeEventListener('touchend', this._resizeEvtTouchEnd, false);

    this.class!.remove('noAnimation', 'resizing');
    this._resizeData.end = 0;
  };

  private _resizeStart(evt: Event): void {
    if (this._handle === '')
      return;
    if ((<TouchEvent>evt).changedTouches) {
      for (let i = 0; i < (<TouchEvent>evt).changedTouches.length; i++) {
        let touch = (<TouchEvent>evt).changedTouches[i];
        if (<HTMLElement>touch.target !== this.element)
          continue;

        this._resizeTouchId = touch.identifier;
      }
    }

    this.class!.add('noAnimation', 'resizing');
    this._resizeData.end = 0;

    window.addEventListener('mousemove', this._resizeEvtMove, false);
    window.addEventListener('mouseup', this._resizeEvtEnd, false);

    window.addEventListener('touchmove', this._resizeEvtTouchMove, false);
    window.addEventListener('touchend', this._resizeEvtTouchEnd, false);

    evt.preventDefault();
    evt.stopPropagation();
  };

  private _onParent(): void {
    // HACK
    // wait till DOM parses, then reflow
    requestAnimationFrame(this._reflow.bind(this));
  };

  private _reflow(): void {
    if (this.hidden)
      return;

    if (this.folded) {
      if (this.horizontal) {
        this.style!.height = '';
        this.style!.width = (this.headerSize || 32) + 'px';
      } else {
        this.style!.height = (this.headerSize || 32) + 'px';
      }
    } else if (this.foldable) {
      if (this.horizontal) {
        this.style!.height = '';
        this.style!.width = this.innerElement!.clientWidth + 'px';
      } else {
        this.style!.height = ((this.headerSize || 32) + this.innerElement!.clientHeight) + 'px';
      }
    }
  };

  private _onNodesChanged(): void {
    if (!this.foldable || this.folded || this.horizontal || this.hidden)
      return;

    this.style!.height = (Math.max(0, (this.headerSize || 32)) + this.innerElement!.clientHeight) + 'px';
  };

  public headerAppend(element: HTMLElement | Element): void {
    if (!this.headerElement)
      return;

    let html: boolean = (element instanceof HTMLElement);
    let node: HTMLElement = html ? <HTMLElement>element : (<Element>element).element!;

    this.headerElement.insertBefore(node, this.headerElementTitle);

    if (!html)
      (<Element>element).parent = this;
  };

  // TODO
  private _onScroll(evt: any) {
    this.emit('scroll', evt);
  };

}