import { ContainerElement } from "./container-element";
import { TopElementContainer } from "./top";

export class Tooltip extends ContainerElement {

  public arrow: HTMLElement;
  public hoverable: boolean;
  public x: number;
  public y: number;

  private _align: string;
  public get align(): string {
    return this._align;
  }
  public set align(val: string) {
    if (this._align === val)
      return;

    this.class!.remove('align-' + this._align);
    this._align = val;
    this.class!.add('align-' + this._align);

    this._reflow();
  }

  public get html(): string {
    return this.innerElement!.innerHTML;
  }
  public set html(val: string) {
    if (this.innerElement!.innerHTML === val)
      return;

    this.innerElement!.innerHTML = val;
  }

  public get text(): string {
    return this.innerElement!.textContent || '';
  }
  public set text(val: string) {
    if (this.innerElement!.textContent === val)
      return;

    this.innerElement!.textContent = val;
  }

  public get flip(): boolean {
    return this.class!.contains('flip');
  }
  public set flip(val: boolean) {
    if (this.class!.contains('flip') === val)
      return;

    if (val) {
      this.class!.add('flip');
    } else {
      this.class!.remove('flip');
    }

    this._reflow();
  }

  public constructor(args?: TooltipArgs) {
    super();
    args = args || {};
    let self = this;

    this.element = document.createElement('div');
    this.element.classList.add('ui-tooltip', 'align-left');

    this.innerElement = document.createElement('div');
    this.innerElement.classList.add('inner');
    this.element.appendChild(this.innerElement);

    this.arrow = document.createElement('div');
    this.arrow.classList.add('arrow');
    this.element.appendChild(this.arrow);

    this.hoverable = args.hoverable || false;
    this.x = args.x || 0;
    this.y = args.y || 0;
    this._align = 'left';
    this.align = args.align || 'left';

    this.on('show', this._reflow);
    this.hidden = args.hidden !== undefined ? args.hidden : true;
    if (args.html) {
      this.html = args.html;
    } else {
      this.text = args.text || '';
    }

    this.element.addEventListener('mouseover', this._onMouseOver.bind(this), false);
    this.element.addEventListener('mouseleave', this._onMouseLeave.bind(this), false);

  }

  private _onMouseOver(evt: MouseEvent): void {
    if (!this.hoverable)
      return;

    this.hidden = false;
    this.emit('hover', evt);
  }

  private _onMouseLeave(): void {
    if (!this.hoverable)
      return;

    this.hidden = true;
  }

  public position(x: number, y: number): void {
    x = Math.floor(x);
    y = Math.floor(y);

    if (this.x === x && this.y === y)
      return;

    this.x = x;
    this.y = y;

    this._reflow();
  }

  private _reflow(): void {
    if (this.hidden)
      return;

    this.element!.style.top = '';
    this.element!.style.right = '';
    this.element!.style.bottom = '';
    this.element!.style.left = '';

    this.arrow.style.top = '';
    this.arrow.style.right = '';
    this.arrow.style.bottom = '';
    this.arrow.style.left = '';

    this.element!.style.display = 'block';

    // alignment
    switch (this._align) {
      case 'top':
        this.element!.style.top = this.y + 'px';
        if (this.flip) {
          this.element!.style.right = 'calc(100% - ' + this.x + 'px)';
        } else {
          this.element!.style.left = this.x + 'px';
        }
        break;
      case 'right':
        this.element!.style.top = this.y + 'px';
        this.element!.style.right = 'calc(100% - ' + this.x + 'px)';
        break;
      case 'bottom':
        this.element!.style.bottom = 'calc(100% - ' + this.y + 'px)';
        if (this.flip) {
          this.element!.style.right = 'calc(100% - ' + this.x + 'px)';
        } else {
          this.element!.style.left = this.x + 'px';
        }
        break;
      case 'left':
        this.element!.style.top = this.y + 'px';
        this.element!.style.left = this.x + 'px';
        break;
    }

    // limit to screen bounds
    let rect = this.element!.getBoundingClientRect();

    if (rect.left < 0) {
      this.element!.style.left = '0px';
      this.element!.style.right = '';
    }
    if (rect.top < 0) {
      this.element!.style.top = '0px';
      this.element!.style.bottom = '';
    }
    if (rect.right > window.innerWidth) {
      this.element!.style.right = '0px';
      this.element!.style.left = '';
      this.arrow.style.left = Math.floor(rect.right - window.innerWidth + 8) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      this.element!.style.bottom = '0px';
      this.element!.style.top = '';
      this.arrow.style.top = Math.floor(rect.bottom - window.innerHeight + 8) + 'px';
    }

    this.element!.style.display = '';
  }

  public evtHover(): void {

  }

  public evtBlur(): void {

  }


  public static attach(args: TooltipArgs): Tooltip {
    let data: TooltipArgs = {
      align: args.align,
      hoverable: args.hoverable
    }

    if (args.html) {
      data.html = args.html;
    } else {
      data.text = args.text || '';
    }

    let item: Tooltip = new Tooltip(data);

    item.evtHover = function () {
      let rect = args.target!.getBoundingClientRect();
      let off = 16;

      switch (item.align) {
        case 'top':
          if (rect.width < 64) off = rect.width / 2;
          item.flip = rect.left + off > window.innerWidth / 2;
          if (item.flip) {
            item.position(rect.right - off, rect.bottom);
          } else {
            item.position(rect.left + off, rect.bottom);
          }
          break;
        case 'right':
          if (rect.height < 64) off = rect.height / 2;
          item.flip = false;
          item.position(rect.left, rect.top + off);
          break;
        case 'bottom':
          if (rect.width < 64) off = rect.width / 2;
          item.flip = rect.left + off > window.innerWidth / 2;
          if (item.flip) {
            item.position(rect.right - off, rect.top);
          } else {
            item.position(rect.left + off, rect.top);
          }
          break;
        case 'left':
          if (rect.height < 64) off = rect.height / 2;
          item.flip = false;
          item.position(rect.right, rect.top + off);
          break;
      }

      item.hidden = false;
    };

    item.evtBlur = function () {
      item.hidden = true;
    };

    args.target!.addEventListener('mouseover', item.evtHover, false);
    args.target!.addEventListener('mouseout', item.evtBlur, false);

    item.on('destroy', function () {
      args.target!.removeEventListener('mouseover', item.evtHover);
      args.target!.removeEventListener('mouseout', item.evtBlur);
    });

    args.root!.append(item);

    return item;
  }


  public attachReference(args: any): void {

  }


}



export interface TooltipArgs {

  target?: HTMLElement;
  text?: string;
  align?: string;
  root?: TopElementContainer;
  hoverable?: boolean;
  html?: string;
  x?: number;
  y?: number;
  hidden?: boolean;

}