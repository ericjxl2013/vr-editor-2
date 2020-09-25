import { ViewportApplication } from "./viewport-application";
import { ViewportInstanceCreate } from "./viewport-instance-create";
import { ViewportDropModel } from "./viewport-drop-model";
import { ViewportEntitiesObserverBinding } from "./viewport-entities-observer-binding";
import { ViewportTap } from "./viewport-tap";

export class ViewportKeeper {

    public constructor() {
        new ViewportApplication();
        new ViewportEntitiesObserverBinding();
        new ViewportInstanceCreate();
        new ViewportDropModel();
        new ViewportTap();
    }

}