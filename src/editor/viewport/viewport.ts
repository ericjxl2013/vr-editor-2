import { Canvas } from '../../ui';
import { VeryEngine } from '../../engine';
import { ToolbarTopControl } from '../toolbar';
import { ViewportExpand } from './viewport-expand';
import { GizmosCenter } from '../gizmos';
import { Scenes } from '../scenes';
import { VeryCamera } from '../middleware';
import { Tools } from '../utility';

export class Viewport {

    public canvas!: Canvas;

    private _engine!: BABYLON.Engine;
    private _scene!: BABYLON.Scene;
    private _canvas!: HTMLCanvasElement;

    private _camera: VeryCamera;


    public constructor() {

        this.init();

        // console.log(VeryEngine.viewEngine._internalTexturesCache);
        // let tex = VeryEngine.viewEngine.createTexture('static/editor_logo.png', false, true, VeryEngine.viewScene);
        // console.log(VeryEngine.viewEngine._internalTexturesCache);

        let self = this;

        let engine = this._engine;

        // TODO: 设定相机
        // this._scene.clearColor = new BABYLON.Color4(49 / 255, 77 / 255, 121 / 255, 1); 
        // this._scene.clearColor = new BABYLON.Color4(116 / 255, 116 / 255, 116 / 255, 1);
        this._scene.autoClear = false;

        // var camera = new BABYLON.ArcRotateCamera('Default', 100, 50, 50, new BABYLON.Vector3(0, 0, 0), this._scene);
        // camera.setPosition(new BABYLON.Vector3(0, 1, -20));
        // camera.attachControl(this._canvas, true);

        var camera = new BABYLON.UniversalCamera('__viewportCamera__', new BABYLON.Vector3(0, 1, -20), this._scene);
        // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        camera.minZ = -800;
        camera.maxZ = 20000;
        this._scene.cameraToUseForPointers = camera;
        // camera.layerMask = 0x20000000;

        // TODO: 不同相机不同clearColor；
        this._scene.onBeforeCameraRenderObservable.add((c: BABYLON.Camera) => {
            var engine = self._scene.getEngine();
            var w = engine.getRenderWidth();
            var h = engine.getRenderHeight();

            let temp = VeryEngine.getCamera(c);
            if (temp) {
                self._scene.getEngine().enableScissor(temp.camera.viewport.x * w, temp.camera.viewport.y * h, temp.camera.viewport.width * w, temp.camera.viewport.height * h);
                self._scene.getEngine().clear(temp.clearColor, true, true, true);
            }
        });

        // console.warn(camera);
        var viewCamera = new VeryCamera(camera, this._scene, this._canvas);
        editor.method('camera:viewport', function () {
            return viewCamera;
        });
        this._camera = viewCamera;
        VeryEngine.viewCamera = viewCamera;
        this._camera.orthoSize = 0.5;

        this._scene.activeCameras.push(camera);
        // TODO：设置clearColor
        viewCamera.clearColor = new BABYLON.Color4(116 / 255, 116 / 255, 116 / 255, 1);
        VeryEngine.addCamera(viewCamera);

        camera.attachControl(this._canvas, true);

        let backupWidth = this._canvas.width;

        let updateSize = () => {
            self._engine.resize();
        }

        this._engine.runRenderLoop(() => {
            if (this._canvas.width !== this._canvas.clientWidth || this._canvas.height !== this._canvas.clientHeight || this._canvas.width !== backupWidth) {
                backupWidth = this._canvas.width;
                this._engine.resize();
                setInterval(updateSize, 100);
            }

            // this._engine.clear()

            if (this._scene) {
                if (this._scene.activeCamera || (this._scene.activeCameras && this._scene.activeCameras.length > 0)) {
                    // 需要用的时候，乘以0.001，当前单位是毫秒
                    editor.emit('viewport:update', this._engine.getDeltaTime());
                    // 正交相机画面比例控制
                    for (let i = 0, len = VeryEngine.cameras.length; i < len; i++) {
                        VeryEngine.cameras[i].resize(true);
                    }
                    this._scene.render();
                }
            }

            // if (this._showFps) {
            // 	this.updateFpsPos();
            // }


        });
        // return this;


        this.expandControl();

        // GUI
        // var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // var createRectangle = function () {
        //     var rect1 = new BABYLON.GUI.Rectangle();
        //     rect1.width = 0.2;
        //     rect1.height = "40px";
        //     rect1.cornerRadius = 20;
        //     rect1.color = "Orange";
        //     rect1.thickness = 4;
        //     rect1.background = "green";
        //     advancedTexture.addControl(rect1);
        //     return rect1;
        // }

        // createRectangle().horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        // createRectangle().horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        // createRectangle().verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        // createRectangle().verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

        // console.warn(advancedTexture);
        // console.warn(Btn1);

        // let questionParent = new BABYLON.GUI.Rectangle('question-parent');
        // questionParent.width = "800px";
        // questionParent.height = "600px";
        // questionParent.background = '#ffffff00';
        // questionParent.color = '#ffffff00';
        // questionParent.thickness = 0;
        // gui.addControl(questionParent);

        // let guide7Btn = BABYLON.GUI.Button.CreateSimpleButton("guide7-btn", "下一步");
        // guide7Btn.cornerRadius = 10;
        // guide7Btn.color = "white";
        // guide7Btn.background = "#ffffff00";
        // guide7Btn.top = "-50px";
        // // guide7Btn.left = "-50px";
        // guide7Btn.width = "500px";
        // guide7Btn.height = "200px";
        // guide7Btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        // guide7Btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        // guide7Btn.children[0].color = "white";
        // guide7Btn.children[0].fontSize = 38;
        // questionParent.addControl(guide7Btn);

    }


