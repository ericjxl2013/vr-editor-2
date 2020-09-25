// import { Observer } from "../Misc/observable";
// import { Nullable } from "../types";
// import { WebVRFreeCamera } from "../Cameras/VR/webVRCamera";
// import { Scene, IDisposable } from "../scene";
// import { Quaternion, Vector3, Matrix } from "../Maths/math.vector";
// import { AbstractMesh } from "../Meshes/abstractMesh";
// import { Mesh } from "../Meshes/mesh";
// import { Camera } from "../Cameras/camera";
// import { TargetCamera } from "../Cameras/targetCamera";
// import { Node } from "../node";
// import { Bone } from "../Bones/bone";
// import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
// import { TransformNode } from '../Meshes/transformNode';

import { GizmosCenter } from ".";
import { UtilityLayerRenderer } from "./UtilityLayerRenderer";


/**
 * Renders gizmos on top of an existing scene which provide controls for position, rotation, etc.
 */
export class Gizmo implements BABYLON.IDisposable {
    /**
     * The root mesh of the gizmo
     */
    public _rootMesh: BABYLON.Mesh;
    private _attachedMesh: Nullable<BABYLON.AbstractMesh> = null;
    private _attachedNode: Nullable<BABYLON.Node> = null;

    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    protected _scaleRatio = 1;

    protected _operationType: string = '';

    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    public set scaleRatio(value: number) {
        this._scaleRatio = value;
    }

    public get scaleRatio() {
        return this._scaleRatio;
    }
    /**
     * If a custom mesh has been set (Default: false)
     */
    protected _customMeshSet = false;
    /**
     * Mesh that the gizmo will be attached to. (eg. on a drag gizmo the mesh that will be dragged)
     * * When set, interactions will be enabled
     */
    public get attachedMesh() {
        return this._attachedMesh;
    }
    public set attachedMesh(value: Nullable<BABYLON.AbstractMesh>) {
        this._attachedMesh = value;
        if (value) {
            this._attachedNode = value;
        }
        this._rootMesh.setEnabled(value ? true : false);
        this._attachedNodeChanged(value);
    }
    /**
     * Node that the gizmo will be attached to. (eg. on a drag gizmo the mesh, bone or NodeTransform that will be dragged)
     * * When set, interactions will be enabled
     */
    public get attachedNode() {
        return this._attachedNode;
    }
    public set attachedNode(value: Nullable<BABYLON.Node>) {
        this._attachedNode = value;
        this._attachedMesh = null;
        this._rootMesh.setEnabled(value ? true : false);
        this._attachedNodeChanged(value);
    }

    /**
     * Disposes and replaces the current meshes in the gizmo with the specified mesh
     * @param mesh The mesh to replace the default mesh of the gizmo
     */
    public setCustomMesh(mesh: BABYLON.Mesh) {
        if (mesh.getScene() != this.gizmoLayer.utilityLayerScene) {
            throw "When setting a custom mesh on a gizmo, the custom meshes scene must be the same as the gizmos (eg. gizmo.gizmoLayer.utilityLayerScene)";
        }
        this._rootMesh.getChildMeshes().forEach((c) => {
            c.dispose();
        });
        mesh.parent = this._rootMesh;
        this._customMeshSet = true;
    }

    protected _updateGizmoRotationToMatchAttachedMesh = true;

    /**
     * If set the gizmo's rotation will be updated to match the attached mesh each frame (Default: true)
     */
    public set updateGizmoRotationToMatchAttachedMesh(value: boolean) {
        this._updateGizmoRotationToMatchAttachedMesh = value;
    }
    public get updateGizmoRotationToMatchAttachedMesh() {
        return this._updateGizmoRotationToMatchAttachedMesh;
    }
    /**
     * If set the gizmo's position will be updated to match the attached mesh each frame (Default: true)
     */
    public updateGizmoPositionToMatchAttachedMesh = true;
    /**
     * When set, the gizmo will always appear the same size no matter where the camera is (default: true)
     */
    public updateScale = true;
    protected _interactionsEnabled = true;
    protected _attachedNodeChanged(value: Nullable<BABYLON.Node>) {
    }

