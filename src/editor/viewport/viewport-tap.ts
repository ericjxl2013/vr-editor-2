import { Debug } from "../utility";

export class ViewportTap {




    public constructor() {
        // return;

        var canvas = editor.call('viewport:canvas');
        // console.warn(canvas);
        if (!canvas) {
            console.warn('Viewport Canvas组件没有创建成功！');
            return;
        }

        var taps: Tap[] = [];
        var inViewport = false;

        editor.method('viewport:inViewport', function () {
            return inViewport;
        });

        var evtMouseMove = function (evt: MouseEvent) {
            // console.warn('evtMouseMove');
            var rect = canvas.element.getBoundingClientRect();

            editor.emit('viewport:mouse:move', evt, rect);

            // render if mouse moved within viewport
            if (evt.clientX >= rect.left && evt.clientX <= rect.right && evt.clientY >= rect.top && evt.clientY <= rect.bottom) {
                if (!inViewport) {
                    inViewport = true;
                    editor.emit('viewport:hover', true);
                }
            } else if (inViewport) {
                inViewport = false;
                editor.emit('viewport:hover', false);
            }
        };

        var evtMouseUp = function (evt: MouseEvent) {
            // console.warn('evtMouseUp');
            var rect = canvas.element.getBoundingClientRect();
            editor.emit('viewport:mouse:up', evt, rect);
        };

        // console.error(editor.call('layout.viewport').element);
        canvas.element.addEventListener('mousedown', function (evt: MouseEvent) {
            // console.warn('mousedown');
            var rect = canvas.element.getBoundingClientRect();
            editor.emit('viewport:mouse:down', evt, rect);
            // if (document.activeElement && document.activeElement.tagName.toLowerCase() === 'input')
            //     document.activeElement.blur();
            // evt.preventDefault();
        }, false);

        canvas.element.addEventListener('mouseover', function () {
            // console.warn('mouseover');
            editor.emit('viewport:hover', true);
        }, false);

        canvas.element.addEventListener('mouseleave', function (evt: MouseEvent) {
            // console.warn('mouseleave');
            // ignore tooltip
            var target = evt.target || evt.relatedTarget;
            if (target && (<Element>target).classList.contains('cursor-tooltip'))
                return;

            editor.emit('viewport:hover', false);
        }, false);

        var onMouseWheel = function (evt: WheelEvent) {
            editor.emit('viewport:mouse:wheel', evt);
        };


        window.addEventListener('mousemove', evtMouseMove, false);
        window.addEventListener('dragover', evtMouseMove, false);
        window.addEventListener('mouseup', evtMouseUp, false);
        window.addEventListener('wheel', onMouseWheel, false);

    }

}




export class Tap {

    public x: number;
    public lx: number;
    public sx: number;
    public y: number;
    public ly: number;
    public sy: number;
    public nx: number;
    public ny: number;
    public move: boolean;
    public down: boolean;
    public button: number;
    public mouse: boolean;

    public constructor(evt: MouseEvent, rect: ClientRect, mouse: boolean) {
        this.x = this.lx = this.sx = evt.clientX - rect.left;
        this.y = this.ly = this.sy = evt.clientY - rect.top;
        this.nx = 0;
        this.ny = 0;
        this.move = false;
        this.down = true;
        this.button = evt.button;
        this.mouse = !!mouse;
    }

    public update(evt: MouseEvent, rect: ClientRect): void {
        var x = evt.clientX - rect.left;
        var y = evt.clientY - rect.top;

        // if it's moved
        if (this.down && !this.move && (Math.abs(this.sx - x) + Math.abs(this.sy - y)) > 8)
            this.move = true;

        // moving
        if (this.move) {
            this.nx = x - this.lx;
            this.ny = y - this.ly;
            this.lx = this.x;
            this.ly = this.y;
        }

        // coords
        this.x = x;
        this.y = y;
    }

}