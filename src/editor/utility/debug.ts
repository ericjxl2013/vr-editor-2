export class Debug {

    private allow: boolean;

    public constructor(allow: boolean = true) {
        this.allow = allow;
    }

    public log(message?: any, ...optionalParams: any[]): void {
        if (!this.allow) return;
        console.log(message, optionalParams);
    }

    public warn(message?: any, ...optionalParams: any[]): void {
        if (!this.allow) return;
        console.warn(message, optionalParams);
    }

    public error(message?: any, ...optionalParams: any[]): void {
        if (!this.allow) return;
        console.error(message, optionalParams);
    }

}