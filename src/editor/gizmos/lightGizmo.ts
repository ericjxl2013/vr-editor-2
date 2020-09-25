import { VeryLight } from "../middleware";
import { Tools } from "../utility";
// import { Nullable } from "../types";
// import { Vector3, Quaternion } from "../Maths/math.vector";
// import { Color3 } from '../Maths/math.color';
// import { AbstractMesh } from "../Meshes/abstractMesh";
// import { Mesh } from "../Meshes/mesh";
import { Gizmo } from "./gizmo";
import { UtilityLayerRenderer } from "./UtilityLayerRenderer";
// import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";

// import { StandardMaterial } from '../Materials/standardMaterial';
// import { Light } from '../Lights/light';
// import { Scene } from '../scene';
// import { HemisphericLight } from '../Lights/hemisphericLight';
// import { DirectionalLight } from '../Lights/directionalLight';
// import { SphereBuilder } from '../Meshes/Builders/sphereBuilder';
// import { HemisphereBuilder } from '../Meshes/Builders/hemisphereBuilder';
// import { SpotLight } from '../Lights/spotLight';
// import { TransformNode } from '../Meshes/transformNode';
// import { PointerEventTypes, PointerInfo } from '../Events/pointerEvents';
// import { Observer, Observable } from "../Misc/observable";

/**
 * Gizmo that enables viewing a light
 */
export class LightGizmo extends Gizmo {
    private _lightMesh!: BABYLON.Mesh;
    private _material: BABYLON.StandardMaterial;
    private _cachedPosition = new BABYLON.Vector3();
    private _cachedForward = new BABYLON.Vector3(0, 0, 1);
    private _attachedMeshParent: BABYLON.TransformNode;
    private _pointerObserver: Nullable<BABYLON.Observer<BABYLON.PointerInfo>> = null;

    /**
     * Event that fires each time the gizmo is clicked
     */
    public onClickedObservable = new BABYLON.Observable<BABYLON.Light>();

    /**
     * Creates a LightGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(gizmoLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultUtilityLayer) {
        super(gizmoLayer);
        this.attachedMesh = new BABYLON.AbstractMesh("", this.gizmoLayer.utilityLayerScene);
        this._attachedMeshParent = new BABYLON.TransformNode("parent", this.gizmoLayer.utilityLayerScene);

        this.attachedMesh.parent = this._attachedMeshParent;
        this._material = new BABYLON.StandardMaterial("light", this.gizmoLayer.utilityLayerScene);
        this._material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this._material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add((pointerInfo) => {
            if (!this._light) {
                return;
            }

            var isHovered = pointerInfo.pickInfo && (this._rootMesh.getChildMeshes().indexOf(<BABYLON.Mesh>pointerInfo.pickInfo.pickedMesh) != -1);
            if (isHovered && pointerInfo.event.button === 0) {
                // console.warn('pick light: ' + this._light.name);
                // 选择到light父物体
                if (this._light.parent && this._light.parent instanceof VeryLight) {
                    var entity = editor.call('entities:get', this._light.parent.id);
                    // console.error(entity);
                    if (entity) {
                        editor.call('selector:set', 'entity', [entity]);
                    } else {
                        console.error('失败');
                    }
                }
                this.onClickedObservable.notifyObservers(this._light);
            }
        }, BABYLON.PointerEventTypes.POINTERDOWN);
    }
    private _light: Nullable<BABYLON.Light> = null;

    /**
     * The light that the gizmo is attached to
     */
    public set light(light: Nullable<BABYLON.Light>) {
        this._light = light;
        if (light) {
            // Create the mesh for the given light type
            if (this._lightMesh) {
                this._lightMesh.dispose();
            }

            if (light instanceof BABYLON.HemisphericLight) {
                this._lightMesh = LightGizmo._CreateHemisphericLightMesh(this.gizmoLayer.utilityLayerScene);
            } else if (light instanceof BABYLON.DirectionalLight) {
                this._lightMesh = LightGizmo._CreateDirectionalLightMesh(this.gizmoLayer.utilityLayerScene);
            } else if (light instanceof BABYLON.SpotLight) {
                this._lightMesh = LightGizmo._CreateSpotLightMesh(this.gizmoLayer.utilityLayerScene);
            } else {
                this._lightMesh = LightGizmo._CreatePointLightMesh(this.gizmoLayer.utilityLayerScene);
            }
            this._lightMesh.getChildMeshes(false).forEach((m) => {
                m.material = this._material;
            });
            this._lightMesh.parent = this._rootMesh;

            // Add lighting to the light gizmo
            var gizmoLight = this.gizmoLayer._getSharedGizmoLight();
            gizmoLight.includedOnlyMeshes = gizmoLight.includedOnlyMeshes.concat(this._lightMesh.getChildMeshes(false));

            this._lightMesh.rotationQuaternion = new BABYLON.Quaternion();

            if (!this.attachedMesh!.reservedDataStore) {
                this.attachedMesh!.reservedDataStore = {};
            }
            this.attachedMesh!.reservedDataStore.lightGizmo = this;

            if (light.parent) {
                // this._attachedMeshParent.freezeWorldMatrix(light.parent.getWorldMatrix());
                this._attachedMeshParent.freezeWorldMatrix();
            }



            if (light.parent && light.parent instanceof VeryLight) {
                if (light instanceof BABYLON.HemisphericLight) {
                    this.attachedMesh!.position.copyFrom(light.parent.position);
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedPosition.copyFrom(this.attachedMesh!.position);

                    let newDirection = Tools.transformLocalToWorldDirection(light.parent, BABYLON.Vector3.Down());
                    // this.attachedMesh!.setDirection((light as any).direction);
                    this.attachedMesh!.setDirection(newDirection);
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedForward.copyFrom(this.attachedMesh!.forward);

                } else {
                    if ((light as any).position) {
                        this.attachedMesh!.position.copyFrom(light.parent.position);
                        this.attachedMesh!.computeWorldMatrix(true);
                        this._cachedPosition.copyFrom(this.attachedMesh!.position);
                    }

                    if ((light as any).direction) {
                        let newDirection = Tools.transformLocalToWorldDirection(light, (light as any).direction);
                        // this.attachedMesh!.setDirection((light as any).direction);
                        this.attachedMesh!.setDirection(newDirection);
                        this.attachedMesh!.computeWorldMatrix(true);
                        this._cachedForward.copyFrom(this.attachedMesh!.forward);
                    }
                }
            } else {
                // Get update position and direction if the light has it
                if ((light as any).position) {
                    this.attachedMesh!.position.copyFrom((light as any).position);
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedPosition.copyFrom(this.attachedMesh!.position);
                }

                if ((light as any).direction) {
                    this.attachedMesh!.setDirection((light as any).direction);
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedForward.copyFrom(this.attachedMesh!.forward);
                }
            }


            this._update();
        }
    }
    public get light() {
        return this._light;
    }

