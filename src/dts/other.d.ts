

declare module Zlib {
    export class Inflate {
        constructor(p: any);
        public decompress(): any;
    }
}
declare module ossfile{
    let getJsonConfig:(projectId:string,jsonName:string)=>Promise<string>;
    let getUrl:(projectId:string,assetId:string,fileName:string,hash:string)=>Promise<string>;
    let getJsonAsset:(projectId:string,assetId:string,fileName:string,hash?:string)=>Promise<string>;
    let login:(projectID:string,refer:string)=>Promise<any>;
    let upLoadJsonConfig:(jsonStr: string, projectId: string, jsonName: string)=>Promise<string>;
    let getThumbnailUrl:(projectId: string, assetId: string, fileName: string, hash: string)=>Promise<string>;
    let uploadFile:(file: File, projectId: string, assetId: string, fileName: string, hash?: string)=>Promise<string>;
    let uploadJsonAsset:(assetStr: string, projectId: string, assetId: string, fileName: string, mode?: boolean)=>Promise<string>;
    let donwLoad:(projectId: string, assetId: string, fileName: string, hash: string)=>void;
}

// declare var Zlib: zlib;