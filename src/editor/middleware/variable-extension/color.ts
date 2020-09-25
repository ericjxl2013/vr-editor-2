
export class Color {

  public r: number;
  public g: number;
  public b: number;
  public a: number;


  public constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toString(): string {
    return '{R: ' + this.r + ' G:' + this.g + ' B:' + this.b + ' A:' + this.a + '}';
  }

  public getClassName(): string {
    return 'Color';
  }

  public toColor3(): BABYLON.Color3 {
    return new BABYLON.Color3(this.r, this.g, this.b);
  }

  public toColor4(): BABYLON.Color4 {
    return new BABYLON.Color4(this.r, this.g, this.b, this.a);
  }

  public equals(otherColor: BABYLON.DeepImmutable<Color>): boolean {
    return otherColor && this.r === otherColor.r && this.g === otherColor.g && this.b === otherColor.b && this.a === otherColor.a;
  }

  public equalsFloats(r: number, g: number, b: number, a: number): boolean {
    return this.r === r && this.g === g && this.b === b && this.a === a;
  }

  public scale(scale: number): Color {
    return new Color(this.r * scale, this.g * scale, this.b * scale);
  }

  public add(otherColor: BABYLON.DeepImmutable<Color>): Color {
    return new Color(this.r + otherColor.r, this.g + otherColor.g, this.b + otherColor.b);
  }

  public subtract(otherColor: BABYLON.DeepImmutable<Color>): Color {
    return new Color(this.r - otherColor.r, this.g - otherColor.g, this.b - otherColor.b);
  }

  public clone(): Color {
    return new Color(this.r, this.g, this.b, this.a);
  }

  public copyFrom(source: BABYLON.DeepImmutable<Color>): Color {
    this.r = source.r;
    this.g = source.g;
    this.b = source.b;
    this.a = source.a;
    return this;
  }

  public copyFromFloats(r: number, g: number, b: number, a: number): Color {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }

  public set(r: number, g: number, b: number, a: number = 1): Color {
    return this.copyFromFloats(r, g, b, a);
  }

  public toHexString(): string {
    var intR = (this.r * 255) | 0;
    var intG = (this.g * 255) | 0;
    var intB = (this.b * 255) | 0;
    return '#' + BABYLON.Scalar.ToHex(intR) + BABYLON.Scalar.ToHex(intG) + BABYLON.Scalar.ToHex(intB);
  }


  public static Lerp(start: BABYLON.DeepImmutable<Color>, end: BABYLON.DeepImmutable<Color>, amount: number): Color {
    var result = new Color(0.0, 0.0, 0.0);
    Color.LerpToRef(start, end, amount, result);
    return result;
  }

  public static LerpToRef(left: BABYLON.DeepImmutable<Color>, right: BABYLON.DeepImmutable<Color>, amount: number, result: Color): void {
    result.r = left.r + ((right.r - left.r) * amount);
    result.g = left.g + ((right.g - left.g) * amount);
    result.b = left.b + ((right.b - left.b) * amount);
  }

  public CreateFromColor3(c: BABYLON.Color3): Color {
    return new Color(c.r, c.g, c.b);
  }

  public CreateFromColor4(c: BABYLON.Color4): Color {
    return new Color(c.r, c.g, c.b, c.a);
  }

  /**
   * Returns a Color3 value containing a red color
   * @returns a new Color3 object
   */
  public static Red(): Color { return new Color(1, 0, 0); }
  /**
   * Returns a Color3 value containing a green color
   * @returns a new Color3 object
   */
  public static Green(): Color { return new Color(0, 1, 0); }
  /**
   * Returns a Color3 value containing a blue color
   * @returns a new Color3 object
   */
  public static Blue(): Color { return new Color(0, 0, 1); }
  /**
   * Returns a Color3 value containing a black color
   * @returns a new Color3 object
   */
  public static Black(): Color { return new Color(0, 0, 0); }
  /**
   * Returns a Color3 value containing a white color
   * @returns a new Color3 object
   */
  public static White(): Color { return new Color(1, 1, 1); }
  /**
   * Returns a Color3 value containing a purple color
   * @returns a new Color3 object
   */
  public static Purple(): Color { return new Color(0.5, 0, 0.5); }
  /**
   * Returns a Color3 value containing a magenta color
   * @returns a new Color3 object
   */
  public static Magenta(): Color { return new Color(1, 0, 1); }
  /**
   * Returns a Color3 value containing a yellow color
   * @returns a new Color3 object
   */
  public static Yellow(): Color { return new Color(1, 1, 0); }
  /**
   * Returns a Color3 value containing a gray color
   * @returns a new Color3 object
   */
  public static Gray(): Color { return new Color(0.5, 0.5, 0.5); }
  /**
   * Returns a Color3 value containing a teal color
   * @returns a new Color3 object
   */
  public static Teal(): Color { return new Color(0, 1.0, 1.0); }
  /**
   * Returns a Color3 value containing a random color
   * @returns a new Color3 object
   */
  public static Random(): Color { return new Color(Math.random(), Math.random(), Math.random()); }

}