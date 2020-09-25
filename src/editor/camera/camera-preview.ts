import { Observer } from "../../lib";
import { Button, Tooltip } from "../../ui";
import { VeryCamera } from "../middleware";

export class CameraPreview {

    public constructor() {

        var selectedEntity: Nullable<Observer> = null; // currently selected entity
        var currentCamera: Nullable<VeryCamera> = null;  // current camera rendering to viewport
        var renderCamera = false;
        var pinnedCamera: Nullable<VeryCamera> = null;   // camera that is currently pinned in preview
        let previewing: boolean = false;
        let pinned: boolean = false;

        var viewport = editor.call('layout.viewport');

        var cameraPreviewBorder = document.createElement('div');
        cameraPreviewBorder.classList.add('camera-preview');
        cameraPreviewBorder.classList.add('clickable');

        // var btnPin = new Button('&#57636;');
        var btnPin = new Button('&#58177;');

        btnPin.class!.add('pin');
        cameraPreviewBorder.appendChild(btnPin.element!);

        btnPin.on('click', function (evt: MouseEvent) {
            evt.stopPropagation();

            if (pinnedCamera) {
                pinnedCamera = null;
                btnPin.class!.remove('active');
                pinned = false;
                if(!selectedEntity) {
                    stopPreview();
                }
            } else {
                pinnedCamera = currentCamera;
                btnPin.class!.add('active');
                pinned = true;
            }
            // updateCameraState();
        });

        Tooltip.attach({
            target: btnPin.element!,
            text: '锁定画面',
            align: 'left',
            root: editor.call('layout.root')
        });

        viewport.append(cameraPreviewBorder);


        editor.on('selector:change', function (type: string, items: Observer[]) {
            // console.warn(type);
            // console.warn(items);
            if (type === 'entity' && items && items.length === 1) {
                selectedEntity = items[0];
                if (selectedEntity.node instanceof VeryCamera) {

                    if(currentCamera) {
                        if(currentCamera === selectedEntity.node) {
                            return;
                        } else {
                            stopPreview();
                        }
                    }

                    currentCamera = selectedEntity.node;
                    currentCamera.renderCamera(true);
                    previewing = true;
                    if (!cameraPreviewBorder.classList.contains('active')) {
                        cameraPreviewBorder.classList.add('active');
                    }
                    if(pinned) pinnedCamera = currentCamera;
                } else {
                    selectedEntity = null;
                    if(!pinned) {
                        stopPreview();
                    } 
                }
            } else {
                selectedEntity = null;
                if(!pinned) {
                    stopPreview();
                }
            }
        });

        let stopPreview = () => {
            if (currentCamera) currentCamera.renderCamera(false);
            currentCamera = null;
            previewing = false;
            if (cameraPreviewBorder.classList.contains('active')) {
                cameraPreviewBorder.classList.remove('active');
            }
        };

    }

}