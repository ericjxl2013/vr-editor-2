import { LoaderUtils } from "./LoaderUtils";
import { FBXTree } from "./FBXTree";

export class BinaryParser {


    public constructor() {

    }


    public parse(buffer: any) {
        var reader = new BinaryReader(buffer);
        reader.skip(23); // skip magic 23 bytes
        var version = reader.getUint32();
        console.log('THREE.FBXLoader: FBX binary version: ' + version);
        var allNodes = new FBXTree();
        while (!this.endOfContent(reader)) {
            var node = this.parseNode(reader, version);
            if (node !== null) allNodes.add(node.name, node);
        }
        return allNodes;
    }

    public endOfContent(reader: BinaryReader) {
        // footer size: 160bytes + 16-byte alignment padding
        // - 16bytes: magic
        // - padding til 16-byte alignment (at least 1byte?)
        //	(seems like some exporters embed fixed 15 or 16bytes?)
        // - 4bytes: magic
        // - 4bytes: version
        // - 120bytes: zero
        // - 16bytes: magic
        if (reader.size() % 16 === 0) {
            return ((reader.getOffset() + 160 + 16) & ~0xf) >= reader.size();
        } else {
            return reader.getOffset() + 160 + 16 >= reader.size();
        }
    }

    // recursively parse nodes until the end of the file is reached
    public parseNode(reader: BinaryReader, version: any) {
        var node: any = {};

        // The first three data sizes depends on version.
        var endOffset = (version >= 7500) ? reader.getUint64() : reader.getUint32();
        var numProperties = (version >= 7500) ? reader.getUint64() : reader.getUint32();

        // note: do not remove this even if you get a linter warning as it moves the buffer forward
        var propertyListLen = (version >= 7500) ? reader.getUint64() : reader.getUint32();

        var nameLen = reader.getUint8();
        var name = reader.getString(nameLen);

        // Regards this node as NULL-record if endOffset is zero
        if (endOffset === 0) return null;
        var propertyList = [];
        for (var i = 0; i < numProperties; i++) {
            propertyList.push(this.parseProperty(reader));
        }

        // Regards the first three elements in propertyList as id, attrName, and attrType
        var id = propertyList.length > 0 ? propertyList[0] : '';
        var attrName = propertyList.length > 1 ? propertyList[1] : '';
        var attrType = propertyList.length > 2 ? propertyList[2] : '';

        // check if this node represents just a single property
        // like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
        node.singleProperty = (numProperties === 1 && reader.getOffset() === endOffset) ? true : false;

        while (endOffset > reader.getOffset()) {
            var subNode = this.parseNode(reader, version);
            if (subNode !== null) this.parseSubNode(name, node, subNode);
        }

        node.propertyList = propertyList; // raw property list used by parent

        if (typeof id === 'number') node.id = id;
        if (attrName !== '') node.attrName = attrName;
        if (attrType !== '') node.attrType = attrType;
        if (name !== '') node.name = name;

        return node;
    }

    public parseSubNode(name: string, node: any, subNode: any) {
        // special case: child node is single property
        if (subNode.singleProperty === true) {
            var value = subNode.propertyList[0];
            if (Array.isArray(value)) {
                node[subNode.name] = subNode;
                subNode.a = value;
            } else {
                node[subNode.name] = value;
            }
        } else if (name === 'Connections' && subNode.name === 'C') {
            var array: any = [];
            subNode.propertyList.forEach(function (property: any, i: any) {
                // first Connection is FBX type (OO, OP, etc.). We'll discard these
                if (i !== 0) array.push(property);
            });

            if (node.connections === undefined) {
                node.connections = [];
            }
            node.connections.push(array);
        } else if (subNode.name === 'Properties70') {
            var keys = Object.keys(subNode);
            keys.forEach(function (key) {
                node[key] = subNode[key];
            });
        } else if (name === 'Properties70' && subNode.name === 'P') {
            var innerPropName = subNode.propertyList[0];
            var innerPropType1 = subNode.propertyList[1];
            var innerPropType2 = subNode.propertyList[2];
            var innerPropFlag = subNode.propertyList[3];
            var innerPropValue;

            if (innerPropName.indexOf('Lcl ') === 0) innerPropName = innerPropName.replace('Lcl ', 'Lcl_');
            if (innerPropType1.indexOf('Lcl ') === 0) innerPropType1 = innerPropType1.replace('Lcl ', 'Lcl_');

            if (innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf('Lcl_') === 0) {
                innerPropValue = [
                    subNode.propertyList[4],
                    subNode.propertyList[5],
                    subNode.propertyList[6]
                ];
            } else {
                innerPropValue = subNode.propertyList[4];
            }

            // this will be copied to parent, see above
            node[innerPropName] = {
                'type': innerPropType1,
                'type2': innerPropType2,
                'flag': innerPropFlag,
                'value': innerPropValue
            };

        } else if (node[subNode.name] === undefined) {
            if (typeof subNode.id === 'number') {
                node[subNode.name] = {};
                node[subNode.name][subNode.id] = subNode;
            } else {
                node[subNode.name] = subNode;
            }
        } else {
            if (subNode.name === 'PoseNode') {
                if (!Array.isArray(node[subNode.name])) {
                    node[subNode.name] = [node[subNode.name]];
                }
                node[subNode.name].push(subNode);
            } else if (node[subNode.name][subNode.id] === undefined) {
                node[subNode.name][subNode.id] = subNode;
            }
        }

    }

