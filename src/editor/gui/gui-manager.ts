export class GUIManager {

    public constructor() {

    }


    private static _2dCanvasGroup: BABYLON.GUI.AdvancedDynamicTexture[] = [];
    private static _2dCanvasGroupID: string[] = [];
    private static _2dCanvasGroupDic: { [key: string]: BABYLON.GUI.AdvancedDynamicTexture } = {};

    private static _uniqueID2resourceID: { [key: number]: string } = {};

    public static add2DCanvas(id: string, canvas: BABYLON.GUI.AdvancedDynamicTexture) {
        this._2dCanvasGroup.push(canvas);
        this._2dCanvasGroupID.push(id);
        this._2dCanvasGroupDic[id] = canvas;
    }

    public static getActiveCanvas(): Nullable<BABYLON.GUI.AdvancedDynamicTexture> {
        if (GUIManager._2dCanvasGroup && GUIManager._2dCanvasGroup.length > 0) {
            return GUIManager._2dCanvasGroup[GUIManager._2dCanvasGroup.length - 1];
        } else {
            return null;
        }
    }

    public static getActiveID(): string {
        if (GUIManager._2dCanvasGroupID && GUIManager._2dCanvasGroupID.length > 0) {
            return GUIManager._2dCanvasGroupID[GUIManager._2dCanvasGroupID.length - 1];
        } else {
            return '';
        }
    }

    public static getCanvasFromIndex(index: number): Nullable<BABYLON.GUI.AdvancedDynamicTexture> {
        if (GUIManager._2dCanvasGroup && GUIManager._2dCanvasGroup.length > 0) {
            if (index >= 0 && index < GUIManager._2dCanvasGroup.length) {
                return GUIManager._2dCanvasGroup[index];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public static addUniqueIDIndex(unique_id: number, resource_id: string): void {
        GUIManager._uniqueID2resourceID[unique_id] = resource_id;
    }

    public static getResourceID(unique_id: number): string {
        return GUIManager._uniqueID2resourceID[unique_id] ? GUIManager._uniqueID2resourceID[unique_id] : '';
    }
    
    public static dragAllow(child_type: string, child_subtype: string, parent_type: string, parent_subtype: string): boolean {
        

        return false;
    }

}