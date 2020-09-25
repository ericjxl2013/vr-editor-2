import { AttributesPanel } from "./attributes-panel";
import { AttributesReference } from "./attributes-reference";
import { AttributesEntity } from "./attributes-entity";
import { AttributesAssets } from "./attributes-assets";
import { AttributeHistory } from "./attributes-history";
import { AttributeAssetsTexture } from "./assets/attributes-assets-texture";
import { AttributeComponentCamera } from "./components/attributes-component-camera";

export class AttributesKeeper {
    public constructor() {

        let attributesPanel = new AttributesPanel();

        let attributesHistory = new AttributeHistory();

        let attributesReference = new AttributesReference();

        let attributesEntity = new AttributesEntity();

        let attributesAsset = new AttributesAssets();

        let attributesAssetsTexture = new AttributeAssetsTexture();

        new AttributeComponentCamera();

    }
}