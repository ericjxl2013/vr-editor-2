import { VeryCamera, Viewport } from "../editor";
import { Canvas, Panel, Tree, Grid, TopElementContainer, TopElementPanel } from "../ui";
import { Database } from "../editor/middleware/offline/database";

export class VeryEngine {
    public static root: TopElementContainer;
    public static toolbar: TopElementContainer;
    public static viewportPanel: TopElementContainer;
    public static statusBar: TopElementContainer;
    public static hierarchy: TopElementPanel;
    public static assets: TopElementPanel;
    public static attributes: TopElementPanel;


    // public static viewPanel: Panel;
    // public static rootPanel: Panel;
    public static toolbarPanel: Panel;

    public static hierarchyPanel: Panel;
    public static hierarchyTree: Tree;

    // public static assetPanel: Panel;
    public static attributesPanel: Panel;

    public static viewport: Viewport;

    public static viewCanvas: Canvas;
    public static viewCanvasElement: HTMLCanvasElement;
    public static viewEngine: BABYLON.Engine;
    public static viewScene: BABYLON.Scene;
    public static viewCamera: VeryCamera;
    // public static viewCamera: VeryCamera;

    // assets
    public static assetsGrid: Grid;


    // TODO
    public static database: Database;

    public static cameras: VeryCamera[] = [];
    public static cameraDic: { [key: string]: VeryCamera } = {};

    // public static 

    public constructor() {

    }


    public static addCamera(camera: VeryCamera): void {
        VeryEngine.cameras.push(camera);
        VeryEngine.cameraDic[camera.id] = camera;
    }

    public static getCamera(camera: BABYLON.Camera): Nullable<VeryCamera> {
        if (camera.parent && camera.parent instanceof VeryCamera) {
            if (camera.parent.id in VeryEngine.cameraDic ) {
                return VeryEngine.cameraDic[camera.parent.id];
            } else {
                return null;
            }
        } else {
            for (let i = 0, len = VeryEngine.cameras.length; i < len; i++) {
                if (VeryEngine.cameras[i].camera === camera) {
                    return VeryEngine.cameras[i];
                }
            }
        }
        return null;
    }

}


// export veryconfig