import { AttributesPanel, AttributesEntity, AttributesReference, AttributesKeeper } from "./attributes";
import { ToolbarKeeper } from "./toolbar";
import { ViewportKeeper } from "./viewport";
import { EntityKeeper } from "./entity";
import { ScenesKeeper } from "./scenes";
import { CameraKeeper } from "./camera";
import { SettingsKeeper } from "./settings";


export class InitializeAfter {


  public constructor() {

    // entity
    let entity = new EntityKeeper();

    // scenes
    new ScenesKeeper();

    // camera
    new CameraKeeper();

    // attributes
    let attributes = new AttributesKeeper();

    // toolbar
    let toolbar = new ToolbarKeeper();
    new SettingsKeeper();

    // viewport
    new ViewportKeeper();

  }


}