    /**
     * Gets the material used to render the light gizmo
     */
    public get material() {
        return this._material;
    }

    /**
     * @hidden
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    protected _update() {
        super._update();
        if (!this._light) {
            return;
        }

        if (this._light.parent) {
            // this._attachedMeshParent.freezeWorldMatrix(this._light.parent.getWorldMatrix());
            this._attachedMeshParent.freezeWorldMatrix();
        }



        // 更改light rotation
        if (this._light.parent && this._light.parent instanceof VeryLight) {

            if (this._light instanceof BABYLON.HemisphericLight) {

                // If the gizmo is moved update the light otherwise update the gizmo to match the light
                if (!this.attachedMesh!.position.equals(this._cachedPosition)) {
                    // update light to match gizmo
                    this._light.parent.position.copyFrom(this.attachedMesh!.position);
                    this._cachedPosition.copyFrom(this.attachedMesh!.position);
                } else {
                    // update gizmo to match light
                    this.attachedMesh!.position.copyFrom(this._light.parent.position);
                    // console.log((this._light as any).getAbsolutePosition());
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedPosition.copyFrom(this.attachedMesh!.position);
                }

                let newDirection = Tools.transformLocalToWorldDirection(this._light.parent, BABYLON.Vector3.Up());
                
                // If the gizmo is moved update the light otherwise update the gizmo to match the light
                if (BABYLON.Vector3.DistanceSquared(this.attachedMesh!.forward, this._cachedForward) > 0.0001) {
                    // update light to match gizmo
                    // TODO
                    // newDirection.copyFrom(this.attachedMesh!.forward);
                    // (<BABYLON.HemisphericLight>this.light).direction.copyFrom(newDirection);
                    this._cachedForward.copyFrom(this.attachedMesh!.forward);
                } else if (BABYLON.Vector3.DistanceSquared(this.attachedMesh!.forward, newDirection) > 0.0001) {
                    // console.log('hemi');
                    // update gizmo to match light
                    this.attachedMesh!.setDirection(newDirection);
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedForward.copyFrom(this.attachedMesh!.forward);
                    (<BABYLON.HemisphericLight>this.light).direction.copyFrom(this._light.parent.up);
                }
            } else {
                if ((this._light as any).position) {
                    // If the gizmo is moved update the light otherwise update the gizmo to match the light
                    if (!this.attachedMesh!.position.equals(this._cachedPosition)) {
                        // update light to match gizmo
                        (this._light as any).position.copyFrom(this.attachedMesh!.position);
                        this._cachedPosition.copyFrom(this.attachedMesh!.position);
                    } else {
                        // update gizmo to match light
                        this.attachedMesh!.position.copyFrom(this._light.parent.position);
                        // console.log((this._light as any).getAbsolutePosition());
                        this.attachedMesh!.computeWorldMatrix(true);
                        this._cachedPosition.copyFrom(this.attachedMesh!.position);
                    }
                }

                // console.log((this._light as any).direction);
                if ((this._light as any).direction) {
                    let newDirection = Tools.transformLocalToWorldDirection(this._light, (this._light as any).direction);
                    // If the gizmo is moved update the light otherwise update the gizmo to match the light
                    if (BABYLON.Vector3.DistanceSquared(this.attachedMesh!.forward, this._cachedForward) > 0.0001) {
                        console.log('light');
                        // update light to match gizmo
                        newDirection.copyFrom(this.attachedMesh!.forward);
                        this._cachedForward.copyFrom(this.attachedMesh!.forward);
                    } else if (BABYLON.Vector3.DistanceSquared(this.attachedMesh!.forward, newDirection) > 0.0001) {
                        // update gizmo to match light
                        this.attachedMesh!.setDirection(newDirection);
                        this.attachedMesh!.computeWorldMatrix(true);
                        this._cachedForward.copyFrom(this.attachedMesh!.forward);
                    }
                }
            }

        } else {
            if ((this._light as any).position) {
                // If the gizmo is moved update the light otherwise update the gizmo to match the light
                if (!this.attachedMesh!.position.equals(this._cachedPosition)) {
                    // update light to match gizmo
                    (this._light as any).position.copyFrom(this.attachedMesh!.position);
                    this._cachedPosition.copyFrom(this.attachedMesh!.position);
                } else {
                    // update gizmo to match light
                    this.attachedMesh!.position.copyFrom((this._light as any).position);
                    // console.log((this._light as any).getAbsolutePosition());
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedPosition.copyFrom(this.attachedMesh!.position);
                }
            }

            if ((this._light as any).direction) {
                // If the gizmo is moved update the light otherwise update the gizmo to match the light
                if (BABYLON.Vector3.DistanceSquared(this.attachedMesh!.forward, this._cachedForward) > 0.0001) {
                    // update light to match gizmo
                    (this._light as any).direction.copyFrom(this.attachedMesh!.forward);
                    this._cachedForward.copyFrom(this.attachedMesh!.forward);
                } else if (BABYLON.Vector3.DistanceSquared(this.attachedMesh!.forward, (this._light as any).direction) > 0.0001) {
                    // update gizmo to match light
                    this.attachedMesh!.setDirection((this._light as any).direction);
                    this.attachedMesh!.computeWorldMatrix(true);
                    this._cachedForward.copyFrom(this.attachedMesh!.forward);
                }
            }
        }
    }

    // Static helper methods
    private static _Scale = 0.007;

    /**
     * Creates the lines for a light mesh
     */
    private static _CreateLightLines = (levels: number, scene: BABYLON.Scene) => {
        var distFromSphere = 1.2;

        var root = new BABYLON.Mesh("root", scene);
        root.rotation.x = Math.PI / 2;

        // Create the top line, this will be cloned for all other lines
        var linePivot = new BABYLON.Mesh("linePivot", scene);
        linePivot.parent = root;
        var line = BABYLON.Mesh.CreateCylinder("line", 2, 0.2, 0.3, 6, 1, scene);
        line.position.y = line.scaling.y / 2 + distFromSphere;
        line.parent = linePivot;

        if (levels < 2) {
            return linePivot;
        }
        for (var i = 0; i < 4; i++) {
            var l = linePivot.clone("lineParentClone")!;
            l.rotation.z = Math.PI / 4;
            l.rotation.y = (Math.PI / 2) + (Math.PI / 2 * i);

            l.getChildMeshes()[0].scaling.y = 0.5;
            l.getChildMeshes()[0].scaling.x = l.getChildMeshes()[0].scaling.z = 0.8;
            l.getChildMeshes()[0].position.y = l.getChildMeshes()[0].scaling.y / 2 + distFromSphere;
        }

        if (levels < 3) {
            return root;
        }
        for (var i = 0; i < 4; i++) {
            var l = linePivot.clone("linePivotClone");
            l.rotation.z = Math.PI / 2;
            l.rotation.y = (Math.PI / 2 * i);
        }

        if (levels < 4) {
            return root;
        }
        for (var i = 0; i < 4; i++) {
            var l = linePivot.clone("linePivotClone");
            l.rotation.z = Math.PI + (Math.PI / 4);
            l.rotation.y = (Math.PI / 2) + (Math.PI / 2 * i);

            l.getChildMeshes()[0].scaling.y = 0.5;
            l.getChildMeshes()[0].scaling.x = l.getChildMeshes()[0].scaling.z = 0.8;
            l.getChildMeshes()[0].position.y = l.getChildMeshes()[0].scaling.y / 2 + distFromSphere;
        }

        if (levels < 5) {
            return root;
        }
        var l = linePivot.clone("linePivotClone");
        l.rotation.z = Math.PI;

        return root;
    }

