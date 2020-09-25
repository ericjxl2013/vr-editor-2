import { ContainerElement } from "./container-element";

export class Overlay extends ContainerElement {


  public elementOverlay: HTMLElement;


  public get clickable(): boolean {
    return this.elementOverlay.classList.contains('clickable');
  }
  public set clickable(val: boolean) {
    if (val) {
      this.elementOverlay.classList.add('clickable');
    } else {
      this.elementOverlay.classList.remove('clickable');
    }
  }

  public get rect(): ClientRect | DOMRect {
    return this.innerElement!.getBoundingClientRect();
  }

  public get center(): boolean {
    return this.element!.classList.contains('center');
  }
  public set center(val: boolean) {
    if (val) {
      this.element!.classList.add('center');
      this.innerElement!.style.left = '';
      this.innerElement!.style.top = '';
    } else {
      this.element!.classList.remove('center');
    }
  }

  public get transparent(): boolean {
    return this.element!.classList.contains('transparent');
  }
  public set transparent(val: boolean) {
    if (val) {
      this.element!.classList.add('transparent');
    } else {
      this.element!.classList.remove('transparent');
    }
  }

  public constructor() {
    super();

    this.element = document.createElement('div');
    this.element.classList.add('ui-overlay', 'center');

    this.elementOverlay = document.createElement('div');
    this.elementOverlay.ui = this;
    this.elementOverlay.classList.add('overlay', 'clickable');
    this.element.appendChild(this.elementOverlay);

    this.elementOverlay.addEventListener('mousedown', this._onMouseDown.bind(this), false);

    this.innerElement = document.createElement('div');
    this.innerElement.classList.add('content');
    this.element.appendChild(this.innerElement);

  }

  private _onMouseDown(evt: MouseEvent): void {
    if (!this.clickable)
      return;

    let self = this;

    // some field might be in focus
    document.body.blur();

    // wait till blur takes in account
    requestAnimationFrame(function () {
      // hide overlay
      self.hidden = true;
    });

    evt.preventDefault();
  }

  public position(x: number, y: number): void {
    let area = this.elementOverlay.getBoundingClientRect();
    let rect = this.innerElement!.getBoundingClientRect();

    x = Math.max(0, Math.min(area.width - rect.width, x));
    y = Math.max(0, Math.min(area.height - rect.height, y));

    this.innerElement!.style.left = x + 'px';
    this.innerElement!.style.top = y + 'px';
  }


}