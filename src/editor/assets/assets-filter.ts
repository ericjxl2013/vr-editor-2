import { Observer } from "../../lib";
import { VeryEngine } from "../../engine";
import { Panel, SelectField, Tooltip, TextField } from "../../ui";

export class AssetsFilter {
    public constructor() {

        var root = VeryEngine.root;
        var assetsPanel = VeryEngine.assets;
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;
        var currentFolder: any = null;
        var currentPath: any = [];

        var searchLastValue = '';
        var searchTags: any = null;

        // filters
        var panelFilters = new Panel();
        panelFilters.class!.add('filters');
        assetsPanel.header.append(panelFilters);

        var tagsCheck = function (asset: Observer, tags: string[]) {
            var data = asset.get('tags');

            if (!data.length)
                return false;

            // tags = pc.Tags.prototype._processArguments(tags);

            if (!data.length || !tags.length)
                return false;

            for (var i = 0; i < tags.length; i++) {
                if (tags[i].length === 1) {
                    // single occurance
                    if (data.indexOf(tags[i][0]) !== -1)
                        return true;
                } else {
                    // combined occurance
                    var multiple = true;

                    for (var t = 0; t < tags[i].length; t++) {
                        if (data.indexOf(tags[i][t]) !== -1)
                            continue;

                        multiple = false;
                        break;
                    }

                    if (multiple)
                        return true;
                }
            }

            return false;
        };





        var filter = function (type: string, item: Observer) {
            if (!item)
                return false;

            var visible = true;

            // type
            if (visible && filterField.value !== 'all') {
                if (type === 'asset') {
                    var assetType = item.get('type');

                    if (assetType === 'texture') {
                        if (item.get('source')) {
                            assetType = 'textureSource';
                        } else {
                            assetType = 'textureTarget';
                        }
                    } else if (assetType === 'textureatlas') {
                        if (item.get('source')) {
                            assetType = 'textureAtlasSource';
                        } else {
                            assetType = 'textureAtlasTarget';
                        }
                    } else if (assetType === 'font') {
                        if (item.get('source')) {
                            assetType = 'fontSource';
                        } else {
                            assetType = 'fontTarget';
                        }
                    }

                    visible = assetType === filterField.value;
                } else if (type === 'script') {
                    visible = filterField.value === 'script';
                }
            }

            // query
            if (visible && search.value) {
                var name = (type === 'scripts') ? item : item.get(type === 'asset' ? 'name' : 'filename');
                var normalSearch = true;

                if (searchTags !== false && ((searchTags instanceof Array) || (search.value[0] === '[' && search.value.length > 2 && /^\[.+\]$/.test(search.value)))) {
                    if (searchTags === null) {
                        try {
                            var raw = search.value.slice(1, -1);
                            var bits = raw.split(',');
                            var tags = [];
                            var merge = '';

                            for (var i = 0; i < bits.length; i++) {
                                var tag = bits[i].trim();
                                if (!tag) continue;

                                if ((tag[0] === '[' && tag[tag.length - 1] !== ']') || (merge && tag[tag.length - 1] !== ']')) {
                                    merge += tag + ',';
                                    continue;
                                }

                                if (merge && tag[tag.length - 1] === ']') {
                                    tag = merge + tag;
                                    merge = '';
                                }

                                if (tag[0] === '[' && tag.length > 2 && tag[tag.length - 1] === ']') {
                                    var subRaw = tag.slice(1, -1);
                                    var subBits = subRaw.split(',');
                                    if (subBits.length === 1) {
                                        var subTag = subBits[0].trim();
                                        if (!subTag) continue;
                                        tags.push(subTag);
                                    } else {
                                        var subTags = [];
                                        for (var s = 0; s < subBits.length; s++) {
                                            var subTag = subBits[s].trim();
                                            if (!subTag) continue;
                                            subTags.push(subTag);
                                        }

                                        if (subTags.length === 0) {
                                            continue;
                                        } else if (subTags.length === 1) {
                                            tags.push(subTags[0]);
                                        } else {
                                            tags.push(subTags);
                                        }
                                    }
                                } else {
                                    tags.push(tag);
                                }
                            }

                            searchTags = tags;
                            normalSearch = false;
                        } catch (ex) {
                            searchTags = false;
                        }
                    } else {
                        normalSearch = false;
                    }

                    if (searchTags) {
                        if (type === 'scripts' || (type === 'script' && legacyScripts)) {
                            visible = false;
                        } else {
                            visible = tagsCheck(item, searchTags);
                        }
                    } else {
                        normalSearch = true;
                    }
                } else if (search.value[0] === '*' && search.value.length > 1) {
                    try {
                        visible = (new RegExp(search.value.slice(1), 'i')).test(name);
                        normalSearch = false;
                    } catch (ex) { }
                }

                if (normalSearch) {
                    visible = name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1;

                    if (!visible && type === 'asset') {
                        var id = parseInt(search.value, 10);
                        if (id && id.toString() === search.value)
                            visible = parseInt(item.get('id'), 10) === id;
                    }
                }
            }

            // folder
            if (visible && !search.value) {
                if (type === 'script' || currentFolder === 'scripts') {
                    visible = currentFolder === 'scripts' && type === 'script';
                } else if (type === 'scripts') {
                    visible = !currentFolder && filterField.value === 'all';
                } else {
                    var path = item.get('path');
                    if (currentFolder === null) {
                        visible = path.length === 0;
                    } else {
                        visible = (path.length === currentPath.length + 1) && path[path.length - 1] === currentFolder;
                    }
                }
            }

            return visible;
        };
        editor.method('assets:panel:filter:default', function () {
            return filter;
        });


        // options
        var filterOptions;

        filterOptions = {
            options: {
                all: '所有资源',
                material: '材质',
                model: '模型',
                textureTarget: '贴图',
                table: '表格'
            }
        };

        var filterField = new SelectField(filterOptions);

        filterField.class!.add('options');
        filterField.value = 'all';
        filterField.renderChanges = false;
        panelFilters.append(filterField);

        filterField.on('change', function (value: string) {
            if (value !== 'all') {
                filterField.class!.add('not-empty');
            } else {
                filterField.class!.remove('not-empty');
            }
            // console.warn(value);
            editor.call('assets:panel:filter', filter);
        });

        var tooltipFilter = Tooltip.attach({
            target: filterField.element!,
            text: '资源过滤器',
            align: 'bottom',
            root: root
        });
        filterField.on('open', function () {
            tooltipFilter.disabled = true;
        });
        filterField.on('close', function () {
            tooltipFilter.disabled = false;
        });

        editor.method('assets:filter:search', function (query?: string) {
            if (query === undefined)
                return search.value;
            search.value = query;
            return search.value;
        });

        editor.method('assets:filter:type', function (type?: string) {
            if (type === undefined)
                return filterField.value;

            filterField.value = type || 'all';
        });

        editor.method('assets:filter:type:disabled', function (state: boolean) {
            filterField.disabled = state;
        });

        editor.on('assets:panel:currentFolder', function (asset?: Observer | string) {
            if (asset) {
                if (typeof (asset) === 'string') {
                    if (legacyScripts) {
                        currentFolder = 'scripts';
                    } else {
                        currentFolder = null;
                    }
                    currentPath = null;
                } else {
                    currentFolder = asset.get('id');
                    // currentFolder = parseInt(asset.get('id'));
                    currentPath = asset.get('path');
                }
            } else {
                currentFolder = null;
                currentPath = null;
            }


            editor.call('assets:panel:filter', filter, true);
        });

        editor.on('assets:add', function (asset: Observer) {
            if (filterField.value === 'all' && !search.value)
                return;

            if (!filter((asset.get('type') === 'script') ? 'script' : 'asset', asset))
                editor.call('assets:panel:get', asset.get('id')).hidden = true;
            else
                editor.call('assets:panel:message', null); // clear possible no assets message
        });

        editor.on('sourcefiles:add', function (file: Observer) {
            if (filterField.value === 'all' && !search.value)
                return;

            if (!filter('script', file))
                editor.call('assets:panel:get', file.get('filename')).hidden = true;
            else
                editor.call('assets:panel:message', null); // clear possible no assets message

        });

        // search
        var search = new TextField('搜索');
        search.blurOnEnter = false;
        search.keyChange = true;
        search.class!.add('search');
        search.renderChanges = false;
        panelFilters.append(search);

        search.element!.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27)
                searchClear.click();
        }, false);

        // hotkeys
        editor.call('hotkey:register', 'assets-focus-search', {
            key: 'a',
            alt: true,
            callback: function (e: any) {
                if (editor.call('picker:isOpen:otherThan', 'curve')) return;
                search.focus();
            }
        });

        var searchClear = document.createElement('div');
        searchClear.innerHTML = '&#57650;';
        searchClear.classList.add('clear');
        search.element!.appendChild(searchClear);

        searchClear.addEventListener('click', function () {
            search.value = '';
        }, false);

        search.on('change', function (value: string) {
            value = value.trim();

            if (searchLastValue === value)
                return;

            searchLastValue = value;

            if (value) {
                search.class!.add('not-empty');
            } else {
                search.class!.remove('not-empty');
            }

            searchTags = null;

            editor.call('assets:panel:filter', filter);
        });

    }
}