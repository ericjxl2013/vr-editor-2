import { Observer } from "../../lib";
import { GizmoManager } from ".";
import { Tools } from "../utility";
import { VeryCamera, VeryLight } from "../middleware";
import { CameraGizmo } from "./cameraGizmo";

export class GizmosCenter {

    public static mode: number = 0;
    public static gizmoManager: GizmoManager;

    public static currentItems: Observer[] = [];
    public static currentEvents: EventHandle[] = [];


    public constructor() {

    }

    public static init(scene: BABYLON.Scene) {
        GizmosCenter.gizmoManager = new GizmoManager(scene);
        GizmosCenter.gizmoManager.positionGizmoEnabled = true;
        GizmosCenter.gizmoManager.rotationGizmoEnabled = true;
        GizmosCenter.gizmoManager.scaleGizmoEnabled = true;
        GizmosCenter.gizmoManager.gizmos.positionGizmo!.scaleRatio = 1.5;
        GizmosCenter.gizmoManager.gizmos.rotationGizmo!.scaleRatio = 1.5;
        GizmosCenter.gizmoManager.gizmos.scaleGizmo!.scaleRatio = 1.5;
        GizmosCenter.gizmoManager.positionGizmoEnabled = false;
        GizmosCenter.gizmoManager.rotationGizmoEnabled = false;
        GizmosCenter.gizmoManager.scaleGizmoEnabled = false;

        let lastCameraGizmo: Nullable<CameraGizmo> = null;

        editor.on('selector:change', (type: string, items: Observer[]) => {
            GizmosCenter.clear();
            if (type === 'entity') {
                if (items && items.length === 0) {
                    return;
                }
                let node;
                if (items.length === 1) {
                    node = items[0].node;
                    // GizmosCenter.attach(node);
                } else {
                    // 创建一个空物体作为所有物体的父物体；
                    // 记录原始父物体；
                    node = items[items.length - 1].node;
                }
                if(node instanceof BABYLON.Node) {
                    GizmosCenter.attach(node);
                } else {
                    GizmosCenter.attach(null);
                    return;
                }
                // Camera Gizmo处理
                if (node && node instanceof VeryCamera) {
                    let tempGizmo = editor.call('gizmo:get', node.id);
                    if (tempGizmo === lastCameraGizmo) {
                        return;
                    } else {
                        if (lastCameraGizmo) {
                            lastCameraGizmo.displayFrustum = false;
                            lastCameraGizmo = null;
                        }
                    }
                    if (tempGizmo && tempGizmo instanceof CameraGizmo) {
                        tempGizmo.displayFrustum = true;
                        lastCameraGizmo = tempGizmo;
                    }
                } else {
                    if (lastCameraGizmo) {
                        lastCameraGizmo.displayFrustum = false;
                        lastCameraGizmo = null;
                    }
                }
                this.currentItems = items;
                for (let i = 0; i < this.currentItems.length; i++) {
                    this.currentEvents.push(this.currentItems[i].on('position:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('position.0:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('position.1:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('position.2:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('rotation:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('rotation.0:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('rotation.1:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('rotation.2:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('scale:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('scale.0:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('scale.1:set', (val: any) => { }));
                    this.currentEvents.push(this.currentItems[i].on('scale.2:set', (val: any) => { }));
                }
            }
        });



    }

    public static setMode(m: number): void {
        this.mode = m;
        if (this.mode == 0) {
            this.gizmoManager.positionGizmoEnabled = true;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = false;
        } else if (this.mode === 1) {
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = true;
            this.gizmoManager.scaleGizmoEnabled = false;
        } else {
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = true;
        }
    }

    public static attach(mesh: Nullable<BABYLON.Node>): void {
        // if (mesh instanceof VeryLight) {
        //     this.gizmoManager.attachToNode(mesh.light);
        // }
        // else 
        if (mesh instanceof BABYLON.AbstractMesh) {
            this.gizmoManager.attachToMesh(mesh);
        } else {
            this.gizmoManager.attachToNode(mesh);
        }

        this.setMode(this.mode);
    }


    public static setPosition(pos: BABYLON.Vector3): void {
        if (this.currentItems) {
            if (this.currentItems.length === 1) {
                this.currentItems[0].set('position.0', pos.x);
                this.currentItems[0].set('position.1', pos.y);
                this.currentItems[0].set('position.2', pos.z);
            } else {
                // TODO
                this.currentItems[this.currentItems.length - 1].set('position.0', pos.x);
                this.currentItems[this.currentItems.length - 1].set('position.1', pos.y);
                this.currentItems[this.currentItems.length - 1].set('position.2', pos.z);
            }
        }
    }

    public static setRotation(rotation: BABYLON.Vector3): void {
        let eulerAngle = Tools.radianToEulerAngle(rotation);
        if (this.currentItems) {
            if (this.currentItems.length === 1) {
                this.currentItems[0].set('rotation.0', eulerAngle.x);
                this.currentItems[0].set('rotation.1', eulerAngle.y);
                this.currentItems[0].set('rotation.2', eulerAngle.z);
            } else {
                // TODO
                this.currentItems[this.currentItems.length - 1].set('rotation.0', eulerAngle.x);
                this.currentItems[this.currentItems.length - 1].set('rotation.1', eulerAngle.y);
                this.currentItems[this.currentItems.length - 1].set('rotation.2', eulerAngle.z);
            }
        }
    }

    public static setScale(scale: BABYLON.Vector3): void {
        if (this.currentItems) {
            if (this.currentItems.length === 1) {
                this.currentItems[0].set('scale.0', scale.x);
                this.currentItems[0].set('scale.1', scale.y);
                this.currentItems[0].set('scale.2', scale.z);
            } else {
                // TODO
                this.currentItems[this.currentItems.length - 1].set('scale.0', scale.x);
                this.currentItems[this.currentItems.length - 1].set('scale.1', scale.y);
                this.currentItems[this.currentItems.length - 1].set('scale.2', scale.z);
            }
        }
    }

    public static clear(): void {
        this.gizmoManager.attachToMesh(null);
        if (this.currentEvents && this.currentEvents.length > 0) {
            for (let i = 0; i < this.currentEvents.length; i++)
                this.currentEvents[i].unbind();
        }
        this.currentEvents = [];
        this.currentItems = [];
    }



}