import { Panel, TopElementPanel } from "../../ui";
import { VeryEngine } from "../../engine";

/* 
*  viewport窗口最大化显示控制；
*/
export class ViewportExpand {

  public constructor() {
    let panels: TopElementPanel[] = [];
    panels.push(VeryEngine.hierarchy);
    panels.push(VeryEngine.assets);
    panels.push(VeryEngine.attributes);

    let expanded: boolean = false;

    window.editor.method('viewport:expand', function (state: boolean) {
      if (state === undefined)
        state = !expanded;

      if (expanded === state)
        return;

      expanded = state;

      for (var i = 0; i < panels.length; i++)
        panels[i].hidden = expanded;

      window.editor.emit('viewport:expand', state);
    });


    window.editor.method('viewport:expand:state', function () {
      return expanded;
    });


    // expand hotkey
    window.editor.call('hotkey:register', 'viewport:expand', {
      key: 'space',
      callback: function () {
        window.editor.call('viewport:expand');
      }
    });

  }



}

