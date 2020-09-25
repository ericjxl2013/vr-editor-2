export class VeryLight extends BABYLON.TransformNode {


    public light: BABYLON.Light;

    public get type(): number {
        return this.light.getTypeID();
    }

    public get intensity(): number {
        return this.light.intensity;
    }
    public set intensity(value: number) {
        this.light.intensity = value;
    }

    public get diffuse(): BABYLON.Color3 {
        return this.light.diffuse;
    }
    public set diffuse(value: BABYLON.Color3) {
        this.light.diffuse = value;
    }

    public get specular(): BABYLON.Color3 {
        return this.light.specular;
    }
    public set specular(value: BABYLON.Color3) {
        this.light.specular = value;
    }

    public get angle(): number {
        if (this.light instanceof BABYLON.SpotLight) {
            return this.light.angle;
        } else {
            return 0;
        }
    }
    public set angle(value: number) {
        if (this.light instanceof BABYLON.SpotLight) {
            this.light.angle = value;
        }
    }

    public get exponent(): number {
        if (this.light instanceof BABYLON.SpotLight) {
            return this.light.exponent;
        } else {
            return 0;
        }
    }
    public set exponent(value: number) {
        if (this.light instanceof BABYLON.SpotLight) {
            this.light.exponent = value;
        }
    }


    public constructor(light: BABYLON.Light, scene: BABYLON.Scene) {
        super(light.name, scene);
        light.name += '-Light';
        // light
        this.light = light;
        this.position.copyFrom(light.getAbsolutePosition());
        // this.rotation = BABYLON.Vector3.Zero();
        light.parent = this;
        
    }

    // public isEnabled(): boolean {
    //     return this.light.isEnabled();
    // }

    // public setEnabled(value: boolean) {
    //     this.light.setEnabled(value);
    // }

}