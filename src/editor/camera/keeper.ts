import { Cameras } from "./cameras";
import { CameraDepth } from "./camera-depth";
import { CameraPreview } from "./camera-preview";
import { CameraUserdata } from "./camera-userdata";
import { CameraViewport } from "./camera-viewport";

export class CameraKeeper {

    public constructor() {

        new Cameras();
        new CameraViewport();
        // new CameraUserdata();
        // new CameraDepth();
        new CameraPreview();

    }


}