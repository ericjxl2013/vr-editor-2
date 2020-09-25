export class Transform {

  // public get gameObject(): GameObject {
  //   return this._gameObject;
  // }
  // private _gameObject: GameObject;

  private _transformNode: BABYLON.Nullable<BABYLON.TransformNode> = null;
  private _mesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;

  public get transformNode(): Nullable<BABYLON.TransformNode> {
    if (this._mesh) {
      return this._mesh;
    } else if (this._transformNode) {
      return this._transformNode;
    } else {
      return null;
    }
  }

  public get mesh(): Nullable<BABYLON.AbstractMesh> {
    return this._mesh;
  }
  public set mesh(val: Nullable<BABYLON.AbstractMesh>) {
    this._mesh = val;
  }

  public get isMesh(): boolean {
    if (this._mesh) {
      return true;
    } else {
      return false;
    }
  }

  public get isEmpty(): boolean {
    if (this._transformNode || this._mesh) {
      return false;
    } else {
      return true;
    }
  }

  // public get parent(): Nullable<BABYLON.TransformNode>

  public get name(): string {
    return this._name;
  }
  public set name(val: string) {
    if (this._transformNode) {
      this._transformNode.name = val;
    }
    if (this._mesh) {
      this._mesh.name = val;
    }
    this._name = val;
  }
  private _name: string = '';

  private _tempVec: BABYLON.Vector3 = BABYLON.Vector3.Zero();

  public get parent(): Nullable<Transform> {
    return this._parent;
  }
  private _parent: Nullable<Transform> = null;

  public set parent(val: Nullable<Transform>) {
    if (!this.isEmpty) {
      if (val && !val.isEmpty) {
        this._transformNode!.setParent(val.transformNode);
        this._parent = val;
      } else {
        this._transformNode!.setParent(null);
        this._parent = null;
      }
    }
  }

  /**
   * 获取相对坐标
   */
  public get localPosition(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      this._tempVec.copyFrom(this.transformNode!.position);
      return this._tempVec;
    }
  }

  /**
   * 设置相对坐标
   */
  public set localPosition(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      this.transformNode!.position = val;
    }
  }

  /**
   * 获取绝对坐标
   */
  public get position(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      this._tempVec.copyFrom(this.transformNode!.getAbsolutePosition());
      return this._tempVec;
    }
  }

  /**
   * 设置绝对坐标
   */
  public set position(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      this.transformNode!.setAbsolutePosition(val);
    }
  }

  /**
   * 获取相对欧拉角度
   */
  public get localEulerAngles(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      let para: number = 180 / Math.PI;
      return this.transformNode!.rotation.multiplyByFloats(para, para, para);
    }
  }

  /**
   * 设置相对欧拉角度
   */
  public set localEulerAngles(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      let para: number = Math.PI / 180;
      this.transformNode!.rotation = val.multiplyByFloats(para, para, para);
    }
  }

  /**
   * 获取相对角度（弧度）
   */
  public get localRotation(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      this._tempVec.copyFrom(this.transformNode!.rotation);
      return this._tempVec;
    }
  }

  /**
   * 设置相对角度（弧度）
   */
  public set localRotation(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      this.transformNode!.rotation = val;
    }
  }

  /**
   * 获取绝对欧拉角度
   */
  public get eulerAngles(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      let para: number = 180 / Math.PI;
      this.transformNode!.setParent(null);
      let result: BABYLON.Vector3 = this.transformNode!.rotation.multiplyByFloats(para, para, para);
      this.transformNode!.setParent(parent);
      return result;
    }
  }

  /**
   * 设置绝对欧拉角度
   */
  public set eulerAngles(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      let para: number = Math.PI / 180;
      this.transformNode!.setParent(null);
      this.transformNode!.rotation = val.multiplyByFloats(para, para, para);
      this.transformNode!.setParent(parent);

    }
  }

  /**
   * 获取绝对角度（弧度）
   */
  public get rotation(): BABYLON.Vector3 {
    if (this.isEmpty) {
      return BABYLON.Vector3.Zero();
    } else {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      this.transformNode!.setParent(null);
      this._tempVec.copyFrom(this.transformNode!.rotation);
      this.transformNode!.setParent(parent);
      return this._tempVec;
    }
  }

  /**
   * 设置绝对角度（弧度）
   */
  public set rotation(val: BABYLON.Vector3) {
    if (!this.isEmpty) {
      let parent: Nullable<BABYLON.Node> = this.transformNode!.parent;
      this.transformNode!.setParent(null);
      this.transformNode!.rotation = val;
      this.transformNode!.setParent(parent);
    }
  }


  // TO be contioued

  public get children(): BABYLON.Node[] {
      return this.transformNode!.getChildren();
  }

  public get childCount(): number {
    return 0;
  }

  public forward: BABYLON.Vector3 = BABYLON.Vector3.Forward();


  public get hierarchyCount(): number {
    return 0;
  }

  public localScale: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);


  /**
   * BabylonJS Mesh和TransformNode包装类，仿照UnityEngine数据结构；
   * @param name 物体名，默认为“空物体”；
   * @param mesh BabylonJS Mesh;
   * @param node BabylonJS TransformNode;
   */
  constructor(name: string = '空物体', mesh: Nullable<BABYLON.AbstractMesh> = null, node: Nullable<BABYLON.TransformNode> = null) {
    if (mesh) {
      this._mesh = mesh;
      this._transformNode = mesh;
      this._name = mesh.name;
    } else {
      if (node) {
        this._mesh = null;
        this._transformNode = node;
        this._name = node.name;
      } else {
        // if (!name) name = '空物体';
        this._mesh = null;
        this._transformNode = new BABYLON.TransformNode(name);
        this._name = name;
      }
    }

    // 设置父物体
    if (this._transformNode) {
      let tempParent: Nullable<BABYLON.Node> = this._transformNode.parent;
      if (tempParent) {
        if (tempParent instanceof BABYLON.AbstractMesh) {
          this._parent = new Transform(tempParent.name, <BABYLON.AbstractMesh>tempParent);
        } else {
          this._parent = new Transform(tempParent.name, null, <BABYLON.TransformNode>tempParent);
        }
      }
    } else {
      this._parent = null;
    }
  }

  /**
   * 沿世界或局部坐标系平移；
   * @param translation 平移方向向量；
   * @param relativeTo 平移参考系，LOCAL为局部坐标，WORLD为世界坐标；
   */
  public translate(translation: BABYLON.Vector3, relativeTo: BABYLON.Space): void {
    if (this.transformNode) {
      this.transformNode.translate(translation, 1, relativeTo);
    }
  }

  /**
   * 沿着某个参考物体的局部方向向量平移，参考物体为null时，则沿世界坐标移动；
   * @param translation 参考物体的局部方向向量；
   * @param trans 平移参考物体；
   */
  public translateRelativeTo(translation: BABYLON.Vector3, trans: Transform): void {
    if (this.transformNode) {
      let direction: BABYLON.Vector3 = translation.clone();
      if (trans && trans.transformNode) {
        direction = this.transformDirection(direction);
      }
      this.transformNode.translate(direction, 1, BABYLON.Space.WORLD);
    }
  }

  /**
   * 沿某个轴自转，可选择相对世界坐标或自身坐标；
   * @param eulerAngles 自转运动向量；
   * @param relativeTo 自转参考系；
   */
  public rotate(eulerAngles: BABYLON.Vector3, relativeTo: BABYLON.Space): void {
    if (this.transformNode) {
      let axis: BABYLON.Vector3 = BABYLON.Vector3.Zero().copyFrom(eulerAngles.normalize());
      let angle: number = eulerAngles.length();
      this.transformNode.rotate(axis, angle, relativeTo);
    }
  }

  /**
   * 沿世界坐标某个轴公转；
   * @param point 旋转点；
   * @param axis 旋转轴；
   * @param speed 旋转速度；
   */
  public rotateAround(point: BABYLON.Vector3, axis: BABYLON.Vector3, speed: number): void {
    if (this.transformNode) {
      this.transformNode.rotateAround(point, axis, speed);
    }
  }




  /**
   * 局部坐标位置转世界坐标位置；
   * @param local_position 局部坐标位置；
   * 返回新Vector3向量；
   */
  public transformPosition(local_position: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = this.transformNode.computeWorldMatrix();
      return BABYLON.Vector3.TransformCoordinates(local_position, matrix);
    } else {
      return local_position;
    }
  }

  /**
   * 局部方向向量转世界方向向量，转换后保持向量长度相等；
   * @param local_direction 局部方向向量；
   * 返回新Vector3向量；
   */
  public transformDirection(local_direction: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = this.transformNode.computeWorldMatrix();
      return BABYLON.Vector3.TransformCoordinates(local_direction, matrix).subtract(this.transformNode.getAbsolutePosition());
    } else {
      return local_direction;
    }
  }

  /**
   * 世界坐标位置转局部坐标位置；
   * @param global_position 世界坐标位置；
   * 返回新Vector3向量；
   */
  public inverseTransformPosition(global_position: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = BABYLON.Matrix.Invert(this.transformNode.computeWorldMatrix());
      return BABYLON.Vector3.TransformCoordinates(global_position, matrix);
    } else {
      return global_position;
    }
  }

  /**
   * 世界方向向量转局部方向向量，转换后保持向量长度相等；
   * @param global_direction 世界方向向量；
   * 返回新Vector3向量；
   */
  public inverseTransformDirection(global_direction: BABYLON.Vector3): BABYLON.Vector3 {
    if (this.transformNode) {
      let matrix: BABYLON.Matrix = BABYLON.Matrix.Invert(this.transformNode.computeWorldMatrix());
      let pointA: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(global_direction, matrix);
      let pointOrigin: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Zero(), matrix);
      return pointA.subtract(pointOrigin);
    } else {
      return global_direction;
    }
  }


  public destroy(): void {
    if (this.mesh) this.mesh.dispose();
    if (this.transformNode) this.transformNode.dispose();
  }


  // TODO

  public lookAt(target: Transform, worldUp: BABYLON.Vector3 = BABYLON.Vector3.Up()): void {

  }

  public setParent(parent: Nullable<Transform>): void {

  }

  public detachChildren(): void {

  }

  public findChild(name: string): void {


  }

  public isChildOf(name: string): boolean {
    return true;
  }

  public getChild(index: number): void {

  }


}