    /**
     * Disposes of the light gizmo
     */
    public dispose() {
        this.onClickedObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this._material.dispose();
        super.dispose();
        this._attachedMeshParent.dispose();
    }

    private static _CreateHemisphericLightMesh(scene: BABYLON.Scene) {
        var root = new BABYLON.Mesh("hemisphereLight", scene);
        var hemisphere = BABYLON.HemisphereBuilder.CreateHemisphere(root.name, { segments: 10, diameter: 1 }, scene);
        hemisphere.position.z = -0.15;
        hemisphere.rotation.x = Math.PI / 2;
        hemisphere.parent = root;

        var lines = this._CreateLightLines(3, scene);
        lines.parent = root;
        lines.position.z - 0.15;

        root.scaling.scaleInPlace(LightGizmo._Scale);
        root.rotation.x = Math.PI / 2;

        return root;
    }

    private static _CreatePointLightMesh(scene: BABYLON.Scene) {
        var root = new BABYLON.Mesh("pointLight", scene);
        var sphere = BABYLON.SphereBuilder.CreateSphere(root.name, { segments: 10, diameter: 1 }, scene);
        sphere.rotation.x = Math.PI / 2;
        sphere.parent = root;

        var lines = this._CreateLightLines(5, scene);
        lines.parent = root;
        root.scaling.scaleInPlace(LightGizmo._Scale);
        root.rotation.x = Math.PI / 2;

        return root;
    }

