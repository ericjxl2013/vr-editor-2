import { Panel, Label, Progress, Element, TextField, Button, TextAreaField, Slider, NumberField, Checkbox, ColorField, ImageField, Code, SelectField, TopElementPanel } from "../../ui";
import { VeryEngine } from "../../engine";
import { Observer } from "../../lib";
import { Config } from "../global";

export class AttributesPanel {


    public root: TopElementPanel;

    // private inspectedItems: EventHandle[] = [];

    public title: string = '属性面板';

    public constructor() {
        this.root = VeryEngine.attributes;

        let self = this;

        let clearPanel = () => {
            editor.emit('attributes:beforeClear');
            // console.warn(this.root);
            // console.log('clear panel');
            this.root.clear();
            editor.emit('attributes:clear');
        };

        // set header
        editor.method('attributes:header', (text: string) => {
            if (text.toLowerCase() === 'texture') {
                text = '贴图';
            } else if (text.toLowerCase() === 'material') {
                text = '材质';
            } else if (text.toLowerCase() === 'model') {
                text = '模型';
            } else if (text.toLowerCase() === 'folder') {
                text = '文件夹';
            }
            self.root.headerText = text;
        });

        // return root panel
        editor.method('attributes.rootPanel', function () {
            return self.root;
        });

        // add panel
        editor.method('attributes:addPanel', function (args: AddPanelArgs) {
            args = args || {};

            // panel
            let panel = new Panel(args.name || '');
            // parent
            (args.parent || self.root).append(panel);

            // folding
            panel.foldable = args.foldable || args.folded || false;
            panel.folded = args.folded || false;

            return panel;
        });

        // TODO
        var historyState = function (item: any, state: boolean) {
            if (item.history !== undefined) {
                if (typeof (item.history) === 'boolean') {
                    item.history = state;
                } else {
                    item.history.enabled = state;
                }
            } else {
                if (item._parent && item._parent.history !== undefined) {
                    item._parent.history.enabled = state;
                }
            }
        };

        // get the right path from args
        var pathAt = function (args: any, index: number) {
            return (args.paths && args.paths.length > 0) ? args.paths[index] : args.path;
        };

        editor.method('attributes:linkField', function (args: any) {
            var changeField, changeFieldQueue;
            args.field._changing = false;
            var events: any = [];

            if (!(args.link instanceof Array))
                args.link = [args.link];

            var update = function () {
                var different = false;
                var path = pathAt(args, 0);
                // console.log(args.link[0].has(path));
                // console.log(args.link[0].get(path));
                // console.error(args.link[0].get('rotation'));
                // console.error(args.link[0].has('rotation.0'));
                // console.error(args.link[0].has('rotation'));


                var value = args.link[0].has(path) ? args.link[0].get(path) : undefined;
                // console.warn(args.link[0]);
                // console.warn('path: ' + path);
                // console.warn(value);
                if (args.type === 'rgb') {
                    if (value) {
                        for (var i = 1; i < args.link.length; i++) {
                            path = pathAt(args, i);
                            if (!value.equals(args.link[i].get(path))) {
                                value = null;
                                different = true;
                                break;
                            }
                        }
                    }
                    if (value) {
                        value = value.map(function (v: number) {
                            return Math.floor(v * 255);
                        });
                    }
                } else if (args.type === 'asset') {
                    var countUndefined = value === undefined ? 1 : 0;
                    for (var i = 1; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (!args.link[i].has(path)) {
                            countUndefined++;
                            continue;
                        }

                        var val = args.link[i].get(path);

                        if ((value || 0) !== (args.link[i].get(path) || 0)) {
                            if (value !== undefined) {
                                value = args.enum ? '' : null;
                                different = true;
                                break;
                            }
                        }

                        value = val;
                    }

                    if (countUndefined && countUndefined != args.link.length) {
                        args.field.class.add('star');
                        if (! /^\* /.test(args.field._title.text))
                            args.field._title.text = '* ' + args.field._title.text;
                    } else {
                        args.field.class.remove('star');
                        if (/^\* /.test(args.field._title.text))
                            args.field._title.text = args.field._title.text.substring(2);
                    }

                    if (different) {
                        args.field.class.add('null');
                        args.field._title.text = 'various';
                    } else {
                        args.field.class.remove('null');
                    }
                } else if (args.type === 'entity' || !args.type) {
                    for (var i = 1; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (value !== args.link[i].get(path)) {
                            value = 'various';
                            different = true;
                            break;
                        }
                    }
                    if (different) {
                        args.field.class.add('null');
                        args.field.text = 'various';
                    } else {
                        args.field.class.remove('null');
                    }
                } else {
                    // console.error(value);
                    // console.error(args.link);
                    // var valueFound = false;
                    // for (var i = 0; i < args.link.length; i++) {
                    //     path = pathAt(args, i);
                    //     console.error(path);
                    //     if (!args.link[i].has(path))
                    //         continue;

                    //     if (!valueFound) {
                    //         console.error(path);
                    //         valueFound = true;
                    //         value = args.link[i].get(path);
                    //     } else {

                    //         var v = args.link[i].get(path);
                    //         console.error(args.link[i]);
                    //         console.error(v);
                    //         if ((value || 0) !== (v || 0)) {
                    //             value = args.enum ? '' : null;
                    //             different = true;
                    //             break;
                    //         }
                    //     }
                    // }
                    // console.error(value);
                }

                args.field._changing = true;
                args.field.value = value;


                if (args.type === 'checkbox')
                    args.field._onLinkChange(value);

                args.field._changing = false;

                // TODO
                // if (args.enum) {
                //     var opt = args.field.optionElements[''];
                //     if (opt) opt.style.display = value !== '' ? 'none' : '';
                // } else {
                //     args.field.proxy = value == null ? '...' : null;
                // }
            };

            changeField = function (value: any) {
                if (args.field._changing)
                    return;

                // TODO
                if (args.enum) {
                    // var opt = this.optionElements[''];
                    // if (opt) opt.style.display = value !== '' ? 'none' : '';
                } else {
                    // this.proxy = value === null ? '...' : null;
                }

                if (args.trim)
                    value = value.trim();

                if (args.type === 'rgb') {
                    // console.error(value);
                    value = value.map(function (v: number) {
                        return v / 255;
                    });
                } else if (args.type === 'asset') {
                    args.field.class.remove('null');
                }

                var items: any = [];

                // set link value
                args.field._changing = true;
                if (args.type === 'string' && args.trim)
                    args.field.value = value;

                for (var i = 0; i < args.link.length; i++) {
                    var path = pathAt(args, i);
                    if (!args.link[i].has(path)) continue;

                    items.push({
                        get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                        item: args.link[i],
                        value: args.link[i].has(path) ? args.link[i].get(path) : undefined
                    });

                    historyState(args.link[i], false);
                    args.link[i].set(path, value);
                    historyState(args.link[i], true);
                }
                args.field._changing = false;

                // history
                if (args.type !== 'rgb' && !args.slider && !args.stopHistory) {
                    editor.call('history:add', {
                        name: pathAt(args, 0),
                        undo: function () {
                            var different = false;
                            for (var i = 0; i < items.length; i++) {
                                var path = pathAt(args, i);
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                if (!different && items[0].value !== items[i].value)
                                    different = true;

                                historyState(item, false);
                                if (items[i].value === undefined)
                                    item.unset(path);
                                else
                                    item.set(path, items[i].value);
                                historyState(item, true);
                            }

                            if (different) {
                                args.field.class.add('null');
                            } else {
                                args.field.class.remove('null');
                            }
                        },
                        redo: function () {
                            for (var i = 0; i < items.length; i++) {
                                var path = pathAt(args, i);
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                historyState(item, false);
                                if (value === undefined)
                                    item.unset(path);
                                else
                                    item.set(path, value);
                                item.set(path, value);
                                historyState(item, true);
                            }

                            args.field.class.remove('null');
                        }
                    });
                }
            };

            changeFieldQueue = function () {
                // console.log('changeFieldQueue');

                if (args.field._changing)
                    return;

                args.field._changing = true;
                setTimeout(function () {
                    args.field._changing = false;
                    update();
                }, 0);
            };

            var historyStart: any, historyEnd: any;

            if (args.type === 'rgb' || args.slider) {
                historyStart = function () {
                    var items = [];

                    for (var i = 0; i < args.link.length; i++) {
                        var v = args.link[i].get(pathAt(args, i));
                        if (v instanceof Array)
                            v = v.slice(0);

                        items.push({
                            get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                            item: args.link[i],
                            value: v
                        });
                    }

                    return items;
                };

                historyEnd = function (items: any, value: any) {
                    // history
                    editor.call('history:add', {
                        name: pathAt(args, 0),
                        undo: function () {
                            for (var i = 0; i < items.length; i++) {
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                historyState(item, false);
                                item.set(pathAt(args, i), items[i].value);
                                historyState(item, true);
                            }
                        },
                        redo: function () {
                            for (var i = 0; i < items.length; i++) {
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                historyState(item, false);
                                item.set(pathAt(args, i), value);
                                historyState(item, true);
                            }
                        }
                    });
                };
            }

            if (args.type === 'rgb') {
                var colorPickerOn = false;
                events.push(args.field.on('click', function () {
                    colorPickerOn = true;

                    // set picker color
                    editor.call('picker:color', args.field.value);

                    var items: any = [];

                    // picking starts
                    var evtColorPickStart = editor.on('picker:color:start', function () {
                        items = historyStart();
                    });

                    // picked color
                    var evtColorPick = editor.on('picker:color', function (color: any) {
                        // console.error(color);
                        args.field.value = color;
                    });

                    var evtColorPickEnd = editor.on('picker:color:end', function () {
                        historyEnd(items.slice(0), args.field.value.map(function (v: number) {
                            return v / 255;
                        }));
                    });

                    // position picker
                    var rectPicker = editor.call('picker:color:rect');
                    var rectField = args.field.element.getBoundingClientRect();
                    editor.call('picker:color:position', rectField.left - rectPicker.width, rectField.top);

                    // color changed, update picker
                    var evtColorToPicker = args.field.on('change', function () {
                        // TODO
                        editor.call('picker:color:set', args.field.value);
                    });

                    // picker closed
                    editor.once('picker:color:close', function () {
                        evtColorPick.unbind();
                        evtColorPickStart.unbind();
                        evtColorPickEnd.unbind();
                        evtColorToPicker.unbind();
                        colorPickerOn = false;
                        args.field.element.focus();
                    });
                }));

                // close picker if field destroyed
                args.field.once('destroy', function () {
                    if (colorPickerOn)
                        editor.call('picker:color:close');
                });
            } else if (args.slider) {
                var sliderRecords: any;

                events.push(args.field.on('start', function () {
                    sliderRecords = historyStart();
                }));

                events.push(args.field.on('end', function () {
                    historyEnd(sliderRecords.slice(0), args.field.value);
                }));
            }

            update();
            events.push(args.field.on('change', changeField));
            // 数据关联设置入口
            for (var i = 0; i < args.link.length; i++) {
                events.push(args.link[i].on(pathAt(args, i) + ':set', changeFieldQueue));
                events.push(args.link[i].on(pathAt(args, i) + ':unset', changeFieldQueue));
            }
            events.push(args.field.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
            }));
            // ?历史记录回溯用?
            return events;
        });

        // add field
        editor.method('attributes:addField', function (args: any) {

            // parent panel，父物体
            var panel = args.panel;

            if (!panel) {
                panel = new Panel();
                panel.flexWrap = 'nowrap';
                panel.WebkitFlexWrap = 'nowrap';
                panel.style.display = '';
                panel.innerElement.style.display = 'flex';

                if (args.type) {
                    panel.class.add('field-' + args.type);
                } else {
                    panel.class.add('field');
                }

                (args.parent || self.root).append(panel);
            }

            var label: Nullable<Label> = null;
            if (args.name) {
                label = new Label(args.name);
                label.class!.add('label-field');
                panel._label = label;
                panel.append(label);

                // 帮助链接
                if (args.reference) {
                    var tooltip = label.tooltip = editor.call('attributes:reference', {
                        element: label.element,
                        title: args.reference.title,
                        subTitle: args.reference.subTitle,
                        description: args.reference.description
                    });

                    tooltip.attach({
                        target: label,
                        element: label.element
                    });
                }
            }

            var field: any;

            args.linkEvents = [];

            // if we provide multiple paths for a single Observer then turn args.link into an array
            if (args.paths && args.paths instanceof Array && args.link && !(args.link instanceof Array)) {
                var link = args.link;
                args.link = [];
                for (var i = 0; i < args.paths.length; i++) {
                    args.link.push(link);
                }
            }

            // link数据模型与UI
            var linkField = args.linkField = function () {
                if (args.link) {
                    var link = function (field: any, path?: any) {
                        var data = {
                            field: field,
                            type: args.type,
                            slider: args.slider,
                            enum: args.enum,
                            link: args.link,
                            trim: args.trim,
                            name: args.name,
                            stopHistory: args.stopHistory,
                            paths: new Array<any>(),
                            path: ''
                        };

                        if (!path) {
                            path = args.paths || args.path;
                        }

                        if (path instanceof Array) {
                            data.paths = path;
                        } else {
                            data.path = path;
                        }

                        // console.log(data);

                        args.linkEvents = args.linkEvents.concat(editor.call('attributes:linkField', data));
                        // console.log(data);
                        // console.warn(args.linkEvents);

                        // Give the field a uniquely addressable css class that we can target from Selenium
                        if (field.element && typeof path === 'string') {
                            field.element.classList.add('field-path-' + path.replace(/\./g, '-'));
                        }
                    };

                    if (field instanceof Array) {
                        for (var i = 0; i < field.length; i++) {
                            var paths = args.paths;

                            if (paths) {
                                paths = paths.map(function (p: string) {
                                    return p + '.' + i.toString();
                                });
                            }

                            // console.error(field[i]);
                            // console.error(paths || (args.path + '.' + i));

                            // vec3类型在这里path添加后缀
                            link(field[i], paths || (args.path + '.' + i));
                        }
                    } else {
                        link(field);
                    }
                }
            };

            var unlinkField = args.unlinkField = function () {
                for (var i = 0; i < args.linkEvents.length; i++)
                    args.linkEvents[i].unbind();

                args.linkEvents = [];
            };


            switch (args.type) {
                case 'string':
                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum
                        });
                    } else {
                        field = new TextField();
                    }

                    field.value = args.value || '';
                    field.flexGrow = 1;

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    linkField();

                    panel.append(field);
                    break;

                case 'tags':
                    // TODO: why isn't this in a seperate class/file???

                    var innerPanel = new Panel();
                    var tagType = args.tagType || 'string';

                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum,
                            type: tagType
                        });
                        field.renderChanges = false;
                        field.on('change', function (value: string) {
                            if (tagType === 'string') {
                                if (!value) return;

                                value = value.trim();
                            }

                            addTag(value);
                            field.value = '';
                        });

                        innerPanel.append(field);

                    } else {
                        field = new TextField();
                        field.blurOnEnter = false;
                        field.renderChanges = false;

                        field.element.addEventListener('keydown', function (evt: KeyboardEvent) {
                            if (evt.keyCode !== 13 || !field.value)
                                return;

                            addTag(field.value.trim());
                            field.value = '';
                        });

                        innerPanel.append(field);

                        var btnAdd = new Button('&#57632');
                        btnAdd.flexGrow = '0';
                        btnAdd.on('click', function () {
                            if (!field.value)
                                return;

                            addTag(field.value.trim());
                            field.value = '';
                        });
                        innerPanel.append(btnAdd);
                    }


                    var tagsPanel = new Panel();
                    tagsPanel.class!.add('tags');
                    tagsPanel.flex = true;
                    innerPanel.append(tagsPanel);

                    var tagItems: { [key: string]: HTMLElement } = {};
                    var tagIndex: { [key: string]: number } = {};
                    var tagList: any = [];


                    var removeTag = function (tag: string) {
                        if (tagType === 'string' && !tag) {
                            return;
                        } else if (tag === null || tag === undefined) {
                            return;
                        }

                        if (!tagIndex.hasOwnProperty(tag))
                            return;

                        var records: any = [];

                        for (var i = 0; i < args.link.length; i++) {
                            var path = pathAt(args, i);
                            if (args.link[i].get(path).indexOf(tag) === -1)
                                continue;

                            records.push({
                                get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                                item: args.link[i],
                                path: path,
                                value: tag
                            });

                            historyState(args.link[i], false);
                            args.link[i].removeValue(path, tag);
                            historyState(args.link[i], true);
                        }

                        if (!args.stopHistory) {
                            editor.call('history:add', {
                                name: pathAt(args, 0),
                                undo: function () {
                                    for (var i = 0; i < records.length; i++) {
                                        var item;
                                        if (records[i].get) {
                                            item = records[i].get();
                                            if (!item)
                                                continue;
                                        } else {
                                            item = records[i].item;
                                        }

                                        historyState(item, false);
                                        item.insert(records[i].path, records[i].value);
                                        historyState(item, true);
                                    }
                                },
                                redo: function () {
                                    for (var i = 0; i < records.length; i++) {
                                        var item;
                                        if (records[i].get) {
                                            item = records[i].get();
                                            if (!item)
                                                continue;
                                        } else {
                                            item = records[i].item;
                                        }

                                        historyState(item, false);
                                        item.removeValue(records[i].path, records[i].value);
                                        historyState(item, true);
                                    }
                                }
                            });
                        }
                    };

                    var addTag = function (tag: string) {
                        var records: any = [];
                        let tagNumber: number = 0;

                        // convert to number if needed
                        if (args.tagType === 'number') {
                            tagNumber = parseInt(tag, 10);
                            if (isNaN(tagNumber))
                                return;
                        }

                        for (var i = 0; i < args.link.length; i++) {
                            var path = pathAt(args, i);
                            if (args.link[i].get(path).indexOf(tagNumber) !== -1)
                                continue;

                            records.push({
                                get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                                item: args.link[i],
                                path: path,
                                value: tagNumber
                            });

                            historyState(args.link[i], false);
                            args.link[i].insert(path, tagNumber);
                            historyState(args.link[i], true);
                        }

                        if (!args.stopHistory) {
                            editor.call('history:add', {
                                name: pathAt(args, 0),
                                undo: function () {
                                    for (var i = 0; i < records.length; i++) {
                                        var item;
                                        if (records[i].get) {
                                            item = records[i].get();
                                            if (!item)
                                                continue;
                                        } else {
                                            item = records[i].item;
                                        }

                                        historyState(item, false);
                                        item.removeValue(records[i].path, records[i].value);
                                        historyState(item, true);
                                    }
                                },
                                redo: function () {
                                    for (var i = 0; i < records.length; i++) {
                                        var item;
                                        if (records[i].get) {
                                            item = records[i].get();
                                            if (!item)
                                                continue;
                                        } else {
                                            item = records[i].item;
                                        }

                                        historyState(item, false);
                                        item.insert(records[i].path, records[i].value);
                                        historyState(item, true);
                                    }
                                }
                            });
                        }
                    };

                    var onInsert = function (tag: string) {
                        if (!tagIndex.hasOwnProperty(tag)) {
                            tagIndex[tag] = 0;
                            tagList.push(tag);
                        }

                        tagIndex[tag]++;
                        insertElement(tag);
                    };

                    var onRemove = function (tag: string) {
                        if (!tagIndex[tag])
                            return;

                        tagIndex[tag]--;

                        if (!tagIndex[tag]) {
                            tagsPanel.innerElement!.removeChild(tagItems[tag]);
                            var ind = tagList.indexOf(tag);
                            if (ind !== -1)
                                tagList.splice(ind, 1);

                            delete tagItems[tag];
                            delete tagIndex[tag];
                        } else {
                            if (tagIndex[tag] === args.link.length) {
                                tagItems[tag].classList.remove('partial');
                            } else {
                                tagItems[tag].classList.add('partial');
                            }
                        }
                    };

                    // when tag field is initialized
                    var onSet = function (values: string[]) {
                        for (var i = 0; i < values.length; i++) {
                            var value = values[i];
                            onInsert(value);
                        }
                    };

                    var insertElement = function (tag: string) {
                        if (!tagItems[tag]) {
                            sortTags();

                            var item = document.createElement('div');
                            tagItems[tag] = item;
                            item.classList.add('tag');
                            var itemText = document.createElement('span');
                            itemText.textContent = args.tagToString ? args.tagToString(tag) : tag;
                            item.appendChild(itemText);

                            // the original tag value before tagToString is called. Useful
                            // if the tag value is an id for example
                            // item.originalValue = tag;

                            // attach click handler on text part of the tag - bind the listener
                            // to the tag item so that `this` refers to that tag in the listener
                            if (args.onClickTag) {
                                itemText.addEventListener('click', args.onClickTag.bind(item));
                            }

                            var icon = document.createElement('span');
                            icon.innerHTML = '&#57650;';
                            icon.classList.add('icon');
                            // icon.tag = tag;
                            icon.addEventListener('click', function () {
                                if (innerPanel.disabled)
                                    return;

                                // removeTag(icon.tag);
                            }, false);
                            item.appendChild(icon);

                            var ind = tagList.indexOf(tag);
                            if (tagItems[tagList[ind + 1]]) {
                                tagsPanel.appendBefore(item, tagItems[tagList[ind + 1]]);
                            } else {
                                tagsPanel.append(item);
                            }
                        }

                        if (tagIndex[tag] === args.link.length) {
                            tagItems[tag].classList.remove('partial');
                        } else {
                            tagItems[tag].classList.add('partial');
                        }
                    };

                    var sortTags = function () {
                        tagList.sort(function (a: string, b: string) {
                            if (args.tagToString) {
                                a = args.tagToString(a);
                                b = args.tagToString(b);
                            }

                            if (a > b) {
                                return 1;
                            } else if (a < b) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                    };

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    // list
                    args.linkEvents = [];

                    args.linkField = function () {
                        if (args.link) {
                            if (!(args.link instanceof Array))
                                args.link = [args.link];

                            for (var i = 0; i < args.link.length; i++) {
                                var path = pathAt(args, i);
                                var tags = args.link[i].get(path);

                                args.linkEvents.push(args.link[i].on(path + ':set', onSet));
                                args.linkEvents.push(args.link[i].on(path + ':insert', onInsert));
                                args.linkEvents.push(args.link[i].on(path + ':remove', onRemove));

                                if (!tags)
                                    continue;

                                for (var t = 0; t < tags.length; t++) {
                                    if (tagType === 'string' && !tags[t]) {
                                        continue;
                                    } else if (tags[t] === null || tags[t] === undefined) {
                                        continue;
                                    }

                                    if (!tagIndex.hasOwnProperty(tags[t])) {
                                        tagIndex[tags[t]] = 0;
                                        tagList.push(tags[t]);
                                    }

                                    tagIndex[tags[t]]++;
                                }
                            }
                        }

                        sortTags();

                        for (var i = 0; i < tagList.length; i++)
                            insertElement(tagList[i]);
                    };

                    args.unlinkField = function () {
                        for (var i = 0; i < args.linkEvents.length; i++)
                            args.linkEvents[i].unbind();

                        args.linkEvents = [];

                        for (var key in tagItems)
                            tagsPanel.innerElement!.removeChild(tagItems[key]);

                        tagList = [];
                        tagIndex = {};
                        tagItems = {};
                    };

                    args.linkField();

                    panel.once('destroy', args.unlinkField);

                    panel.append(innerPanel);
                    break;

                case 'text':
                    field = new TextAreaField();

                    field.value = args.value || '';
                    field.flexGrow = 1;

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    linkField();

                    panel.append(field);
                    break;

                case 'number':
                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum,
                            type: 'number'
                        });
                    } else if (args.slider) {
                        field = new Slider();
                    } else {
                        field = new NumberField();
                    }

                    field.value = args.value || 0;
                    field.flexGrow = 1;

                    if (args.allowNull) {
                        field.allowNull = true;
                    }

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    if (args.precision != null)
                        field.precision = args.precision;

                    if (args.step != null)
                        field.step = args.step;

                    if (args.min != null)
                        field.min = args.min;

                    if (args.max != null)
                        field.max = args.max;

                    linkField();

                    panel.append(field);
                    break;

                case 'checkbox':
                    // 多项选择
                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum,
                            type: 'boolean'
                        });
                        field.flexGrow = 1;
                    } else {
                        field = new Checkbox();
                    }

                    field.value = args.value || 0;
                    field.class.add('tick');

                    linkField();

                    panel.append(field);
                    break;

                case 'vec2':
                case 'vec3':
                case 'vec4':
                    // 长度是2、是3还是4
                    var channels = parseInt(args.type[3], 10);
                    field = [];

                    for (var i = 0; i < channels; i++) {
                        field[i] = new NumberField();
                        field[i].flexGrow = 1;
                        field[i].style.width = '24px';
                        field[i].value = (args.value && args.value[i]) || 0;
                        panel.append(field[i]);

                        if (args.placeholder)
                            field[i].placeholder = args.placeholder[i];

                        if (args.precision != null)
                            field[i].precision = args.precision;

                        if (args.step != null)
                            field[i].step = args.step;

                        if (args.min != null)
                            field[i].min = args.min;

                        if (args.max != null)
                            field[i].max = args.max;

                        // if (args.link)
                        //     field[i].link(args.link, args.path + '.' + i);
                    }

                    linkField();
                    break;
                case 'rgb':
                    field = new ColorField();

                    if (args.channels != null)
                        field.channels = args.channels;

                    linkField();

                    // console.log(field.channels);
                    // console.log(field.value);

                    var colorPickerOn = false;
                    field.on('click', function () {
                        colorPickerOn = true;
                        var first = true;

                        // set picker color
                        editor.call('picker:color', field.value);

                        // picking starts
                        var evtColorPickStart = editor.on('picker:color:start', function () {
                            first = true;
                        });

                        // picked color
                        var evtColorPick = editor.on('picker:color', function (color: number[]) {
                            first = false;
                            field.value = color;
                            // console.log(color);
                        });

                        // position picker
                        var rectPicker = editor.call('picker:color:rect');
                        var rectField = field.element.getBoundingClientRect();
                        editor.call('picker:color:position', rectField.left - rectPicker.width, rectField.top);

                        // color changed, update picker
                        var evtColorToPicker = field.on('change', function () {
                            editor.call('picker:color:set', field.value);
                        });

                        // picker closed
                        editor.once('picker:color:close', function () {
                            evtColorPick.unbind();
                            evtColorPickStart.unbind();
                            evtColorToPicker.unbind();
                            colorPickerOn = false;
                            field.element.focus();
                        });
                    });

                    // close picker if field destroyed
                    field.on('destroy', function () {
                        if (colorPickerOn)
                            editor.call('picker:color:close');
                    });

                    panel.append(field);
                    break;

                case 'asset':
                    // field = new ImageField(args.kind === 'material' || args.kind === 'model' || args.kind === 'cubemap' || args.kind === 'font' || args.kind === 'sprite'
                    // );
                    field = new ImageField();
                    var evtPick: any;

                    if (label !== null) {
                        label.renderChanges = false;
                        field._label = label;

                        label.style!.width = '32px';
                        label.flexGrow = '1';
                    }


                    var panelFields = document.createElement('div');
                    panelFields.classList.add('top');

                    var panelControls = document.createElement('div');
                    panelControls.classList.add('controls');

                    var fieldTitle = field._title = new Label();
                    fieldTitle.text = 'Empty';
                    fieldTitle.parent = panel;
                    fieldTitle.flexGrow = '1';
                    fieldTitle.placeholder = '...';

                    var btnEdit = new Button('&#57648;');
                    btnEdit.disabled = true;
                    btnEdit.parent = panel;
                    btnEdit.flexGrow = '0';

                    var btnRemove = new Button('&#57650;');
                    btnRemove.disabled = true;
                    btnRemove.parent = panel;
                    btnRemove.flexGrow = '0';

                    fieldTitle.on('click', function () {
                        // console.log(field.value);
                        var asset = editor.call('assets:get', field.value);
                        // console.log(asset);
                        editor.call('picker:asset', {
                            type: args.kind,
                            currentAsset: asset
                        });

                        evtPick = editor.once('picker:asset', function (asset: Observer) {
                            var oldValues: { [key: string]: Observer } = {};
                            if (args.onSet && args.link && args.link instanceof Array) {
                                for (var i = 0; i < args.link.length; i++) {
                                    var id = 0;
                                    if (args.link[i]._type === 'asset') {
                                        id = args.link[i].get('id');
                                    } else if (args.link[i]._type === 'entity') {
                                        id = args.link[i].get('resource_id');
                                    } else {
                                        continue;
                                    }

                                    oldValues[id] = args.link[i].get(pathAt(args, i));
                                }
                            }

                            field.emit('beforechange', asset.get('id'));
                            field.value = asset.get('id');
                            evtPick = null;
                            if (args.onSet) args.onSet(asset, oldValues);
                        });

                        editor.once('picker:asset:close', function () {
                            if (evtPick) {
                                evtPick.unbind();
                                evtPick = null;
                            }
                            field.element.focus();
                        });
                    });

                    // TODO: 改
                    field.on('click', function () {
                        // fieldTitle.emit('click');
                        // console.warn('click');
                        // console.warn(field.value);

                        if (!field.value)
                            return;

                        var asset = editor.call('assets:get', field.value);
                        if (!asset) return;
                        editor.call('selector:set', 'asset', [asset]);

                        var path = asset.get('path');
                        if (path.length) {
                            editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                        } else {
                            editor.call('assets:panel:currentFolder', null);
                        }
                    });
                    btnEdit.on('click', function () {
                        field.emit('click');
                        // console.warn('click');
                        // console.warn(field.value);

                        // if (!field.value)
                        //     return;

                        // var asset = editor.call('assets:get', field.value);
                        // if (!asset) return;
                        // editor.call('selector:set', 'asset', [asset]);

                        // var path = asset.get('path');
                        // if (path.length) {
                        //     editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                        // } else {
                        //     editor.call('assets:panel:currentFolder', null);
                        // }
                    });

                    btnRemove.on('click', function () {
                        field.emit('beforechange', null);
                        field.value = null;
                    });

                    var watch: any = null;
                    var watchAsset: any = null;
                    var renderQueued: any;
                    var queueRender: any;

                    var evtThumbnailChange: any;
                    var updateThumbnail = function (empty?: any) {
                        var asset = editor.call('assets:get', field.value);

                        if (watch) {
                            editor.call('assets:' + watchAsset.get('type') + ':unwatch', watchAsset, watch);
                            watchAsset = watch = null;
                        }

                        if (empty) {
                            field.image = '';
                        } else if (!asset) {
                            field.image = '/editor/static/asset-placeholder-texture.png';
                        } else {
                            // console.log(asset);
                            ossfile.getThumbnailUrl(Config.projectID, asset.get('id'), asset.get('name'), asset.get('file.hash')).then(response => {
                                field.image = response;
                            });

                            // if (asset.has('thumbnails.m')) {
                            //     var src = asset.get('thumbnails.m');
                            //     if (src.startsWith('data:image/png;base64')) {
                            //         field.image = asset.get('thumbnails.m');
                            //     } else {
                            //         field.image = asset.get('thumbnails.m').appendQuery('t=' + asset.get('file.hash'));
                            //     }
                            // } else {
                            //     field.image = '/editor/static/asset-placeholder-' + asset.get('type') + '.png';
                            // }

                            if (args.kind === 'material' || args.kind === 'model' || args.kind === 'cubemap' || args.kind == 'font' || args.kind === 'sprite') {
                                watchAsset = asset;
                                watch = editor.call('assets:' + args.kind + ':watch', {
                                    asset: watchAsset,
                                    autoLoad: true,
                                    callback: queueRender
                                });
                            }
                        }

                        if (queueRender)
                            queueRender();
                    };

                    if (args.kind === 'material' || args.kind === 'model' || args.kind === 'font' || args.kind === 'sprite') {
                        if (args.kind !== 'sprite') {
                            field.elementImage.classList.add('flipY');
                        }

                        var renderPreview = function () {
                            renderQueued = false;

                            if (watchAsset) {
                                // render
                                editor.call('preview:render', watchAsset, 128, 128, field.elementImage);
                            } else {
                                var ctx = field.elementImage.ctx;
                                if (!ctx)
                                    ctx = field.elementImage.ctx = field.elementImage.getContext('2d');

                                ctx.clearRect(0, 0, field.elementImage.width, field.elementImage.height);
                            }
                        };

                        renderPreview();

                        queueRender = function () {
                            if (renderQueued) return;
                            renderQueued = true;
                            requestAnimationFrame(renderPreview);
                        };

                        var evtSceneSettings: any = editor.on('preview:scene:changed', queueRender);

                        field.once('destroy', function () {
                            evtSceneSettings.unbind();
                            evtSceneSettings = null;

                            if (watch) {
                                editor.call('assets:' + watchAsset.get('type') + ':unwatch', watchAsset, watch);
                                watchAsset = watch = null;
                            }
                        });
                    } else if (args.kind === 'cubemap') {
                        field.elementImage.width = 60;
                        field.elementImage.height = 60;

                        var positions = [[30, 22], [0, 22], [15, 7], [15, 37], [15, 22], [45, 22]];
                        var images: any = [null, null, null, null, null, null];

                        var renderPreview = function () {
                            renderQueued = false;

                            var ctx = field.elementImage.ctx;
                            if (!ctx)
                                ctx = field.elementImage.ctx = field.elementImage.getContext('2d');

                            ctx.clearRect(0, 0, field.elementImage.width, field.elementImage.height);

                            if (watchAsset) {
                                for (var i = 0; i < 6; i++) {
                                    var id = watchAsset.get('data.textures.' + i);
                                    var image: any = null;

                                    if (id) {
                                        var texture = editor.call('assets:get', id);
                                        if (texture) {
                                            var hash = texture.get('file.hash');
                                            if (images[i] && images[i].hash === hash) {
                                                image = images[i];
                                            } else {
                                                var url = texture.get('thumbnails.s');

                                                if (images[i])
                                                    images[i].onload = null;

                                                images[i] = null;

                                                if (url) {
                                                    image = images[i] = new Image();
                                                    image.hash = hash;
                                                    image.onload = queueRender;
                                                    image.src = url.appendQuery('t=' + hash);
                                                }
                                            }
                                        } else if (images[i]) {
                                            images[i].onload = null;
                                            images[i] = null;
                                        }
                                    } else if (images[i]) {
                                        images[i].onload = null;
                                        images[i] = null;
                                    }

                                    if (image) {
                                        ctx.drawImage(image, positions[i][0], positions[i][1], 15, 15);
                                    } else {
                                        ctx.beginPath();
                                        ctx.rect(positions[i][0], positions[i][1], 15, 15);
                                        ctx.fillStyle = '#000';
                                        ctx.fill();
                                    }
                                }
                            }
                        };

                        renderPreview();

                        queueRender = function () {
                            if (renderQueued) return;
                            renderQueued = true;
                            requestAnimationFrame(renderPreview);
                        };

                        field.once('destroy', function () {
                            if (watch) {
                                editor.call('assets:cubemap:unwatch', watchAsset, watch);
                                watchAsset = watch = null;
                            }
                        });
                    }

                    linkField();

                    var updateField = function () {
                        var value = field.value;

                        fieldTitle.text = field.class.contains('null') ? 'various' : 'Empty';

                        btnEdit.disabled = !value;
                        btnRemove.disabled = !value && !field.class.contains('null');

                        if (evtThumbnailChange) {
                            evtThumbnailChange.unbind();
                            evtThumbnailChange = null;
                        }

                        if (!value) {
                            if (field.class.contains('star'))
                                fieldTitle.text = '* ' + fieldTitle.text;

                            field.empty = true;
                            updateThumbnail(true);

                            return;
                        }

                        field.empty = false;

                        var asset = editor.call('assets:get', value);

                        if (!asset)
                            return updateThumbnail();

                        evtThumbnailChange = asset.on('file.hash.m:set', updateThumbnail);
                        updateThumbnail();

                        fieldTitle.text = asset.get('name');

                        if (field.class.contains('star'))
                            fieldTitle.text = '* ' + fieldTitle.text;
                    };
                    field.on('change', updateField);

                    if (args.value)
                        field.value = args.value;

                    updateField();

                    var dropRef = editor.call('drop:target', {
                        ref: panel.element,
                        filter: function (type: string, data: any) {
                            var rectA = self.root.innerElement!.getBoundingClientRect();
                            var rectB = panel.element.getBoundingClientRect();
                            return data.id && (args.kind === '*' || type === 'asset.' + args.kind) && parseInt(data.id, 10) !== field.value && !editor.call('assets:get', parseInt(data.id, 10)).get('source') && rectB.top > rectA.top && rectB.bottom < rectA.bottom;
                        },
                        drop: function (type: string, data: any) {
                            if ((args.kind !== '*' && type !== 'asset.' + args.kind) || editor.call('assets:get', parseInt(data.id, 10)).get('source'))
                                return;

                            var oldValues: any = {};
                            if (args.onSet && args.link && args.link instanceof Array) {
                                for (var i = 0; i < args.link.length; i++) {
                                    var id = 0;
                                    if (args.link[i]._type === 'asset') {
                                        id = args.link[i].get('id');
                                    } else if (args.link[i]._type === 'entity') {
                                        id = args.link[i].get('resource_id');
                                    } else {
                                        continue;
                                    }

                                    oldValues[id] = args.link[i].get(pathAt(args, i));
                                }
                            }

                            field.emit('beforechange', parseInt(data.id, 10));
                            field.value = parseInt(data.id, 10);

                            if (args.onSet) {
                                var asset = editor.call('assets:get', parseInt(data.id, 10));
                                if (asset) args.onSet(asset, oldValues);
                            }
                        },
                        over: function (type: string, data: any) {
                            if (args.over)
                                args.over(type, data);
                        },
                        leave: function () {
                            if (args.leave)
                                args.leave();
                        }
                    });
                    field.on('destroy', function () {
                        dropRef.unregister();
                        if (evtThumbnailChange) {
                            evtThumbnailChange.unbind();
                            evtThumbnailChange = null;
                        }
                    });

                    // thumbnail
                    panel.append(field);
                    // right side
                    panel.append(panelFields);
                    // controls
                    panelFields.appendChild(panelControls);
                    // label
                    if (label) {
                        panel.innerElement.removeChild(label.element);
                        panelControls.appendChild(label.element!);
                    }
                    panelControls.classList.remove('label-field');
                    // edit
                    panelControls.appendChild(btnEdit.element!);
                    // remove
                    panelControls.appendChild(btnRemove.element!);

                    // title
                    panelFields.appendChild(fieldTitle.element!);
                    break;

                // entity picker
                case 'entity':
                    field = new Label();
                    field.class.add('add-entity');
                    field.flexGrow = 1;
                    field.class.add('null');

                    field.text = 'Select Entity';
                    field.placeholder = '...';

                    panel.append(field);

                    var icon = document.createElement('span');
                    icon.classList.add('icon');

                    icon.addEventListener('click', function (e) {
                        e.stopPropagation();

                        // if (editor.call('permissions:write'))
                        //     field.text = '';
                    });

                    field.on('change', function (value: string) {
                        if (value) {
                            var entity = editor.call('entities:get', value);
                            if (!entity) {
                                field.text = null;
                                return;
                            }

                            field.element.innerHTML = entity.get('name');
                            field.element.appendChild(icon);
                            field.placeholder = '';

                            if (value !== 'various')
                                field.class.remove('null');
                        } else {
                            field.element.innerHTML = 'Select Entity';
                            field.placeholder = '...';
                            field.class.add('null');
                        }
                    });

                    linkField();

                    var getCurrentEntity = function () {
                        var entity = null;
                        if (args.link) {
                            if (!(args.link instanceof Array)) {
                                args.link = [args.link];
                            }

                            // get initial value only if it's the same for all
                            // links otherwise set it to null
                            for (var i = 0, len = args.link.length; i < len; i++) {
                                var val = args.link[i].get(pathAt(args, i));
                                if (entity !== val) {
                                    if (entity) {
                                        entity = null;
                                        break;
                                    } else {
                                        entity = val;
                                    }
                                }
                            }
                        }

                        return entity;
                    };

                    field.on('click', function () {
                        var evtEntityPick: Nullable<EventHandle> = editor.once('picker:entity', function (entity: Observer) {
                            field.text = entity ? entity.get('resource_id') : null;
                            evtEntityPick = null;
                        });

                        var initialValue = getCurrentEntity();

                        editor.call('picker:entity', initialValue, args.filter || null);

                        editor.once('picker:entity:close', function () {
                            if (evtEntityPick) {
                                evtEntityPick.unbind();
                                evtEntityPick = null;
                            }
                        });
                    });

                    // highlight on hover
                    field.on('hover', function () {
                        var entity = getCurrentEntity();
                        if (!entity) return;

                        editor.call('entities:panel:highlight', entity, true);

                        field.once('blur', function () {
                            editor.call('entities:panel:highlight', entity, false);
                        });

                        field.once('click', function () {
                            editor.call('entities:panel:highlight', entity, false);
                        });
                    });

                    var dropRef = editor.call('drop:target', {
                        ref: field.element,
                        filter: function (type: string, data: any) {
                            var rectA = self.root.innerElement!.getBoundingClientRect();
                            var rectB = field.element.getBoundingClientRect();
                            return type === 'entity' && data.resource_id !== field.value && rectB.top > rectA.top && rectB.bottom < rectA.bottom;
                        },
                        drop: function (type: string, data: any) {
                            if (type !== 'entity')
                                return;

                            field.value = data.resource_id;
                        },
                        over: function (type: string, data: any) {
                            if (args.over)
                                args.over(type, data);
                        },
                        leave: function () {
                            if (args.leave)
                                args.leave();
                        }
                    });
                    field.on('destroy', function () {
                        dropRef.unregister();
                    });

                    break;

                case 'image':
                    panel.flex = false;

                    field = new Image();
                    field.style.maxWidth = '100%';
                    field.style.display = 'block';
                    field.src = args.src;

                    panel.append(field);
                    break;

                case 'progress':
                    field = new Progress();
                    field.flexGrow = 1;

                    panel.append(field);
                    break;

                case 'button':
                    field = new Button();
                    field.flexGrow = 1;
                    field.text = args.text || 'Button';
                    panel.append(field);
                    break;

                case 'element':
                    field = args.element;
                    panel.append(field);
                    break;

                case 'array':
                    field = editor.call('attributes:addArray', args);
                    panel.append(field);

                    break;

                default:
                    field = new Label();
                    field.flexGrow = '1';
                    field.text = args.value || '';
                    field.class.add('selectable');

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    linkField();

                    panel.append(field);
                    break;

            }

            if (args.className && field instanceof Element) {
                field.class!.add(args.className);
            }

            return field;
        });




        var inspectedItems: any[] = [];


        editor.on('attributes:clear', function () {
            for (let i = 0; i < inspectedItems.length; i++) {
                inspectedItems[i].unbind();
            }
            inspectedItems = [];
        });

        editor.method('attributes:inspect', function (type: string, item: Observer) {
            clearPanel();

            // clear if destroyed
            inspectedItems.push(item.once('destroy', function () {
                editor.call('attributes:clear');
            }));

            self.root.headerText = type;

            editor.emit('attributes:inspect[' + type + ']', [item]);
            editor.emit('attributes:inspect[*]', type, [item]);
        });


        editor.on('selector:change', function (type: string, items: Observer[]) {
            clearPanel();

            // console.warn('selector:change：type --- ' + type + '* length --- ' + items.length);

            // nothing selected
            if (items.length === 0) {
                let label = new Label('请选择物体或资源');
                label.style!.display = 'block';
                label.style!.textAlign = 'center';
                label.style!.width = '100%';
                // label.style!.height = '22px';
                self.root.append(label);
                self.root.headerText = self.title;
                return;
            }

            // console.warn('选择类型：' + type);
            // console.warn(items);

            // clear if destroyed
            for (let i = 0; i < items.length; i++) {
                // TODO：当前item为空
                // console.error(type);
                // if (type === 'entity') {
                //     GizmosCenter.attach(items[i].node);
                // }
                // console.error(items[i]);
                inspectedItems.push(items[i].once('destroy', function () {
                    editor.call('attributes:clear');
                }));
            }

            self.root.headerText = type;

            // console.error(type);
            // console.error(items);

            editor.emit('attributes:inspect[' + type + ']', items);
            editor.emit('attributes:inspect[*]', type, items);
        });

        // 初始时，默认没有选中物体
        editor.emit('selector:change', null, []);



        // clearing
        editor.method('attributes:clear', clearPanel);

    }







}


export interface AddPanelArgs {
    name?: string;
    parent?: Panel;
    foldable?: boolean;
    folded?: boolean;
}