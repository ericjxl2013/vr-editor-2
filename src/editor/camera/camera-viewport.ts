import { Observer } from "../../lib";
import { VeryEngine } from "../../engine";
import { Tools } from "../utility";

export class CameraViewport {



    public constructor() {
        var orbiting = false;
        var panning = false;
        let zooming = false;

        let deltaTime: number = 0.02;

        let target = new BABYLON.TransformNode('__viewCameraTarget__', VeryEngine.viewScene);
        target.position.copyFromFloats(0, 0, 0);
        target.rotation.copyFromFloats(0, 0, 0);
        let MouseWheelSensitivity = 1; //滚轮灵敏度设置
        let MouseZoomMin = 0.1; //相机距离最小值
        let MouseZoomMax = 10000; //相机距离最大值

        let moveSpeed = 1; //相机跟随速度（中键平移时），采用平滑模式时起作用，越大则运动越平滑

        let wheelSpeed = 0.01;

        let xSpeed = 250.0; //旋转视角时相机x轴转速
        let ySpeed = 120.0; //旋转视角时相机y轴转速

        let yMinLimit = -360;
        let yMaxLimit = 360;

        let x = 0.0; //存储相机的euler角
        let y = 0.0; //存储相机的euler角

        let StandardDistance = 300;
        let Distance = 300; //相机和target之间的距离，因为相机的Z轴总是指向target，也就是相机z轴方向上的距离
        let targetOnScreenPosition: BABYLON.Vector3; //目标的屏幕坐标，第三个值为z轴距离
        let storeRotation: BABYLON.Quaternion; //存储相机的姿态四元数
        let CameraTargetPosition: BABYLON.Vector3; //target的位置
        let initPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero(); //平移时用于存储平移的起点位置
        let cameraX: BABYLON.Vector3; //相机的x轴方向向量
        let cameraY: BABYLON.Vector3; //相机的y轴方向向量
        let cameraZ: BABYLON.Vector3; //相机的z轴方向向量

        let initScreenPos: BABYLON.Vector3; //中键刚按下时鼠标的屏幕坐标（第三个值其实没什么用）
        let curScreenPos: BABYLON.Vector3; //当前鼠标的屏幕坐标（第三个值其实没什么用）

        //这里就是设置一下初始的相机视角以及一些其他变量，这里的x和y。。。是和下面getAxis的mouse x与mouse y对应

        var angles = Tools.radianToEulerAngle(VeryEngine.viewCamera.rotation);
        x = angles.y;
        y = angles.x;
        CameraTargetPosition = target.position.clone();
        targetOnScreenPosition = target.position.clone();

        storeRotation = BABYLON.Quaternion.FromEulerVector(Tools.eulerAngleToRadian(new BABYLON.Vector3(y + 60, x, 0)));
        VeryEngine.viewCamera.rotation = storeRotation.toEulerAngles(); //设置相机姿态

        let position: BABYLON.Vector3 = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(CameraTargetPosition); //四元数表示一个旋转，四元数乘以向量相当于把向量旋转对应角度，然后加上目标物体的位置就是相机位置了
        VeryEngine.viewCamera.position.copyFrom(position); //设置相机位置


        editor.method('viewport:camera:initilize', (target_position: BABYLON.Vector3, target_rotation: BABYLON.Vector3) => {

        });

        editor.on('viewport:update', function (dt: number) {
            // 毫秒变成秒
            deltaTime = dt * 0.001;

            // 聚焦
            if (focusing) {

                var pos = VeryEngine.viewCamera.position.clone();
                var dist = vecA.copyFrom(pos).subtract(focusPoint).length();
                // vecA.copyFrom(pos);
                if (dist > 0.1) {
                    var speed = Math.min(1.0, Math.min(1.0, flySpeed * ((firstUpdate ? 1 / 60 : deltaTime * 1.8) / (1 / 60))));
                    vecA = Tools.lerpVector3(pos, focusPoint, speed);
                    VeryEngine.viewCamera.position.copyFrom(vecA);
                } else {
                    VeryEngine.viewCamera.position.copyFrom(focusPoint);
                    // VeryEngine.viewCamera.position.copyFrom(focusTarget);
                    focusing = false;
                    editor.emit('camera:focus:end', focusTarget, vecA.copyFrom(focusTarget).subtract(VeryEngine.viewCamera.position).length());
                    // editor.once('viewport:postUpdate', function () {
                    //     editor.call('camera:history:stop', focusCamera);
                    // });
                }

                firstUpdate = false;
            }

        });

        editor.on('viewport:mouse:down', function (evt: MouseEvent, rect: DOMRect) {
            if (!focusing) {
                // 鼠标中键按下，平移允许
                if (evt.button === 1) {
                    panning = true;

                    cameraX = VeryEngine.viewCamera.right;
                    cameraY = VeryEngine.viewCamera.up;
                    cameraZ = VeryEngine.viewCamera.forward;

                    initScreenPos = new BABYLON.Vector3(evt.clientX - rect.left, rect.height - evt.clientY, targetOnScreenPosition.z);

                    // targetOnScreenPosition.z为目标物体到相机xmidbuttonDownPositiony平面的法线距离
                    targetOnScreenPosition = Tools.worldToScreenPoint(CameraTargetPosition, VeryEngine.viewScene, VeryEngine.viewCamera.camera, VeryEngine.viewEngine);

                    initPosition.copyFrom(CameraTargetPosition);
                }

                // 鼠标右键按下，旋转允许
                if (evt.button === 2) {
                    orbiting = true;
                    if(_lastMode !== '透视相机' && _lastMode !== '正交相机') {
                        editor.call('camera:ortho:set');
                        _lastMode = '正交相机';
                    }
                }
            }
        });

        editor.on('viewport:mouse:up', function (evt: MouseEvent, rect: DOMRect) {
            // 鼠标中键抬起，平移停止
            if (evt.button === 1) {
                panning = false;
                //平移结束把cameraTargetPosition的位置更新一下，不然会影响缩放与旋转功能
                CameraTargetPosition.copyFrom(target.position);
            }

            // 鼠标右键抬起，旋转停止
            if (evt.button === 2) {
                orbiting = false;
            }
        });

        editor.on('viewport:mouse:move', function (evt: MouseEvent, rect: DOMRect) {
            if (!focusing) {
                if (orbiting) {
                    x += evt.movementX * xSpeed * 0.002;
                    y -= -evt.movementY * ySpeed * 0.002;
                    y = Tools.clampAngle(y, yMinLimit, yMaxLimit);
                    storeRotation = BABYLON.Quaternion.FromEulerVector(Tools.eulerAngleToRadian(new BABYLON.Vector3(y + 60, x, 0)));
                    position = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(CameraTargetPosition);
                    VeryEngine.viewCamera.rotation = storeRotation.toEulerAngles(); //设置相机姿态
                    VeryEngine.viewCamera.position.copyFrom(position);
                }

                if (panning) {
                    // console.warn(evt);
                    // console.error(rect);
                    curScreenPos = new BABYLON.Vector3(evt.clientX - rect.left, rect.height - evt.clientY, targetOnScreenPosition.z);
                    //0.01这个系数是控制平移的速度，要根据相机和目标物体的distance来灵活选择
                    if (VeryEngine.viewCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
                        moveSpeed = 1;
                    } else {
                        if (VeryEngine.viewCamera.orthoSize < 0.05) {
                            moveSpeed = 0.4;
                        } else {
                            moveSpeed = 1;
                        }
                    }

                    target.position = initPosition.subtract(cameraX.scale(curScreenPos.x - initScreenPos.x).add(cameraY.scale(curScreenPos.y - initScreenPos.y)).scale(1 * moveSpeed));

                    //重新计算位置
                    let mPosition = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(target.position);
                    VeryEngine.viewCamera.position.copyFrom(mPosition);
                }
            }


        });

        editor.on('viewport:mouse:wheel', function (evt: WheelEvent, rect: DOMRect) {
            if (!focusing) {
                if (VeryEngine.viewCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
                    if (Distance >= MouseZoomMin && Distance <= MouseZoomMax) {
                        Distance += evt.deltaY * MouseWheelSensitivity * 0.1;
                    }
                    if (Distance < MouseZoomMin) {
                        Distance = MouseZoomMin;
                    }
                    if (Distance > MouseZoomMax) {
                        Distance = MouseZoomMax;
                    }

                    // console.log('distance: ' + Distance);
                    // console.log('delta: ' + (evt.deltaY * MouseWheelSensitivity * 0.1));
                    position = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(CameraTargetPosition);
                    VeryEngine.viewCamera.position.copyFrom(position);
                } else {
                    wheelSpeed = 0.5;
                    if (Distance >= MouseZoomMin && Distance <= MouseZoomMax) {
                        Distance += evt.deltaY * MouseWheelSensitivity * 0.1 * wheelSpeed;
                    }
                    if (Distance < MouseZoomMin) {
                        Distance = MouseZoomMin;
                    }
                    if (Distance > MouseZoomMax) {
                        Distance = MouseZoomMax;
                    }

                    // console.log('distance: ' + Distance);
                    // console.log('delta: ' + (evt.deltaY * MouseWheelSensitivity * 0.1));

                    let delta = evt.deltaY * MouseWheelSensitivity * 0.1 * 0.0012;

                    if (VeryEngine.viewCamera.orthoSize > 0.01 || (VeryEngine.viewCamera.orthoSize <= 0.01 && delta > 0)) {
                        VeryEngine.viewCamera.orthoSize += delta;
                        position = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(CameraTargetPosition);
                    VeryEngine.viewCamera.position.copyFrom(position);
                    }
                    if (VeryEngine.viewCamera.orthoSize <= 0.01) {
                        VeryEngine.viewCamera.orthoSize = 0.01;
                    }

                    // console.warn(VeryEngine.viewCamera.orthoSize);
                }
            }
        });



        var focusTarget = BABYLON.Vector3.Zero();
        var focusPoint = BABYLON.Vector3.Zero();
        var focusOrthoHeight = 0;
        // var focusCamera;
        var focusing = false;
        var firstUpdate = false;
        var flySpeed = 0.25;
        var vecA = BABYLON.Vector3.Zero();
        var vecB = BABYLON.Vector3.Zero();


        editor.method('camera:focus', function (point: BABYLON.Vector3, distance: number) {
            // var camera = editor.call('camera:current');

            focusing = true;
            firstUpdate = true;

            focusTarget.copyFrom(point);
            CameraTargetPosition.copyFrom(focusTarget);
            Distance = distance;
            vecA = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(CameraTargetPosition);

            focusPoint.copyFrom(vecA);

            editor.emit('camera:focus', point, distance);
        });

        editor.method('camera:focus:stop', function () {
            if (!focusing)
                return;
            focusing = false;
            // var camera = editor.call('camera:current');
            // editor.emit('camera:focus:end', focusTarget, vecA.copyFrom(focusTarget).subtract(camera.getPosition()).length());
            // editor.once('viewport:postUpdate', function () {
            //     editor.call('camera:history:stop', focusCamera);
            // });
        });

        editor.on('camera:focus:end', (target_position: BABYLON.Vector3, distance: number) => {
            // angles = Tools.radianToEulerAngle(VeryEngine.viewCamera.rotation);
            // x = angles.y;
            // y = angles.x;
            target.position.copyFrom(target_position);
            // CameraTargetPosition = target.position.clone();
            // targetOnScreenPosition = target.position.clone();
            Distance = distance;
            // storeRotation = BABYLON.Quaternion.FromEulerVector(Tools.eulerAngleToRadian(new BABYLON.Vector3(y + 60, x, 0)));
            // VeryEngine.viewCamera.rotation = storeRotation.toEulerAngles(); //设置相机姿态

            // let position: BABYLON.Vector3 = Tools.quatMultiplyVector3(storeRotation, new BABYLON.Vector3(0.0, 0.0, -Distance)).add(CameraTargetPosition); //四元数表示一个旋转，四元数乘以向量相当于把向量旋转对应角度，然后加上目标物体的位置就是相机位置了
            // VeryEngine.viewCamera.position = position.clone(); //设置相机位置
        });

        let _lastMode: string = '透视相机';
        editor.method('camera:change:mode', (mode_type: string) => {
            if (mode_type !== _lastMode) {
                if (mode_type === '透视相机') {
                    VeryEngine.viewCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
                } else {
                    let currentDistance = Distance;
                    if (_lastMode === '透视相机') {
                        currentDistance = StandardDistance;
                        VeryEngine.viewCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                    }

                    if (mode_type === '正交相机') {

                    } else if (mode_type === '左视图') {
                        VeryEngine.viewCamera.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(0, 90, 0));
                    } else if (mode_type === '右视图') {
                        VeryEngine.viewCamera.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(0, -90, 0));
                    } else if (mode_type === '顶视图') {
                        VeryEngine.viewCamera.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(90, 0, 0));
                    } else if (mode_type === '底视图') {
                        VeryEngine.viewCamera.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(-90, 0, 0));
                    } else if (mode_type === '前视图') {
                        VeryEngine.viewCamera.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(0, 180, 0));
                    } else if (mode_type === '后视图') {
                        VeryEngine.viewCamera.rotation = Tools.eulerAngleToRadian(new BABYLON.Vector3(0, 0, 0));
                    }

