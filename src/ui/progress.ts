import { Element } from "./element";

export class Progress extends Element {


  private _progress: number;
  private _targetProgress: number;
  private _lastProgress: number;
  private _speed: number;

  private _inner: HTMLElement;

  private _now: number;
  private _animating: boolean;
  private _failed: boolean;

  public get progress(): number {
    return this._progress;
  }
  public set progress(val: number) {
    let self = this;

    val = Math.max(0, Math.min(1, val));

    if (this._targetProgress === val)
      return;

    this._targetProgress = val;

    if (this._speed === 0 || this._speed === 1) {
      this._progress = this._targetProgress;
      this._inner.style.width = (this._progress * 100) + '%';

      let progress: number = Math.max(0, Math.min(100, Math.round(this._progress * 100)));
      if (progress !== this._lastProgress) {
        this._lastProgress = progress;
        this.emit('progress:' + progress);
        this.emit('progress', progress);
      }
    } else if (!this._animating) {
      requestAnimationFrame(function () {
        self._animate();
      });
    }
  }


  public get speed(): number {
    return this._speed;
  }
  public set speed(val: number) {
    this._speed = Math.max(0, Math.min(1, val));
  }

  public get failed(): boolean {
    return this._failed;
  }
  public set failed(val: boolean) {
    this._failed = val;
    if (this._failed) {
      this.class!.add('failed');
    } else {
      this.class!.remove('failed');
    }
  }


  public constructor(progress?: number, speed?: number) {
    super();

    this._progress = progress ? Math.max(0, Math.min(1, progress)) : 0;
    this._targetProgress = this._progress;
    this._lastProgress = Math.floor(this._progress * 100);

    this.element = document.createElement('div');
    this.element.classList.add('ui-progress');

    this._inner = document.createElement('div');
    this._inner.classList.add('inner');
    this._inner.style.width = (this._progress * 100) + '%';
    this.element.appendChild(this._inner);

    this._speed = speed || 1;

    this._now = Date.now();
    this._animating = false;
 
    this._failed = false;

  }

  /**
   *  websocket link -> best way;
   *  information format -> many kinds of information to be transformed;
   * 
   *  think about the process:
   *     1. access permission check;
   *     2. a data structure of scene detail;
   *     3. a data structure for assets detail;
   *     4. keep the original file no change so there will be only one source file;
   *     5. link to any information;
   * 
   * 
   * 

   *  
   */
  private _animate(): void {
    let self = this;

    if (Math.abs(this._targetProgress - this._progress) < 0.01) {
      this._progress = this._targetProgress;
      this._animating = false;
    } else {
      if (!this._animating) {
        this._now = Date.now() - (1000 / 60);
        this._animating = true;
      }
      requestAnimationFrame(function () {
        self._animate();
      });

      let dt: number = Math.max(0.1, Math.min(3, (Date.now() - this._now) / (1000 / 60)));
      this._now = Date.now();
      this._progress = this._progress + (this._targetProgress - this._progress) * (this._speed * dt);
    }

    let progress: number = Math.max(0, Math.min(100, Math.round(this._progress * 100)));
    if (progress !== this._lastProgress) {
      this._lastProgress = progress;
      this.emit('progress:' + progress);
      this.emit('progress', progress);
    }

    this._inner.style.width = (this._progress * 100) + '%';
  }


}