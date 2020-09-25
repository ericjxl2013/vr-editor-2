export class FBXTree {

    private v: { [key: string]: any } = {};
    public constructor() {

    }

    public add(key: string, val: any) {
        this.v[key] = val;
    }
}