    private static _CreateSpotLightMesh(scene: BABYLON.Scene) {
        var root = new BABYLON.Mesh("spotLight", scene);
        var sphere = BABYLON.SphereBuilder.CreateSphere(root.name, { segments: 10, diameter: 1 }, scene);
        sphere.parent = root;

        var hemisphere = BABYLON.HemisphereBuilder.CreateHemisphere(root.name, { segments: 10, diameter: 2 }, scene);
        hemisphere.parent = root;
        hemisphere.rotation.x = -Math.PI / 2;

        var lines = this._CreateLightLines(2, scene);
        lines.parent = root;
        root.scaling.scaleInPlace(LightGizmo._Scale);
        root.rotation.x = Math.PI / 2;

        return root;
    }

    private static _CreateDirectionalLightMesh(scene: BABYLON.Scene) {
        var root = new BABYLON.Mesh("directionalLight", scene);

        var mesh = new BABYLON.Mesh(root.name, scene);
        mesh.parent = root;
        var sphere = BABYLON.SphereBuilder.CreateSphere(root.name, { diameter: 1.2, segments: 10 }, scene);
        sphere.parent = mesh;

        var line = BABYLON.Mesh.CreateCylinder(root.name, 6, 0.3, 0.3, 6, 1, scene);
        line.parent = mesh;

        var left = line.clone(root.name)!;
        left.scaling.y = 0.5;
        left.position.x += 1.25;

        var right = line.clone(root.name)!;
        right.scaling.y = 0.5;
        right.position.x += -1.25;

        var arrowHead = BABYLON.Mesh.CreateCylinder(root.name, 1, 0, 0.6, 6, 1, scene);
        arrowHead.position.y += 3;
        arrowHead.parent = mesh;

        var left = arrowHead.clone(root.name);
        left.position.y = 1.5;
        left.position.x += 1.25;

        var right = arrowHead.clone(root.name);
        right.position.y = 1.5;
        right.position.x += -1.25;

        mesh.scaling.scaleInPlace(LightGizmo._Scale);
        mesh.rotation.z = Math.PI / 2;
        mesh.rotation.y = Math.PI / 2;
        return root;
    }
}