import { FBXTree } from "./FBXTree";
import { LoaderUtils } from "./LoaderUtils";

export class TextParser {

    private allNodes!: FBXTree;
    private currentIndent: number = 0;
    private nodeStack: any = [];
    private currentProp: any = [];

    private currentPropName: any = '';

    constructor() {

    }

    public getPrevNode() {
        return this.nodeStack[this.currentIndent - 2];
    }

    public getCurrentNode() {
        return this.nodeStack[this.currentIndent - 1];
    }

    public getCurrentProp() {
        return this.currentProp;
    }

    public pushStack(node: any) {
        this.nodeStack.push(node);
        this.currentIndent += 1;
    }

    public popStack() {
        this.nodeStack.pop();
        this.currentIndent -= 1;
    }

    public setCurrentProp(val: any, name: string) {
        this.currentProp = val;
        this.currentPropName = name;
    }

    public parse(text: string) {

        this.currentIndent = 0;

        this.allNodes = new FBXTree();
        this.nodeStack = [];
        this.currentProp = [];
        this.currentPropName = '';

        var self = this;

        var split = text.split(/[\r\n]+/);

        split.forEach(function (line, i) {

            var matchComment = line.match(/^[\s\t]*;/);
            var matchEmpty = line.match(/^[\s\t]*$/);

            if (matchComment || matchEmpty) return;

            var matchBeginning = line.match('^\\t{' + self.currentIndent + '}(\\w+):(.*){');
            var matchProperty = line.match('^\\t{' + (self.currentIndent) + '}(\\w+):[\\s\\t\\r\\n](.*)');
            var matchEnd = line.match('^\\t{' + (self.currentIndent - 1) + '}}');

            if (matchBeginning) {
                self.parseNodeBegin(line, matchBeginning);
            } else if (matchProperty) {
                self.parseNodeProperty(line, matchProperty, split[++i]);
            } else if (matchEnd) {
                self.popStack();
            } else if (line.match(/^[^\s\t}]/)) {
                // large arrays are split over multiple lines terminated with a ',' character
                // if this is encountered the line needs to be joined to the previous line
                self.parseNodePropertyContinued(line);
            }
        });
        return this.allNodes;
    }

    public parseNodeBegin(line: string, property: any) {
        var nodeName = property[1].trim().replace(/^"/, '').replace(/"$/, '');
        var nodeAttrs = property[2].split(',').map(function (attr: string) {
            return attr.trim().replace(/^"/, '').replace(/"$/, '');
        });

        var node: any = { name: nodeName };
        var attrs = this.parseNodeAttr(nodeAttrs);
        var currentNode = this.getCurrentNode();
        // a top node
        if (this.currentIndent === 0) {
            this.allNodes.add(nodeName, node);
        } else { // a subnode
            // if the subnode already exists, append it
            if (nodeName in currentNode) {
                // special case Pose needs PoseNodes as an array
                if (nodeName === 'PoseNode') {
                    currentNode.PoseNode.push(node);
                } else if (currentNode[nodeName].id !== undefined) {
                    currentNode[nodeName] = {};
                    currentNode[nodeName][currentNode[nodeName].id] = currentNode[nodeName];
                }
                if (attrs.id !== '') currentNode[nodeName][attrs.id] = node;
            } else if (typeof attrs.id === 'number') {
                currentNode[nodeName] = {};
                currentNode[nodeName][attrs.id] = node;
            } else if (nodeName !== 'Properties70') {
                if (nodeName === 'PoseNode') currentNode[nodeName] = [node];
                else currentNode[nodeName] = node;
            }
        }

        if (typeof attrs.id === 'number') node.id = attrs.id;
        if (attrs.name !== '') node.attrName = attrs.name;
        if (attrs.type !== '') node.attrType = attrs.type;

        this.pushStack(node);
    }

    public parseNodeAttr(attrs: any) {
        var id = attrs[0];
        if (attrs[0] !== '') {
            id = parseInt(attrs[0]);
            if (isNaN(id)) {
                id = attrs[0];
            }
        }
        var name = '', type = '';
        if (attrs.length > 1) {
            name = attrs[1].replace(/^(\w+)::/, '');
            type = attrs[2];
        }
        return { id: id, name: name, type: type };
    }

    public parseNodeProperty(line: string, property: any, contentLine: string) {
        var propName = property[1].replace(/^"/, '').replace(/"$/, '').trim();
        var propValue = property[2].replace(/^"/, '').replace(/"$/, '').trim();
        // for special case: base64 image data follows "Content: ," line
        //	Content: ,
        //	 "/9j/4RDaRXhpZgAATU0A..."
        if (propName === 'Content' && propValue === ',') {
            propValue = contentLine.replace(/"/g, '').replace(/,$/, '').trim();
        }

        var currentNode = this.getCurrentNode();
        var parentName = currentNode.name;
        if (parentName === 'Properties70') {
            this.parseNodeSpecialProperty(line, propName, propValue);
            return;
        }

        // Connections
        if (propName === 'C') {
            var connProps = propValue.split(',').slice(1);
            var from = parseInt(connProps[0]);
            var to = parseInt(connProps[1]);
            var rest = propValue.split(',').slice(3);
            rest = rest.map(function (elem: string) {
                return elem.trim().replace(/^"/, '');
            });
            propName = 'connections';
            propValue = [from, to];
            LoaderUtils.append(propValue, rest);
            if (currentNode[propName] === undefined) {
                currentNode[propName] = [];
            }
        }

        // Node
        if (propName === 'Node') currentNode.id = propValue;

        // connections
        if (propName in currentNode && Array.isArray(currentNode[propName])) {
            currentNode[propName].push(propValue);
        } else {
            if (propName !== 'a')
                currentNode[propName] = propValue;
            else
                currentNode.a = propValue;
        }
        this.setCurrentProp(currentNode, propName);
        // convert string to array, unless it ends in ',' in which case more will be added to it
        if (propName === 'a' && propValue.slice(- 1) !== ',') {
            currentNode.a = LoaderUtils.parseNumberArray(propValue);
        }
    }

    public parseNodePropertyContinued(line: string) {
        var currentNode = this.getCurrentNode();
        currentNode.a += line;
        // if the line doesn't end in ',' we have reached the end of the property value
        // so convert the string to an array
        if (line.slice(- 1) !== ',') {
            currentNode.a = LoaderUtils.parseNumberArray(currentNode.a);
        }
    }

    // parse "Property70"
    public parseNodeSpecialProperty(line: string, propName: string, propValue: any) {
        // split this
        // P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
        // into array like below
        // ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
        var props = propValue.split('",').map(function (prop: string) {
            return prop.trim().replace(/^\"/, '').replace(/\s/, '_');
        });

        var innerPropName = props[0];
        var innerPropType1 = props[1];
        var innerPropType2 = props[2];
        var innerPropFlag = props[3];
        var innerPropValue = props[4];

        // cast values where needed, otherwise leave as strings
        switch (innerPropType1) {
            case 'int':
            case 'enum':
            case 'bool':
            case 'ULongLong':
            case 'double':
            case 'Number':
            case 'FieldOfView':
                innerPropValue = parseFloat(innerPropValue);
                break;

            case 'Color':
            case 'ColorRGB':
            case 'Vector3D':
            case 'Lcl_Translation':
            case 'Lcl_Rotation':
            case 'Lcl_Scaling':
                innerPropValue = LoaderUtils.parseNumberArray(innerPropValue);
                break;
        }

        // CAUTION: these props must append to parent's parent
        this.getPrevNode()[innerPropName] = {
            'type': innerPropType1,
            'type2': innerPropType2,
            'flag': innerPropFlag,
            'value': innerPropValue
        };
        this.setCurrentProp(this.getPrevNode(), innerPropName);
    }








}