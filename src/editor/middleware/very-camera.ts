import { VeryEngine } from "../../engine";
import { Config } from "../global";
import { Tools } from "../utility";
import { Viewport } from "../viewport";


export class VeryCamera extends BABYLON.TransformNode {

    private _canvas: HTMLCanvasElement;
    private _width: number;
    private _height: number;

    public get mode(): number {
        return this.camera.mode;
    }
    public set mode(val: number) {
        this.camera.mode = val;
        if (val === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            this.orthoSize = this._orthoSize;
        }
    }

    public get fov(): number {
        return this.camera.fov;
    }
    public set fov(val: number) {
        // this.camera.fov = Tools.eulerAngleFloatToRadian(val);
        this.camera.fov = val;
    }

    public get inertia(): number {
        return this.camera.inertia;
    }
    public set inertia(val: number) {
        this.camera.inertia = val;
    }

    private _orthoSize: number = 0;
    public get orthoSize(): number {
        if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            this._orthoSize = this.camera!.orthoRight! / this._scene.getEngine().getRenderWidth() / this.camera.viewport.width;
            return this._orthoSize;
        } else {
            return 0;
        }
    }
    public set orthoSize(val: number) {
        this._orthoSize = val;
        if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            this.camera.orthoRight = val * this._scene.getEngine().getRenderWidth() * this.camera.viewport.width;
            this.camera.orthoLeft = -val * this._scene.getEngine().getRenderWidth() * this.camera.viewport.width;
            this.camera.orthoTop = val * this._scene.getEngine().getRenderHeight() * this.camera.viewport.height;
            this.camera.orthoBottom = -val * this._scene.getEngine().getRenderHeight() * this.camera.viewport.height;
        }
    }

    private _clearColor: Nullable<BABYLON.Color4> = null;
    public get clearColor(): Nullable<BABYLON.Color4> {
        return this._clearColor;
    }
    public set clearColor(val: Nullable<BABYLON.Color4>) {
        this._clearColor = val;
    }

    public get minZ(): number {
        return this.camera.minZ;
    }
    public set minZ(val: number) {
        this.camera.minZ = val;
    }

    public get maxZ(): number {
        return this.camera.minZ;
    }
    public set maxZ(val: number) {
        this.camera.maxZ = val;
    }

    public get checkCollisions(): boolean {
        return (<BABYLON.FreeCamera>this.camera).checkCollisions;
    }
    public set checkCollisions(val: boolean) {
        (<BABYLON.FreeCamera>this.camera).checkCollisions = val;
    }

    public get applyGravity(): boolean {
        return (<BABYLON.FreeCamera>this.camera).applyGravity;
    }
    public set applyGravity(val: boolean) {
        (<BABYLON.FreeCamera>this.camera).applyGravity = val;
    }
    

    public camera: BABYLON.TargetCamera;

    // public get mode()

    public constructor(camera: BABYLON.TargetCamera, scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        super(camera.name, scene);
        this.camera = camera;
        camera.name += '-Camera';
        this._canvas = canvas;
        this._width = canvas.width;
        this._height = canvas.height;
        this.position.copyFrom(camera.position);
        this.rotation.copyFrom(camera.rotation);
        camera.parent = this;
        camera.position = BABYLON.Vector3.Zero();
        camera.rotation = BABYLON.Vector3.Zero();
        camera.inputs.clear();


    }

    private _backupViewport: BABYLON.Viewport = new BABYLON.Viewport(0, 0, 1, 1);
    private _render: boolean = true;
    public renderCamera(render: boolean): void {
        if (this._render === render) return;
        this._render = render;
        if (render) {
            this.camera.viewport = this._backupViewport.clone();
        } else {
            this._backupViewport = this.camera.viewport.clone();
            this.camera.viewport = new BABYLON.Viewport(0, 0, 0, 0);
        }
    }

    // orthographic相机在窗口resize后需要刷新；
    public resize(editor?: boolean): void {
        if (this.camera && this._canvas) {
            if (this._canvas.width !== this._width || this._canvas.height !== this._height) {

                this._width = this._canvas.width;
                this._height = this._canvas.height;

                let w = this._scene.getEngine().getRenderWidth();
                let h = this._scene.getEngine().getRenderHeight();

                if (editor) {
                    if (this !== VeryEngine.viewCamera) {
                        if (this._render) {
                            this.camera.viewport = new BABYLON.Viewport(Config.x / w, (h - Config.y) / h, Config.width / w, Config.height / h);
                        } else {
                            this._backupViewport = new BABYLON.Viewport(Config.x / w, (h - Config.y) / h, Config.width / w, Config.height / h);
                        }
                        // console.warn(this.camera.viewport);
                    }
                }

                if (this.camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                    this.camera.orthoRight = this._orthoSize * w * this.camera.viewport.width;
                    this.camera.orthoLeft = -this._orthoSize * w * this.camera.viewport.width;
                    this.camera.orthoTop = this._orthoSize * h * this.camera.viewport.height;
                    this.camera.orthoBottom = -this._orthoSize * h * this.camera.viewport.height;
                } else {

                }

                // console.log('设置ortho参数: ' + this._orthoSize);
                // console.warn(this.camera.viewport);
            }

        }
    }

}