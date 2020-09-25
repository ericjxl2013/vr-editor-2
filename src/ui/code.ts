import { ContainerElement } from "./container-element";

export class Code extends ContainerElement {

  public get text(): string {
    return this.element!.textContent || '';
  }
  public set text(val: string) {
    this.element!.textContent = val;
  }


  public constructor() {
    super();

    this.element = document.createElement('pre');
    this.element.classList.add('ui-code');

  }

}