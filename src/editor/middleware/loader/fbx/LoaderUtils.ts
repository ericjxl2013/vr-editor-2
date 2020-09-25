export class LoaderUtils {

    public constructor() {

    }

    public static decodeText(array: any) {
        if (typeof TextDecoder !== 'undefined') {
            return new TextDecoder().decode(array);
        }

        // Avoid the String.fromCharCode.apply(null, array) shortcut, which
        // throws a "maximum call stack size exceeded" error for large arrays.
        var s = '';
        for (var i = 0, il = array.length; i < il; i++) {
            // Implicitly assumes little-endian.
            s += String.fromCharCode(array[i]);
        }

        try {
            // merges multi-byte utf-8 characters.
            return decodeURIComponent(escape(s));
        } catch (e) { // see #16358
            return s;
        }
    }

    public static extractUrlBase(url: string) {
        var index = url.lastIndexOf('/');
        if (index === - 1) return './';
        return url.substr(0, index + 1);
    }



    public static append(a: any, b: any) {
        for (var i = 0, j = a.length, l = b.length; i < l; i++ , j++) {
            a[j] = b[i];
        }
    }

    // Parses comma separated list of numbers and returns them an array.
    // Used internally by the TextParser
    public static parseNumberArray(value: any) {
        var array = value.split(',').map(function (val: any) {
            return parseFloat(val);
        });
        return array;
    }

    public static isFbxFormatBinary(buffer: any) {
        var CORRECT = 'Kaydara FBX Binary  \0';
        return buffer.byteLength >= CORRECT.length && CORRECT === LoaderUtils.convertArrayBufferToString(buffer, 0, CORRECT.length);
    }

    public static convertArrayBufferToString(buffer: any, from?: number, to?: number) {
        if (from === undefined) from = 0;
        if (to === undefined) to = buffer.byteLength;
        return LoaderUtils.decodeText(new Uint8Array(buffer, from, to));
    }

    public static isFbxFormatASCII(text: string) {
        var CORRECT = ['K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\'];
        var cursor = 0;
        function read(offset: number) {
            var result = text[offset - 1];
            text = text.slice(cursor + offset);
            cursor++;
            return result;
        }
        for (var i = 0; i < CORRECT.length; ++i) {
            var num = read(1);
            if (num === CORRECT[i]) {
                return false;
            }
        }
        return true;

    }

    public static getFbxVersion(text: string) {
        var versionRegExp = /FBXVersion: (\d+)/;
        var match = text.match(versionRegExp);
        if (match) {
            var version = parseInt(match[1]);
            return version;
        }
        throw new Error('THREE.FBXLoader: Cannot find the version number for the file given.');
    }

    /*

    // Converts FBX ticks into real time seconds.
    public static convertFBXTimeToSeconds(time: any) {

        return time / 46186158000;

    }

    private dataArray: any = [];

    // extracts the data from the correct position in the FBX array based on indexing type
    public static getData(polygonVertexIndex: any, polygonIndex: any, vertexIndex: any, infoObject: any) {
        var index;
        switch (infoObject.mappingType) {
            case 'ByPolygonVertex':
                index = polygonVertexIndex;
                break;
            case 'ByPolygon':
                index = polygonIndex;
                break;
            case 'ByVertice':
                index = vertexIndex;
                break;
            case 'AllSame':
                index = infoObject.indices[0];
                break;
            default:
                console.warn('THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType);
        }

        if (infoObject.referenceType === 'IndexToDirect') index = infoObject.indices[index];

        var from = index * infoObject.dataSize;
        var to = from + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);

    }

    


    private tempEuler = new Euler();
    private tempVec = new Vector3();

// generate transformation from FBX transform data
// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
function generateTransform(transformData) {

    var lTranslationM = new Matrix4();
    var lPreRotationM = new Matrix4();
    var lRotationM = new Matrix4();
    var lPostRotationM = new Matrix4();

    var lScalingM = new Matrix4();
    var lScalingPivotM = new Matrix4();
    var lScalingOffsetM = new Matrix4();
    var lRotationOffsetM = new Matrix4();
    var lRotationPivotM = new Matrix4();

    var lParentGX = new Matrix4();
    var lGlobalT = new Matrix4();

    var inheritType = (transformData.inheritType) ? transformData.inheritType : 0;

    if (transformData.translation) lTranslationM.setPosition(tempVec.fromArray(transformData.translation));

    if (transformData.preRotation) {

        var array = transformData.preRotation.map(_Math.degToRad);
        array.push(transformData.eulerOrder);
        lPreRotationM.makeRotationFromEuler(tempEuler.fromArray(array));

    }

    if (transformData.rotation) {

        var array = transformData.rotation.map(_Math.degToRad);
        array.push(transformData.eulerOrder);
        lRotationM.makeRotationFromEuler(tempEuler.fromArray(array));

    }

    if (transformData.postRotation) {

        var array = transformData.postRotation.map(_Math.degToRad);
        array.push(transformData.eulerOrder);
        lPostRotationM.makeRotationFromEuler(tempEuler.fromArray(array));

    }

    if (transformData.scale) lScalingM.scale(tempVec.fromArray(transformData.scale));

    // Pivots and offsets
    if (transformData.scalingOffset) lScalingOffsetM.setPosition(tempVec.fromArray(transformData.scalingOffset));
    if (transformData.scalingPivot) lScalingPivotM.setPosition(tempVec.fromArray(transformData.scalingPivot));
    if (transformData.rotationOffset) lRotationOffsetM.setPosition(tempVec.fromArray(transformData.rotationOffset));
    if (transformData.rotationPivot) lRotationPivotM.setPosition(tempVec.fromArray(transformData.rotationPivot));

    // parent transform
    if (transformData.parentMatrixWorld) lParentGX = transformData.parentMatrixWorld;

    // Global Rotation
    var lLRM = lPreRotationM.multiply(lRotationM).multiply(lPostRotationM);
    var lParentGRM = new Matrix4();
    lParentGX.extractRotation(lParentGRM);

    // Global Shear*Scaling
    var lParentTM = new Matrix4();
    var lLSM;
    var lParentGSM;
    var lParentGRSM;

    lParentTM.copyPosition(lParentGX);
    lParentGRSM = lParentTM.getInverse(lParentTM).multiply(lParentGX);
    lParentGSM = lParentGRM.getInverse(lParentGRM).multiply(lParentGRSM);
    lLSM = lScalingM;

    var lGlobalRS;
    if (inheritType === 0) {

        lGlobalRS = lParentGRM.multiply(lLRM).multiply(lParentGSM).multiply(lLSM);

    } else if (inheritType === 1) {

        lGlobalRS = lParentGRM.multiply(lParentGSM).multiply(lLRM).multiply(lLSM);

    } else {

        var lParentLSM = new Matrix4().copy(lScalingM);

        var lParentGSM_noLocal = lParentGSM.multiply(lParentLSM.getInverse(lParentLSM));

        lGlobalRS = lParentGRM.multiply(lLRM).multiply(lParentGSM_noLocal).multiply(lLSM);

    }

    // Calculate the local transform matrix
    var lTransform = lTranslationM.multiply(lRotationOffsetM).multiply(lRotationPivotM).multiply(lPreRotationM).multiply(lRotationM).multiply(lPostRotationM).multiply(lRotationPivotM.getInverse(lRotationPivotM)).multiply(lScalingOffsetM).multiply(lScalingPivotM).multiply(lScalingM).multiply(lScalingPivotM.getInverse(lScalingPivotM));

    var lLocalTWithAllPivotAndOffsetInfo = new Matrix4().copyPosition(lTransform);

    var lGlobalTranslation = lParentGX.multiply(lLocalTWithAllPivotAndOffsetInfo);
    lGlobalT.copyPosition(lGlobalTranslation);

    lTransform = lGlobalT.multiply(lGlobalRS);

    return lTransform;

}

// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
function getEulerOrder(order) {

    order = order || 0;

    var enums = [
        'ZYX', // -> XYZ extrinsic
        'YZX', // -> XZY extrinsic
        'XZY', // -> YZX extrinsic
        'ZXY', // -> YXZ extrinsic
        'YXZ', // -> ZXY extrinsic
        'XYZ', // -> ZYX extrinsic
        //'SphericXYZ', // not possible to support
    ];

    if (order === 6) {

        console.warn('THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.');
        return enums[0];

    }

    return enums[order];

}

// Parses comma separated list of numbers and returns them an array.
// Used internally by the TextParser
function parseNumberArray(value) {

    var array = value.split(',').map(function (val) {

        return parseFloat(val);

    });

    return array;

}

function append(a, b) {

    for (var i = 0, j = a.length, l = b.length; i < l; i++ , j++) {

        a[j] = b[i];

    }

}

function slice(a, b, from, to) {

    for (var i = from, j = 0; i < to; i++ , j++) {

        a[j] = b[i];

    }

    return a;

}

// inject array a2 into array a1 at index
function inject(a1, index, a2) {

    return a1.slice(0, index).concat(a2).concat(a1.slice(index));

}

*/

}