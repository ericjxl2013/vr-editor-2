import { Element } from "./element";

export class Bubble extends Element {


  public constructor(id?: string, tabindex?: number) {
    super();

    this.element = document.createElement('div');
    this.element.classList.add('ui-bubble');

    let pulseCircle: HTMLDivElement = document.createElement('div');
    pulseCircle.classList.add('pulse');
    this.element.appendChild(pulseCircle);

    let centerCircle: HTMLDivElement = document.createElement('div');
    centerCircle.classList.add('center');
    this.element.appendChild(centerCircle);

    this.on('click', this._onClick);

    if (id !== undefined)
      this.element.id = id;

    if (tabindex !== undefined)
      this.element.setAttribute('tabindex', tabindex.toString());
  }

  private _onClick(): void {
    if (this.class!.contains('active')) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  public activate(): void {
    this.class!.add('active');
    this.emit('activate');
  }

  public deactivate(): void {
    this.class!.remove('active');
    this.emit('deactivate');
  }

  public position(x: number, y: number) {
    let rect = this.element!.getBoundingClientRect();

    let left = x || 0;
    let top = y || 0;

    this.element!.style.left = (typeof left === 'number') ? left + 'px' : left;
    this.element!.style.top = (typeof top === 'number') ? top + 'px' : top;
  }

}