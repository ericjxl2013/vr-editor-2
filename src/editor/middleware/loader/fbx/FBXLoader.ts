import { LoaderUtils } from "./LoaderUtils";
import { BinaryReader, BinaryParser } from "./BinaryParser";
import { FBXTree } from "./FBXTree";
import { TextParser } from "./TextParser";

export class FBXLoader {

    private fbxTree!: FBXTree;
    // var connections;
    // var sceneGraph;

    private path: string = '';


    public constructor() {

    }

    public load() {

    }



    // public load(url: string, onSucess: any, onProgress: any, onError: any) {
    //     var self = this;

    //     var path = (self.path === '') ? url : self.path;

    //     var loader = new FileLoader(this.manager);
    //     loader.setPath(self.path);
    //     loader.setResponseType('arraybuffer');

    //     loader.load(url, function (buffer: any) {
    //         try {
    //             onLoad(self.parse(buffer, path));
    //         } catch (error) {
    //             setTimeout(function () {
    //                 if (onError)
    //                     onError(error);
    //                 self.manager.itemError(url);

    //             }, 0);

    //         }

    //     }, onProgress, onError);
    // }


    public parser(FBXBuffer: any, path: string) {
        if (LoaderUtils.isFbxFormatBinary(FBXBuffer)) {
            this.fbxTree = new BinaryParser().parse(FBXBuffer);
        } else {
            var FBXText = LoaderUtils.convertArrayBufferToString(FBXBuffer);
            if (!LoaderUtils.isFbxFormatASCII(FBXText)) {
                throw new Error('THREE.FBXLoader: Unknown format.');
            }

            if (LoaderUtils.getFbxVersion(FBXText) < 7000) {
                throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + LoaderUtils.getFbxVersion(FBXText));
            }
            this.fbxTree = new TextParser().parse(FBXText);
        }

        // console.log( fbxTree );

        // var textureLoader = new TextureLoader(this.manager).setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);

        // return new FBXTreeParser(textureLoader, this.manager).parse(fbxTree);

        return this.fbxTree;
    }

}