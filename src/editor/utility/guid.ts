export class GUID {

  /**
   * 创建GUID唯一标志，注意：采用大数法，有很小的可能性会重复，一般够用；
   */
  public static create(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: string) {
      let r = Math.random() * 16 | 0,
        v = (c === 'x') ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}