    private init(): void {
        let self = this;

        this.canvas = new Canvas('canvas-viewport');
        VeryEngine.viewCanvas = this.canvas;

        this._canvas = <HTMLCanvasElement>this.canvas.element;
        VeryEngine.viewCanvasElement = this._canvas;

        // 去掉Babylon的蓝色边框
        this._canvas.style.outline = 'none';
        this._canvas.style.width = '100%';
        this._canvas.style.height = '100%';
        // add canvas
        editor.call('layout.viewport').prepend(this.canvas);

        // get canvas
        editor.method('viewport:canvas', function () {
            return self.canvas;
        });

        // update viewpot 视窗大小
        setInterval(function () {
            let rect = VeryEngine.viewportPanel.element!.getBoundingClientRect();
            self.canvas.resize(Math.floor(rect.width), Math.floor(rect.height));
        }, 100 / 6);

        // if(this._engine) this._engine.dispose();

        this._engine = new BABYLON.Engine(this._canvas, true);
        VeryEngine.viewEngine = this._engine;
        let engine = this._engine;

        window.addEventListener('resize', function () {
            engine.resize();
        });

        this._scene = new BABYLON.Scene(this._engine);
        VeryEngine.viewScene = this._scene;
        this._scene.preventDefaultOnPointerDown = false;
        this._scene.preventDefaultOnPointerUp = false;
        // this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        GizmosCenter.init(this._scene);

        // 编辑器
        editor.call('hotkey:register', 'open:inspector', {
            key: 'q',
            ctrl: true,
            alt: true,
            callback: function () {
                // editor.call('save:scene');
                self.toggleDebug();
            }
        });
        // this._scene.onKeyboardObservable.add(kbInfo => {
        //     if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        //         console.log(kbInfo.event.key);
        //         if (kbInfo.event.key === 'q' && kbInfo.event.ctrlKey && kbInfo.event.altKey) { //Ctrl + Q
        //             console.log('Ctrl + Alt + Q');
        //             this.toggleDebug();
        //         }
        //     }
        // });
        // this._scene.debugLayer.show({ embedMode: true });
    }

    private toggleDebug(): void {
        if (this._engine) {
            // Always showing the debug layer, because you can close it by itself
            var scene = this._engine.scenes[0];
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            }
            else {
                // 此处修改了babylon.d.ts文件
                scene.debugLayer.show({ embedMode: true });
            }
        }
    }


    private expandControl(): void {
        let control: ToolbarTopControl = new ToolbarTopControl();
        let expandView: ViewportExpand = new ViewportExpand();
    }




}