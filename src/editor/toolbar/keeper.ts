import { ToolbarLogo } from "./toolbar-logo";
import { ToolbarGizmos } from "./toolbar-gizmos";
import { ToolbarHistory } from "./toolbar-history";
import { ToolbarHelp } from "./toolbar-help";
import { ToolbarControl } from "./toolbar-control";
import { ToolbarEditorSettings } from "./toolbar-editor-settings";
import { ToolbarPublish } from "./toolbar-publish";
import { ToolbarScene } from "./toolbar-scene";
import { ToolbarCamera } from "./toolbar-camera";
import { ToolbarStatus } from "./toolbar-status";

export class ToolbarKeeper {

    public constructor() {

        new ToolbarStatus();
        let logo = new ToolbarLogo();
        let gizmos = new ToolbarGizmos();
        let history = new ToolbarHistory();

        let help = new ToolbarHelp();
        let control = new ToolbarControl();
        let settings = new ToolbarEditorSettings();
        let publish = new ToolbarPublish();


        let scene = new ToolbarScene();

        new ToolbarCamera();

    }

}