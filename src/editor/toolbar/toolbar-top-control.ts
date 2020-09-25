import { Panel, Button, Tooltip } from '../../ui';
import { VeryEngine } from '../../engine';
import { Config } from '../global';

export class ToolbarTopControl {




    public constructor() {

        // panel
        var panel = new Panel();
        panel.class!.add('top-controls');
        VeryEngine.viewportPanel.append(panel);

        editor.method('layout.toolbar.launch', function () {
            return panel;
        });

        // fullscreen button
        var buttonExpand = new Button('&#57639;');
        buttonExpand.class!.add('icon', 'expand');
        panel.append(buttonExpand);

        buttonExpand.on('click', function () {
            editor.call('viewport:expand');
        });

        editor.on('viewport:expand', function (state: boolean) {
            if (state) {
                tooltipExpand.text = '还原 / 空格键';
                buttonExpand.class!.add('active');
            } else {
                tooltipExpand.text = '最大化 / 空格键';
                buttonExpand.class!.remove('active');
            }

            tooltipExpand.hidden = true;
        });

        var tooltipExpand = Tooltip.attach({
            target: buttonExpand.element!,
            text: '最大化 / 空格键',
            align: 'top',
            root: VeryEngine.root
        });

        // launch
        var launch = new Panel();
        launch.class!.add('launch');
        panel.append(launch);
        launch.style!.marginRight = '2px';
        // launch.disabled = true;

        var buttonLaunch = new Button('&#57649;');
        buttonLaunch.class!.add('icon');
        launch.append(buttonLaunch);

        buttonLaunch.on('click', function () {
            window.open(window.location.protocol + '//' + window.location.host + '/publish/' + Config.projectID);
        });

        var tooltipLaunch = Tooltip.attach({
            target: buttonLaunch.element!,
            text: '运行',
            align: 'top',
            root: VeryEngine.root
        });


    }


}