export class Vector2 {

  public x: number;

  public y: number;


  public constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public toString(): string {
    return "{X: " + this.x + " Y:" + this.y + "}";
  }


  public getClassName(): string {
    return 'Vector2';
  }

  public addInPlaceFromFloats(x: number, y: number): Vector2 {
    this.x += x;
    this.y += y;
    return this;
  }

  public add(otherVector: BABYLON.DeepImmutable<Vector2>): Vector2 {
    return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
  }

  public copyFrom(source: BABYLON.DeepImmutable<Vector2>): Vector2 {
    return this.copyFromFloats(source.x, source.y);
  }

  public copyFromFloats(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public set(x: number, y: number): Vector2 {
    return this.copyFromFloats(x, y);
  }

  public setAll(v: number): Vector2 {
    this.x = this.y = v;
    return this;
  }

  public static Zero(): Vector2 {
    return new Vector2(0.0, 0.0);
  }

  public static One(): Vector2 {
    return new Vector2(1.0, 1.0);
  }

  public static ClampToRef(value: BABYLON.DeepImmutable<Vector2>, min: BABYLON.DeepImmutable<Vector2>, max: BABYLON.DeepImmutable<Vector2>, result: Vector2): void {
    var x = value.x;
    x = (x > max.x) ? max.x : x;
    x = (x < min.x) ? min.x : x;

    var y = value.y;
    y = (y > max.y) ? max.y : y;
    y = (y < min.y) ? min.y : y;

    result.copyFromFloats(x, y);
  }

  public static Clamp(value: BABYLON.DeepImmutable<Vector2>, min: BABYLON.DeepImmutable<Vector2>, max: BABYLON.DeepImmutable<Vector2>): Vector2 {
    const v = new Vector2();
    Vector2.ClampToRef(value, min, max, v);
    return v;
  }

  public static LerpToRef(start: BABYLON.DeepImmutable<Vector2>, end: BABYLON.DeepImmutable<Vector2>, amount: number, result: Vector2): void {
    result.x = start.x + ((end.x - start.x) * amount);
    result.y = start.y + ((end.y - start.y) * amount);
  }

  public static Lerp(start: BABYLON.DeepImmutable<Vector2>, end: BABYLON.DeepImmutable<Vector2>, amount: number): Vector2 {
    var result = new Vector2(0, 0);
    Vector2.LerpToRef(start, end, amount, result);
    return result;
  }




}