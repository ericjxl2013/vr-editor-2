// import { Observer, Observable } from "../Misc/observable";
// import { Nullable } from "../types";
// import { PointerInfo } from "../Events/pointerEvents";
// import { Vector3, Matrix } from "../Maths/math.vector";
// import { Color3 } from '../Maths/math.color';
// import { TransformNode } from "../Meshes/transformNode";
// import { Node } from "../node";
// import { Mesh } from "../Meshes/mesh";
// import { PlaneBuilder } from "../Meshes/Builders/planeBuilder";
// import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior";
import { Gizmo } from "./gizmo";
// import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
// import { StandardMaterial } from "../Materials/standardMaterial";
// import { Scene } from "../scene";
import { PositionGizmo } from "./positionGizmo";
import { UtilityLayerRenderer } from "./UtilityLayerRenderer";
/**
 * Single plane drag gizmo
 */
export class PlaneDragGizmo extends Gizmo {
    /**
     * Drag behavior responsible for the gizmos dragging interactions
     */
    public dragBehavior: BABYLON.PointerDragBehavior;
    private _pointerObserver: Nullable<BABYLON.Observer<BABYLON.PointerInfo>> = null;
    /**
     * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
     */
    public snapDistance = 0;
    /**
     * Event that fires each time the gizmo snaps to a new location.
     * * snapDistance is the the change in distance
     */
    public onSnapObservable = new BABYLON.Observable<{ snapDistance: number }>();

    private _plane: BABYLON.TransformNode;
    private _coloredMaterial: BABYLON.StandardMaterial;
    private _hoverMaterial: BABYLON.StandardMaterial;

    private _isEnabled: boolean = false;
    private _parent: Nullable<PositionGizmo> = null;

    /** @hidden */
    public static _CreatePlane(scene: BABYLON.Scene, material: BABYLON.StandardMaterial): BABYLON.TransformNode {
        var plane = new BABYLON.TransformNode("plane", scene);

        //make sure plane is double sided
        var dragPlane = BABYLON.PlaneBuilder.CreatePlane("dragPlane", { width: .1375, height: .1375, sideOrientation: 2 }, scene);
        // var dragPlane = BABYLON.MeshBuilder.CreateGround("dragPlane", { width: .1375, height: .1375 }, scene)
        // .CreatePlane("dragPlane", .1375, scene, undefined, 2);
        dragPlane.material = material;
        dragPlane.parent = plane;
        return plane;
    }

    /** @hidden */
    public static _CreateArrowInstance(scene: BABYLON.Scene, arrow: BABYLON.TransformNode): BABYLON.TransformNode {
        const instance = new BABYLON.TransformNode("arrow", scene);
        for (const mesh of arrow.getChildMeshes()) {
            const childInstance = (mesh as BABYLON.Mesh).createInstance(mesh.name);
            childInstance.parent = instance;
        }
        return instance;
    }