    public parseProperty(reader: BinaryReader) {
        var type = reader.getString(1);
        switch (type) {
            case 'C':
                return reader.getBoolean();
            case 'D':
                return reader.getFloat64();
            case 'F':
                return reader.getFloat32();
            case 'I':
                return reader.getInt32();
            case 'L':
                return reader.getInt64();
            case 'R':
                var length = reader.getUint32();
                return reader.getArrayBuffer(length);
            case 'S':
                var length = reader.getUint32();
                return reader.getString(length);
            case 'Y':
                return reader.getInt16();
            case 'b':
            case 'c':
            case 'd':
            case 'f':
            case 'i':
            case 'l':
                var arrayLength = reader.getUint32();
                var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
                var compressedLength = reader.getUint32();
                if (encoding === 0) {
                    switch (type) {
                        case 'b':
                        case 'c':
                            return reader.getBooleanArray(arrayLength);
                        case 'd':
                            return reader.getFloat64Array(arrayLength);
                        case 'f':
                            return reader.getFloat32Array(arrayLength);
                        case 'i':
                            return reader.getInt32Array(arrayLength);
                        case 'l':
                            return reader.getInt64Array(arrayLength);
                    }
                }

                if (typeof Zlib === 'undefined') {
                    console.error('THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js');
                }

                var inflate = new Zlib.Inflate(new Uint8Array(reader.getArrayBuffer(compressedLength))); // eslint-disable-line no-undef
                var reader2 = new BinaryReader(inflate.decompress().buffer);
                switch (type) {
                    case 'b':
                    case 'c':
                        return reader2.getBooleanArray(arrayLength);
                    case 'd':
                        return reader2.getFloat64Array(arrayLength);
                    case 'f':
                        return reader2.getFloat32Array(arrayLength);
                    case 'i':
                        return reader2.getInt32Array(arrayLength);
                    case 'l':
                        return reader2.getInt64Array(arrayLength);
                }
                break;
            default:
                throw new Error('THREE.FBXLoader: Unknown property type ' + type);
        }
    }



}


export class BinaryReader {

    private dv: any;
    private offset: number;
    private littleEndian: any;

    public constructor(buffer: any, littleEndian?: any) {
        this.dv = new DataView(buffer);
        this.offset = 0;
        this.littleEndian = (littleEndian !== undefined) ? littleEndian : true;
    }


    public getOffset(): number {
        return this.offset;
    }


    public size() {
        return this.dv.buffer.byteLength;
    }

    public skip(length: number) {
        this.offset += length;
    }

    public getBoolean(): boolean {
        return (this.getUint8() & 1) === 1;
    }

    public getBooleanArray(size: number) {
        var a = [];
        for (var i = 0; i < size; i++) {
            a.push(this.getBoolean());
        }
        return a;
    }

    public getUint8() {
        var value = this.dv.getUint8(this.offset);
        this.offset += 1;
        return value;
    }

    public getInt16() {
        var value = this.dv.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    public getInt32() {
        var value = this.dv.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    public getInt32Array(size: number) {
        var a = [];
        for (var i = 0; i < size; i++) {
            a.push(this.getInt32());
        }
        return a;
    }

    public getUint32() {
        var value = this.dv.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    public getInt64() {
        var low, high;
        if (this.littleEndian) {
            low = this.getUint32();
            high = this.getUint32();
        } else {
            high = this.getUint32();
            low = this.getUint32();
        }

        // calculate negative value
        if (high & 0x80000000) {
            high = ~high & 0xFFFFFFFF;
            low = ~low & 0xFFFFFFFF;
            if (low === 0xFFFFFFFF) high = (high + 1) & 0xFFFFFFFF;
            low = (low + 1) & 0xFFFFFFFF;
            return - (high * 0x100000000 + low);
        }
        return high * 0x100000000 + low;
    }

    public getInt64Array(size: number) {
        var a = [];
        for (var i = 0; i < size; i++) {
            a.push(this.getInt64());
        }
        return a;
    }

    public getUint64() {
        var low, high;
        if (this.littleEndian) {
            low = this.getUint32();
            high = this.getUint32();
        } else {
            high = this.getUint32();
            low = this.getUint32();
        }
        return high * 0x100000000 + low;
    }

    public getFloat32() {
        var value = this.dv.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;

    }

    public getFloat32Array(size: number) {
        var a = [];
        for (var i = 0; i < size; i++) {
            a.push(this.getFloat32());
        }
        return a;
    }

    public getFloat64() {
        var value = this.dv.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
    }

    public getFloat64Array(size: number) {
        var a = [];
        for (var i = 0; i < size; i++) {
            a.push(this.getFloat64());
        }
        return a;
    }

    public getArrayBuffer(size: number) {
        var value = this.dv.buffer.slice(this.offset, this.offset + size);
        this.offset += size;
        return value;
    }

    public getString(size: number) {
        // note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
        var a = [];
        for (var i = 0; i < size; i++) {
            a[i] = this.getUint8();
        }

        var nullByte = a.indexOf(0);
        if (nullByte >= 0) a = a.slice(0, nullByte);
        return LoaderUtils.decodeText(new Uint8Array(a));
    }


}


