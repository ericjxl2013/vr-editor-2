import { Tooltip, Panel, Element, TopElementContainer, TopElementPanel } from "../../ui";
import { VeryEngine } from "../../engine";

// 属性参考说明Tooltip
export class AttributesReference {

  public root: TopElementContainer;
  public attributesPanel: TopElementPanel;

  public index: { [key: string]: Tooltip } = {};
  public missing: { [key: string]: boolean } = {};


  public constructor() {

    this.root = VeryEngine.root;
    this.attributesPanel = VeryEngine.attributes;

    this.init();
  }


  private init(): void {

    let self = this;

    // TODO
    editor.method('attributes:reference:add', function (args: any) {
      self.index[args.name] = editor.call('attributes:reference', args);
    });

    editor.method('attributes:reference:attach', function (name: string, target: HTMLElement, element: Element, panel?: Panel) {
      let tooltip = self.index[name];

      if (!tooltip) {
        if (!self.missing[name]) {
          self.missing[name] = true;
        //   console.log('reference', name, 'is not defined');
        }
        return;
      }

      tooltip.attachReference({
        target: target,
        panel: panel,
        element: element || target.ui
      });

      return tooltip;
    });

    editor.method('attributes:reference:template', function (args: any) {
      let html = '';

      if (args.title)
        html += '<h1>' + self.sanitize(args.title) + '</h1>';
      if (args.subTitle)
        html += '<h2>' + self.sanitize(args.subTitle) + '</h2>';
      if (args.webgl2)
        html += '<div class="tag">WebGL 2.0 Only</div>';
      if (args.description) {
        let description = self.sanitize(args.description);
        description = description.replace(/\n/g, '<br />'); // new lines
        description = description.replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>'); // bold
        html += '<p>' + description + '</p>';
      }
      if (args.code)
        html += '<pre class="ui-code">' + self.sanitize(args.code) + '</pre>';
      if (args.url)
        html += '<a class="reference" href="' + self.sanitize(args.url) + '" target="_blank">API Reference</a>';

      return html;
    });


    editor.method('attributes:reference', function (args: any) {
      let tooltip = new Tooltip({
        align: 'right'
      });
      tooltip.hoverable = true;
      tooltip.class!.add('reference');

      tooltip.html = editor.call('attributes:reference:template', args);

      // let links = {};
      let timerHover: any = null;
      let timerBlur: any = null;

      // 重写该方法
      tooltip.attachReference = function (args: any) {
        let target = args.target;
        let element = args.element;
        let targetPanel = args.panel || self.attributesPanel;

        let show = function () {
          if (!target || target.hidden) return;
          tooltip.position(targetPanel.element.getBoundingClientRect().left, element.getBoundingClientRect().top + 16);
          tooltip.hidden = false;
        };

        let evtHide = function () {
          if (timerHover !== null) clearTimeout(timerHover);
          if (timerBlur !== null) clearTimeout(timerBlur);
          tooltip.hidden = true;
        };

        let evtHover = function () {
          if (timerBlur !== null) clearTimeout(timerBlur);
          timerHover = setTimeout(show, 500);
        };

        let evtBlur = function () {
          if (timerHover !== null) clearTimeout(timerHover);
          timerBlur = setTimeout(hide, 200);
        };

        let evtClick = function () {
          if (timerHover !== null) clearTimeout(timerHover);
          if (timerBlur !== null) clearTimeout(timerBlur);
          show();
        };

        target.on('hide', evtHide);

        target.once('destroy', function () {
          element.removeEventListener('mouseover', evtHover);
          element.removeEventListener('mouseout', evtBlur);
          element.removeEventListener('click', evtClick);
          target.unbind('hide', evtHide);
          target = null;
          element = null;
          if (timerHover !== null) clearTimeout(timerHover);
          if (timerBlur !== null) clearTimeout(timerBlur);
          tooltip.hidden = true;
        });

        element.addEventListener('mouseover', evtHover, false);
        element.addEventListener('mouseout', evtBlur, false);
        element.addEventListener('click', evtClick, false);
      };

      let hide = function () {
        tooltip.hidden = true;
      };

      tooltip.on('hover', function () {
        clearTimeout(timerBlur);
      });

      self.root.append(tooltip);

      return tooltip;
    });
  }


  private sanitize(str: string) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };


}