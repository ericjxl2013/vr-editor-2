import { BabylonEngine } from "./engine";

export class Time {

  /**
   * 当前帧ID，目前只考虑一个Scene的情况；
   */
  public static get frameCounter(): number {
    return BabylonEngine.Scene.getFrameId();
  }
  // private static _frame: number = 0;
  // public static _sum(): void {
  //   this._frame++;
  // }

  /**
   * 当前帧与上一帧时间间隔，单位秒（s）；
   */
  public static get deltaTime(): number {
    // return 1.0 / GameGlobal.Engine.getFps();
    return BabylonEngine.Engine.getDeltaTime() * 0.001;
  }

  private static _startDate: Date;
  private static _startSecond: number;

  /**
   * Scene开始，记录当前启动时间，作为time计算起始值；
   */
  public static start(): void {
    this._startDate = new Date();
    this._startSecond = this._startDate.valueOf() / 1000;
  }

  /**
   * 从当前scene开始到当前的时间间隔，单位秒（s）；
   */
  public static get time(): number {
    return (new Date()).valueOf() / 1000 - this._startSecond;
  }


}