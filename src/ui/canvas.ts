import { Element } from './element';

export class Canvas extends Element {

  public get width(): number {
    return this.element ? (<HTMLCanvasElement>this.element).width : 0;
  }
  public set width(val: number) {
    if (!this.element) return;
    if ((<HTMLCanvasElement>this.element).width === val) return;

    (<HTMLCanvasElement>this.element).width = val;
    this.emit('resize', (<HTMLCanvasElement>this.element).width, (<HTMLCanvasElement>this.element).height);
  }

  public get height(): number {
    return this.element ? (<HTMLCanvasElement>this.element).height : 0;
  }
  public set height(val: number) {
    if (!this.element) return;
    if ((<HTMLCanvasElement>this.element).height === val) return;

    (<HTMLCanvasElement>this.element).height = val;
    this.emit('resize', (<HTMLCanvasElement>this.element).width, (<HTMLCanvasElement>this.element).height);
  }

  public constructor(id?: string) {
    super();

    this.element = document.createElement('canvas');
    this.element.classList.add('ui-canvas');

    if (id !== undefined) this.element.id = id;

    this.element.onselectstart = this.onselectstart;

  }

  private onselectstart(): boolean {
    return false;
  };

  public resize(width: number, height: number): void {
    if ((<HTMLCanvasElement>this.element).width === width && (<HTMLCanvasElement>this.element).height === height) return;

    (<HTMLCanvasElement>this.element).width = width;
    (<HTMLCanvasElement>this.element).height = height;
    this.emit('resize', (<HTMLCanvasElement>this.element).width, (<HTMLCanvasElement>this.element).height);
  };

}