    private _beforeRenderObserver: Nullable<BABYLON.Observer<BABYLON.Scene>>;
    private _tempQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
    private _tempVector = new BABYLON.Vector3();
    private _tempVector2 = new BABYLON.Vector3();
    private _tempMatrix1 = new BABYLON.Matrix();
    private _tempMatrix2 = new BABYLON.Matrix();
    private _rightHandtoLeftHandMatrix = BABYLON.Matrix.RotationY(Math.PI);

    /**
     * Creates a gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(
        /** The utility layer the gizmo will be added to */
        public gizmoLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultUtilityLayer) {

        this._rootMesh = new BABYLON.Mesh("gizmoRootNode", gizmoLayer.utilityLayerScene);
        this._rootMesh.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._beforeRenderObserver = this.gizmoLayer.utilityLayerScene.onBeforeRenderObservable.add(() => {
            this._update();
        });
    }

    /**
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    protected _update() {
        if (this.attachedNode) {
            var effectiveNode = this.attachedNode;
            if (this.attachedMesh) {
                effectiveNode = this.attachedMesh._effectiveMesh || this.attachedNode;
            }

            // Position
            if (this.updateGizmoPositionToMatchAttachedMesh) {
                const row = effectiveNode.getWorldMatrix().getRow(3);
                const position = row ? row.toVector3() : new BABYLON.Vector3(0, 0, 0);
                this._rootMesh.position.copyFrom(position);
            }

            // Rotation
            if (this.updateGizmoRotationToMatchAttachedMesh) {
                effectiveNode.getWorldMatrix().decompose(undefined, this._rootMesh.rotationQuaternion!);
            }
            else {
                if (this._rootMesh.rotationQuaternion) {
                    this._rootMesh.rotationQuaternion!.set(0, 0, 0, 1);
                } else {
                    this._rootMesh.rotation = BABYLON.Vector3.Zero();
                }
            }

            // Scale
            if (this.updateScale) {
                const activeCamera = this.gizmoLayer.utilityLayerScene.activeCamera!;
                var cameraPosition = activeCamera.globalPosition;
                if ((<BABYLON.WebVRFreeCamera>activeCamera).devicePosition) {
                    cameraPosition = (<BABYLON.WebVRFreeCamera>activeCamera).devicePosition;
                }
                if (activeCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
                    this._rootMesh.position.subtractToRef(cameraPosition, this._tempVector);
                    var dist = this._tempVector.length() * this.scaleRatio;
                    this._rootMesh.scaling.set(dist, dist, dist);
                } else {
                    // 正交相机比例处理
                    let rate = this.scaleRatio * 600;
                    let ortho: number;
                    if (activeCamera.orthoRight) {
                        ortho = activeCamera.orthoRight / this.gizmoLayer.utilityLayerScene.getEngine().getRenderWidth();
                    } else {
                        ortho = 1;
                    }
                    rate *= 2.2 * ortho;
                    this._rootMesh.scaling.set(rate, rate, rate);
                }

                // Account for handedness, similar to Matrix.decompose
                if (effectiveNode._getWorldMatrixDeterminant() < 0) {
                    this._rootMesh.scaling.y *= -1;
                }
            } else {
                this._rootMesh.scaling.setAll(this.scaleRatio);
            }
        }
    }

    /**
     * computes the rotation/scaling/position of the transform once the Node world matrix has changed.
     * @param value Node, TransformNode or mesh
     */
    protected _matrixChanged() {
        if (!this._attachedNode) {
            return;
        }

        if ((<BABYLON.Camera>this._attachedNode)._isCamera) {
            var camera = this._attachedNode as BABYLON.Camera;
            var worldMatrix;
            var worldMatrixUC;
            if (camera.parent) {
                var parentInv = this._tempMatrix2;
                camera.parent._worldMatrix.invertToRef(parentInv);
                this._attachedNode._worldMatrix.multiplyToRef(parentInv, this._tempMatrix1);
                worldMatrix = this._tempMatrix1;
            } else {
                worldMatrix = this._attachedNode._worldMatrix;
            }

            if (camera.getScene().useRightHandedSystem) {
                // avoid desync with RH matrix computation. Otherwise, rotation of PI around Y axis happens each frame resulting in axis flipped because worldMatrix is computed as inverse of viewMatrix.
                this._rightHandtoLeftHandMatrix.multiplyToRef(worldMatrix, this._tempMatrix2);
                worldMatrixUC = this._tempMatrix2;
            } else {
                worldMatrixUC = worldMatrix;
            }

            worldMatrixUC.decompose(this._tempVector2, this._tempQuaternion, this._tempVector);

            var inheritsTargetCamera = this._attachedNode.getClassName() === "FreeCamera"
                || this._attachedNode.getClassName() === "FlyCamera"
                || this._attachedNode.getClassName() === "ArcFollowCamera"
                || this._attachedNode.getClassName() === "TargetCamera"
                || this._attachedNode.getClassName() === "TouchCamera"
                || this._attachedNode.getClassName() === "UniversalCamera";

            if (inheritsTargetCamera) {
                var targetCamera = this._attachedNode as BABYLON.TargetCamera;
                targetCamera.rotation = this._tempQuaternion.toEulerAngles();

                if (targetCamera.rotationQuaternion) {
                    targetCamera.rotationQuaternion.copyFrom(this._tempQuaternion);
                }
            }

            camera.position.copyFrom(this._tempVector);
        } else if ((<BABYLON.Mesh>this._attachedNode)._isMesh || this._attachedNode.getClassName() === "AbstractMesh" || this._attachedNode.getClassName() === "TransformNode" || this._attachedNode.getClassName() === "InstancedMesh") {
            var transform = this._attachedNode as BABYLON.TransformNode;
            if (transform.parent) {
                var parentInv = this._tempMatrix1;
                var localMat = this._tempMatrix2;
                transform.parent.getWorldMatrix().invertToRef(parentInv);
                this._attachedNode._worldMatrix.multiplyToRef(parentInv, localMat);
                localMat.decompose(transform.scaling, this._tempQuaternion, transform.position);
            } else {
                this._attachedNode._worldMatrix.decompose(transform.scaling, this._tempQuaternion, transform.position);
            }
            if (transform.rotationQuaternion) {
                transform.rotationQuaternion.copyFrom(this._tempQuaternion);
            } else {
                transform.rotation = this._tempQuaternion.toEulerAngles();
            }
            // console.warn(this._operationType);
            if (this._operationType === 'translate' || this._operationType === 'plane') {
                GizmosCenter.setPosition(transform.position);
            } else if (this._operationType === 'rotate') {
                GizmosCenter.setRotation(transform.rotation);
            } else if (this._operationType === 'scale') {

            }
        } else if (this._attachedNode.getClassName() === "Bone") {
            var bone = this._attachedNode as BABYLON.Bone;
            const parent = bone.getParent();

            if (parent) {
                var invParent = this._tempMatrix1;
                var boneLocalMatrix = this._tempMatrix2;
                parent.getWorldMatrix().invertToRef(invParent);
                bone.getWorldMatrix().multiplyToRef(invParent, boneLocalMatrix);
                var lmat = bone.getLocalMatrix();
                lmat.copyFrom(boneLocalMatrix);
                bone.markAsDirty();
            }
        }
    }

    /**
     * Disposes of the gizmo
     */
    public dispose() {
        this._rootMesh.dispose();
        if (this._beforeRenderObserver) {
            this.gizmoLayer.utilityLayerScene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
        }
    }
}