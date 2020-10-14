import { Panel, TopElementContainer, TopElementPanel } from '../ui';
import { VeryEngine } from '../engine';

export class Layout {

    private ignoreClasses: RegExp = /(ui-list-item)|(ui-button)|(ui-text-field)|(ui-number-field)/i;
    private ignoreElements: RegExp = /(input)|(textarea)/i;


    public constructor() {
        let self = this;
        // prevent drag'n'select
        window.addEventListener('mousedown', function (evt) {
            // don't prevent for certain cases
            if (evt.target) {
                if (self.ignoreClasses.test((<HTMLElement>evt.target).className)) {
                    return;
                } else if (self.ignoreElements.test((<HTMLElement>evt.target).tagName)) {
                    return;
                } else if ((<HTMLElement>evt.target).classList.contains('selectable')) {
                    return;
                }
            }

            // blur inputs
            if (window.getSelection) {
                let focusNode = window.getSelection()!.focusNode;
                if (focusNode) {
                    if ((<HTMLElement>focusNode).tagName === 'INPUT') {
                        (<HTMLElement>focusNode).blur();
                    } else if (focusNode.firstChild && (<HTMLElement>focusNode.firstChild).tagName === 'INPUT') {
                        (<HTMLElement>focusNode.firstChild).blur();
                    }
                }
            }

            // prevent default will prevent blur, dragstart and selection
            evt.preventDefault();
        }, false);
    }

    public init(): void {
        // main container
        var root = new TopElementContainer({
            id: 'layout-root',
            grid: true
        });
        document.body.appendChild(root.dom!);
        // expose
        editor.method('layout.root', function () {
            return root;
        });
        VeryEngine.root = root;

        // toolbar (left)
        var toolbar = new TopElementContainer({
            id: 'layout-toolbar',
            flex: true
        });
        root.append(toolbar);
        // expose
        editor.method('layout.toolbar', function () { return toolbar; });
        VeryEngine.toolbar = toolbar;

        // hierarchy
        var hierarchyPanel = new TopElementPanel({
            headerText: '层级菜单',
            id: 'layout-hierarchy',
            flex: true,
            enabled: true,
            width: editor.call('localStorage:get', 'editor:layout:hierarchy:width') || 256,
            panelType: 'normal',
            collapsible: true,
            collapseHorizontally: true,
            collapsed: editor.call('localStorage:get', 'editor:layout:hierarchy:collapse') || window.innerWidth <= 480,
            scrollable: true,
            resizable: 'right',
            resizeMin: 196,
            resizeMax: 512
        });

        hierarchyPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:width', hierarchyPanel.width);
        });
        hierarchyPanel.on('collapse', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:collapse', true);
        });
        hierarchyPanel.on('expand', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:collapse', false);
        });

        root.append(hierarchyPanel);
        // expose
        editor.method('layout.hierarchy', function () { return hierarchyPanel; });

        editor.on('permissions:writeState', function (state: boolean) {
            hierarchyPanel.enabled = state;
        });
        VeryEngine.hierarchy = hierarchyPanel;


        // viewport
        var viewport = new TopElementContainer({
            id: 'layout-viewport'
        });
        viewport.class!.add('viewport');
        root.append(viewport);
        // expose
        editor.method('layout.viewport', function () { return viewport; });
        VeryEngine.viewportPanel = viewport;

        // assets
        var assetsPanel = new TopElementPanel({
            id: 'layout-assets',
            headerText: '资源面板',
            flex: true,
            flexDirection: 'row',
            panelType: 'normal',
            collapsible: true,
            collapsed: editor.call('localStorage:get', 'editor:layout:assets:collapse') || window.innerHeight <= 480,
            height: editor.call('localStorage:get', 'editor:layout:assets:height') || 212,
            scrollable: true,
            resizable: 'top',
            resizeMin: 106,
            resizeMax: 106 * 6
        });
        assetsPanel.class!.add('assets');

        assetsPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:assets:height', assetsPanel.height);
        });
        assetsPanel.on('collapse', function () {
            editor.call('localStorage:set', 'editor:layout:assets:collapse', true);
        });
        assetsPanel.on('expand', function () {
            editor.call('localStorage:set', 'editor:layout:assets:collapse', false);
        });

        root.append(assetsPanel);
        // expose
        editor.method('layout.assets', function () { return assetsPanel; });
        VeryEngine.assets = assetsPanel;

        // attributes
        var attributesPanel = new TopElementPanel({
            id: 'layout-attributes',
            headerText: '属性面板',
            enabled: true,
            panelType: 'normal',
            width: editor.call('localStorage:get', 'editor:layout:attributes:width') || 320,
            collapsible: true,
            collapseHorizontally: true,
            collapsed: editor.call('localStorage:get', 'editor:layout:attributes:collapse') || false,
            scrollable: true,
            resizable: 'left',
            resizeMin: 256,
            resizeMax: 512
        });
        attributesPanel.class!.add('attributes');

        attributesPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:width', attributesPanel.width);
        });
        attributesPanel.on('collapse', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:collapse', true);
        });
        attributesPanel.on('expand', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:collapse', false);
        });

        root.append(attributesPanel);
        // expose
        editor.method('layout.attributes', function () { return attributesPanel; });
        editor.on('permissions:writeState', function (state: boolean) {
            attributesPanel.enabled = state;
        });
        VeryEngine.attributes = attributesPanel;

        // status bar
        var statusBar = new TopElementContainer({
            id: 'layout-statusbar',
            flex: true,
            flexDirection: 'row'
        });
        root.append(statusBar);
        // expose
        editor.method('layout.statusBar', function () { return statusBar; });
        VeryEngine.statusBar = statusBar;

        if (window.innerWidth <= 720) {
            // attributesPanel.folded = true;
            console.warn('folder');
        }
            

    }


}