    /**
     * Creates a PlaneDragGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param dragPlaneNormal The axis normal to which the gizmo will be able to drag on
     * @param color The color of the gizmo
     */
    constructor(dragPlaneNormal: BABYLON.Vector3, color: BABYLON.Color3 = BABYLON.Color3.Gray(), gizmoLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultUtilityLayer, parent: Nullable<PositionGizmo> = null) {
        super(gizmoLayer);
        this._parent = parent;
        // Create Material
        this._coloredMaterial = new BABYLON.StandardMaterial("", gizmoLayer.utilityLayerScene);
        this._coloredMaterial.diffuseColor = color;
        this._coloredMaterial.specularColor = color.subtract(new BABYLON.Color3(0.1, 0.1, 0.1));
        this._coloredMaterial.alpha = 0.5;

        this._hoverMaterial = new BABYLON.StandardMaterial("", gizmoLayer.utilityLayerScene);
        this._hoverMaterial.diffuseColor = color.add(new BABYLON.Color3(0.3, 0.3, 0.3));
        this._hoverMaterial.alpha = 0.4;

        // Build plane mesh on root node
        this._plane = PlaneDragGizmo._CreatePlane(gizmoLayer.utilityLayerScene, this._coloredMaterial);

        this._plane.lookAt(this._rootMesh.position.add(dragPlaneNormal));
        this._plane.scaling.scaleInPlace(1 / 6);
        this._plane.parent = this._rootMesh;
        
        if(dragPlaneNormal.x > 0) {
            this._plane.position = new BABYLON.Vector3(0, .1375 / 12, .1375 / 12);
        } else if(dragPlaneNormal.y > 0) {
            this._plane.position = new BABYLON.Vector3(.1375 / 12, 0, .1375 / 12);
        } else {
            this._plane.position = new BABYLON.Vector3(.1375 / 12, .1375 / 12, 0);
        }

        var currentSnapDragDistance = 0;
        var tmpVector = new BABYLON.Vector3();
        var tmpSnapEvent = { snapDistance: 0 };
        // Add dragPlaneNormal drag behavior to handle events when the gizmo is dragged
        this.dragBehavior = new BABYLON.PointerDragBehavior({ dragPlaneNormal: dragPlaneNormal });
        this.dragBehavior.moveAttached = false;
        this._rootMesh.addBehavior(this.dragBehavior);

        var localDelta = new BABYLON.Vector3();
        var tmpMatrix = new BABYLON.Matrix();
        this.dragBehavior.onDragObservable.add((event) => {
            if (this.attachedNode) {
                // Convert delta to local translation if it has a parent
                if (this.attachedNode.parent) {
                    this.attachedNode.parent.computeWorldMatrix().invertToRef(tmpMatrix);
                    tmpMatrix.setTranslationFromFloats(0, 0, 0);
                    BABYLON.Vector3.TransformCoordinatesToRef(event.delta, tmpMatrix, localDelta);
                } else {
                    localDelta.copyFrom(event.delta);
                }
                // Snapping logic
                if (this.snapDistance == 0) {
                    this.attachedNode.getWorldMatrix().addTranslationFromFloats(localDelta.x, localDelta.y, localDelta.z);
                } else {
                    currentSnapDragDistance += event.dragDistance;
                    if (Math.abs(currentSnapDragDistance) > this.snapDistance) {
                        var dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / this.snapDistance);
                        currentSnapDragDistance = currentSnapDragDistance % this.snapDistance;
                        localDelta.normalizeToRef(tmpVector);
                        tmpVector.scaleInPlace(this.snapDistance * dragSteps);
                        this.attachedNode.getWorldMatrix().addTranslationFromFloats(tmpVector.x, tmpVector.y, tmpVector.z);
                        tmpSnapEvent.snapDistance = this.snapDistance * dragSteps;
                        this.onSnapObservable.notifyObservers(tmpSnapEvent);
                    }
                }
                this._operationType = 'plane';
                this._matrixChanged();
            }
        });

        this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add((pointerInfo) => {
            if (this._customMeshSet) {
                return;
            }
            var isHovered = pointerInfo.pickInfo && (this._rootMesh.getChildMeshes().indexOf(<BABYLON.Mesh>pointerInfo.pickInfo.pickedMesh) != -1);
            var material = isHovered ? this._hoverMaterial : this._coloredMaterial;
            this._rootMesh.getChildMeshes().forEach((m) => {
                m.material = material;
            });
        });

        var light = gizmoLayer._getSharedGizmoLight();
        light.includedOnlyMeshes = light.includedOnlyMeshes.concat(this._rootMesh.getChildMeshes(false));
    }
    protected _attachedNodeChanged(value: Nullable<BABYLON.Node>) {
        if (this.dragBehavior) {
            this.dragBehavior.enabled = value ? true : false;
        }
    }

    /**
     * If the gizmo is enabled
     */
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        if (!value) {
            this.attachedNode = null;
        }
        else {
            if (this._parent) {
                this.attachedNode = this._parent.attachedNode;
            }
        }
    }
    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    /**
     * Disposes of the gizmo
     */
    public dispose() {
        this.onSnapObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this.dragBehavior.detach();
        super.dispose();
        if (this._plane) {
            this._plane.dispose();
        }
        [this._coloredMaterial, this._hoverMaterial].forEach((matl) => {
            if (matl) {
                matl.dispose();
            }
        });
    }
}