                    storeRotation = VeryEngine.viewCamera.rotation.toQuaternion();
                    var tempAngle = Tools.radianToEulerAngle(VeryEngine.viewCamera.rotation);
                    x = tempAngle.y;
                    y = tempAngle.x - 60;

                    editor.call('camera:focus', target.getAbsolutePosition(), currentDistance);
                }


                _lastMode = mode_type;
            }
        });


        editor.method('viewport:focus', function () {
            var selection = editor.call('selection:aabb');
            if (!selection) return;

            // var camera = editor.call('camera:current');

            // aabb
            // var distance = Math.max(aabb.halfExtents.x, Math.max(aabb.halfExtents.y, aabb.halfExtents.z));
            // // fov
            // distance = (distance / Math.tan(0.5 * camera.camera.fov * Math.PI / 180.0));
            // // extra space
            // distance = distance * 1.1 + 1;

            // VeryEngine.viewCamera.position.copyFrom(selection);
            editor.call('camera:focus', selection, 300);
        });

        editor.method('selection:aabb', function () {
            if (editor.call('selector:type') !== 'entity')
                return null;

            return editor.call('entities:aabb', editor.call('selector:items'));
        });

        // TODO: 当前以物体位置简单处理，distance参数也是固定的
        editor.method('entities:aabb', function (items: Observer[]) {
            if (!items)
                return null;
            if (!(items instanceof Array))
                items = [items];

            if (items[items.length - 1].node) {
                return items[items.length - 1].node.getAbsolutePosition().clone();
            } else {
                return null;
            }

            // aabb.center.set(0, 0, 0);
            // aabb.halfExtents.copy(defaultSizeSmall);

            // // calculate aabb for selected entities
            // for (var i = 0; i < items.length; i++) {
            //     var entity = items[i].entity;

            //     if (!entity)
            //         continue;

            //     aabbA.center.copy(entity.getPosition());
            //     aabbA.halfExtents.copy(defaultSizeSmall);
            //     calculateChildAABB(entity);

            //     if (i === 0) {
            //         aabb.copy(aabbA);
            //     } else {
            //         aabb.add(aabbA);
            //     }
            // }

            // return aabb;
        });



    }



}