
export class Vector3Utility {


  /**
   * Vector3向量曲线插值；
   * @param start 起始向量；
   * @param end 终止向量；
   * @param t 插值速率，值为：0~1；
   * 返回新Vector3向量；
   */
  public static Slerp(start: BABYLON.Vector3, end: BABYLON.Vector3, t: number): BABYLON.Vector3 {
    if (t < 0) {
      t = 0;
    } else if (t > 1) {
      t = 1;
    }
    // sin函数来实现曲线效果
    let result: BABYLON.Vector3 = new BABYLON.Vector3();
    let para: number = (Math.sin(Math.PI * (t - 0.5)) + 1) * 0.5;
    result.x = start.x + (end.x - start.x) * para;
    result.y = start.y + (end.y - start.y) * para;
    result.z = start.z + (end.z - start.z) * para;


    return result;
  }

}

export class FloatUitlity {


  public static Lerp(start: number, end: number, t: number): number {
    if (t < 0) {
      t = 0;
    } else if (t > 1) {
      t = 1;
    }
    return start + (end - start) * t;
  }

  public static SLerp(start: number, end: number, t: number): number {
    if (t < 0) {
      t = 0;
    } else if (t > 1) {
      t = 1;
    }
    // sin函数来实现曲线效果
    let para: number = (Math.sin(Math.PI * (t - 0.5)) + 1) * 0.5;
    return start + (end - start) * para;
  }





}