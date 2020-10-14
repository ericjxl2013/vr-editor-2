import { AttributesPanel, AttributesEntity, AttributesReference, AttributesKeeper } from "./attributes";
import { ToolbarKeeper } from "./toolbar";
import { ViewportKeeper } from "./viewport";
import { EntityKeeper } from "./entity";
import { ScenesKeeper } from "./scenes";
import { CameraKeeper } from "./camera";
import { SettingsKeeper } from "./settings";
import { PickerKeeper } from "./pickers";


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

    // picker
    new PickerKeeper();

    // viewport
    new ViewportKeeper();

  }


}