import { VeryEngine } from "../../engine";
import { Panel, Label, Tooltip } from "../../ui";

export class ToolbarScene {

    public constructor() {

        var root = VeryEngine.root;
        var viewport = VeryEngine.viewportPanel;

        var panel = new Panel();
        panel.class!.add('widget-title');
        viewport.append(panel);

        editor.method('layout.toolbar.scene', function () {
            return panel;
        });

        var projectName = new Label();
        // TODO
        projectName.text = '当前项目名称';
        projectName.class!.add('project-name');
        projectName.renderChanges = false;
        panel.append(projectName);

        projectName.on('click', function (argument: any) {
            // window.open('/project/' + config.project.id, '_blank');
        });

        editor.method("toolbar.project.set", (name: string) => {
            projectName.text = name;
        });

        Tooltip.attach({
            target: projectName.element!,
            text: '项目名',
            align: 'top',
            root: root
        });

        var sceneName = new Label();
        // TODO
        sceneName.text = '当前场景名';
        sceneName.class!.add('scene-name');
        sceneName.renderChanges = false;
        panel.append(sceneName);

        editor.method("toolbar.scene.set", (name: string) => {
            sceneName.text = name;
        });

        Tooltip.attach({
            target: sceneName.element!,
            text: '场景名',
            align: 'top',
            root: root
        });

        editor.on('scene:name', function (name: string) {
            sceneName.text = name;
        });

        sceneName.on('click', function () {
            // editor.call('selector:set', 'editorSettings', [editor.call('settings:projectUser')]);
            editor.call('selector:set', 'editorSettings', [editor.call('settings:data')]);
        });

        editor.on('attributes:clear', function () {
            sceneName.class!.remove('active');
        });

        editor.on('attributes:inspect[editorSettings]', function () {
            sceneName.class!.add('active');
        });

        editor.on('scene:unload', function () {
            sceneName.text = '';
        });

        // 版本管理
        // if (!config.project.settings.useLegacyScripts) {
        //     var name = config.self.branch.name;
        //     if (name.length > 33) {
        //         name = name.substring(0, 30) + '...';
        //     }
        //     var branchButton = new ui.Label({
        //         text: name
        //     });
        //     branchButton.class.add('branch-name');
        //     panel.append(branchButton);
        //     branchButton.on('click', function () {
        //         editor.call('picker:versioncontrol');
        //     });

        //     Tooltip.attach({
        //         target: branchButton.element,
        //         text: 'Version Control',
        //         align: 'top',
        //         root: root
        //     });

        //     // hide version control picker if we are not part of the team
        //     if (!editor.call('permissions:read')) {
        //         branchButton.hidden = true;
        //     }
        //     editor.on('permissions:set', function () {
        //         branchButton.hidden = !editor.call('permissions:read');
        //     });
        // }

        // 场景设置
        // var sceneList = new Label();
        // sceneList.class!.add('scene-list');
        // panel.append(sceneList);

        // Tooltip.attach({
        //     target: sceneList.element!,
        //     text: '场景设置',
        //     align: 'top',
        //     root: root
        // });

        // sceneList.on('click', function () {
        //     // editor.call('picker:scene');
        // });

        // editor.on('picker:scene:open', function () {
        //     sceneList.class!.add('active');
        // });

        // editor.on('picker:scene:close', function () {
        //     sceneList.class!.remove('active');
        // });


    }
}