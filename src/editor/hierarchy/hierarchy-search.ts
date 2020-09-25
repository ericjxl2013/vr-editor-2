import { List, TextField, ListItem, Panel, Tree, TopElementPanel } from "../../ui";
import { VeryEngine } from "../../engine";
import { Observer } from "../../lib";

export class HierarchySearch {


    public constructor() {

        editor.method('entities:fuzzy-search', function (query: string) {
            var items = [];
            var entities = editor.call('entities:list');

            for (var i = 0; i < entities.length; i++)
                items.push([entities[i].get('name'), entities[i]]);

            return editor.call('search:items', items, query);
        });


        let panel: TopElementPanel = VeryEngine.hierarchy;
        let hierarchy: Tree = editor.call('entities:hierarchy');
        var changing = false;
        var itemsIndex: { [key: string]: ListItem } = {};

        // 结果列表
        let results = new List();
        results.element!.tabIndex = 0;
        results.hidden = true;
        results.class!.add('search-results');
        panel.append(results);

        var lastSearch = '';
        var search = new TextField('搜索');
        search.blurOnEnter = false;
        search.keyChange = true;
        search.class!.add('search');
        search.renderChanges = false;
        panel.prepend(search)
        // panel.element!.insertBefore(search.element!, panel.innerElement);

        var searchClear = document.createElement('div');
        searchClear.innerHTML = '&#57650;';
        searchClear.classList.add('clear');
        search.element!.appendChild(searchClear);

        searchClear.addEventListener('click', function () {
            search.value = '';
        }, false);



        // clear on escape
        results.element!.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) { // esc
                searchClear.click();
            } else if (evt.keyCode === 13) { // enter
                // 搜索结果出现以后，按下enter键
                if (!results.selected) {
                    var firstElement = results.element!.firstChild;
                    if (firstElement && (<HTMLElement>firstElement).ui && (<ListItem>(<HTMLElement>firstElement).ui).entity)
                        editor.call('selector:set', 'entity', [(<ListItem>(<HTMLElement>firstElement).ui).entity]);
                }
                search.value = '';

            } else if (evt.keyCode === 40) { // down
                selectNext();
                evt.stopPropagation();

            } else if (evt.keyCode === 38) { // up
                selectPrev();
                evt.stopPropagation();
            }
        }, false);

        // deselecting
        results.unbind('deselect', results._onDeselect);
        results._onDeselect = function (item: ListItem) {
            var ind = results.selected.indexOf(item);
            if (ind !== -1) results.selected.splice(ind, 1);

            if (this._changing)
                return;

            if (List._ctrl && List._ctrl()) {

            } else {
                this._changing = true;

                var items = editor.call('selector:type') === 'entity' && editor.call('selector:items') || [];
                var inSelected = items.indexOf(item.entity) !== -1;

                if (items.length >= 2 && inSelected) {
                    var selected = this.selected;
                    for (var i = 0; i < selected.length; i++)
                        selected[i].selected = false;

                    item.selected = true;
                }

                this._changing = false;
            }

            this.emit('change');
        };
        results.on('deselect', results._onDeselect);

        // results selection change
        results.on('change', function () {
            if (changing)
                return;

            if (results.selected) {
                editor.call('selector:set', 'entity', results.selected.map(function (item) {
                    return item.entity;
                }));
            } else {
                editor.call('selector:clear');
            }
        });

        // selector change
        editor.on('selector:change', function (type: string, items: Observer[]) {
            if (changing)
                return;

            changing = true;

            if (type === 'entity') {
                results.selected = [];

                for (var i = 0; i < items.length; i++) {
                    var item = itemsIndex[items[i].get('resource_id')];
                    if (!item) continue;
                    item.selected = true;
                }
            } else {
                results.selected = [];
            }

            changing = false;
        });

        var selectNext = function () {
            // list item
            var children = results.element!.children;

            // could be nothing or only one item to select
            if (!children.length)
                return;

            var toSelect = null;
            // 被选择的item
            var items = results.element!.querySelectorAll('.ui-list-item.selected');
            var multi = (List._ctrl && List._ctrl()) || (List._shift && List._shift());

            if (items.length) {
                var last = items[items.length - 1];
                var next = last.nextSibling; // 下一个list item
                if (next) {
                    // select next
                    toSelect = (<HTMLElement>next).ui;
                } else {
                    // loop through
                    if (!multi) toSelect = (<HTMLElement>children[0]).ui;
                }
            } else {
                // select first
                toSelect = (<HTMLElement>children[0]).ui;
            }

            if (toSelect) {
                if (!multi) results.selected = [];
                (<ListItem>toSelect).selected = true;
            }
        };

        var selectPrev = function () {
            var children = results.element!.children;

            // could be nothing or only one item to select
            if (!children.length)
                return;

            var toSelect = null;
            var items = results.element!.querySelectorAll('.ui-list-item.selected');
            var multi = (List._ctrl && List._ctrl()) || (List._shift && List._shift());

            if (items.length) {
                var first = items[0];
                var prev = first.previousSibling;
                if (prev) {
                    // select previous
                    toSelect = (<HTMLElement>prev).ui;
                } else {
                    // loop through
                    if (!multi) toSelect = (<HTMLElement>children[children.length - 1]).ui;
                }
            } else {
                // select last
                toSelect = (<HTMLElement>children[children.length - 1]).ui;
            }

            if (toSelect) {
                if (!multi) results.selected = [];
                (<ListItem>toSelect).selected = true;
            }
        };

        search.element!.addEventListener('keydown', function (evt: KeyboardEvent) {
            if (evt.keyCode === 27) {
                searchClear.click();

            } else if (evt.keyCode === 13) {
                if (!results.selected.length) {
                    var firstElement = results.element!.firstChild;
                    if (firstElement && (<HTMLElement>firstElement).ui && (<ListItem>(<HTMLElement>firstElement).ui).entity)
                        editor.call('selector:set', 'entity', [(<ListItem>(<HTMLElement>firstElement).ui).entity]);
                }
                search.value = '';

            } else if (evt.keyCode === 40) { // down
                editor.call('hotkey:updateModifierKeys', evt);
                selectNext();
                evt.stopPropagation();
                evt.preventDefault();

            } else if (evt.keyCode === 38) { // up
                editor.call('hotkey:updateModifierKeys', evt);
                selectPrev();
                evt.stopPropagation();
                evt.preventDefault();

            } else if (evt.keyCode === 65 && evt.ctrlKey) { // ctrl + a
                var toSelect: ListItem[] = [];

                var items = results.element!.querySelectorAll('.ui-list-item');
                for (var i = 0; i < items.length; i++)
                    toSelect.push(<ListItem>(<HTMLElement>items[i]).ui);

                results.selected = toSelect;

                evt.stopPropagation();
                evt.preventDefault();
            }
        }, false);


        // if entity added, check if it maching query
        editor.on('entities:add', function (entity: Observer) {
            var query = search.value.trim();
            if (!query)
                return;

            var items = [[entity.get('name'), entity]];
            var result = editor.call('search:items', items, query);

            if (!result.length)
                return;

            performSearch();
        });

        var addItem = function (entity: Observer) {
            var events: any = [];

            var item = new ListItem(entity.get('name'));
            item.disabledClick = true;
            item.entity = entity;

            if (entity.get('children').length)
                item.class!.add('container');

            // relate to tree item
            var treeItem = editor.call('entities:panel:get', entity.get('resource_id'));

            item.disabled = treeItem.disabled;

            var onStateChange = function () {
                item.disabled = treeItem.disabled;
            };

            events.push(treeItem.on('enable', onStateChange));
            events.push(treeItem.on('disable', onStateChange));

            var onNameSet = function (name: string) {
                item.text = name;
            };
            // TODO
            events.push(entity.on('name:set', onNameSet));

            // icon
            var components = Object.keys(entity.get('components'));
            for (var c = 0; c < components.length; c++)
                item.class!.add('c-' + components[c]);

            var onContextMenu = function (evt: MouseEvent) {
                var openned = editor.call('entities:contextmenu:open', entity, evt.clientX, evt.clientY);

                if (openned) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            };

            var onDblClick = function (evt: MouseEvent) {
                search.value = '';
                editor.call('selector:set', 'entity', [entity]);

                evt.stopPropagation();
                evt.preventDefault();
            };

            item.element!.addEventListener('contextmenu', onContextMenu);
            item.element!.addEventListener('dblclick', onDblClick);

            events.push(item.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
                events = null;

                item.element!.removeEventListener('contextmenu', onContextMenu);
                item.element!.removeEventListener('dblclick', onDblClick);
            }));

            events.push(treeItem.once('destroy', function () {
                // if entity removed, perform search again
                performSearch();
            }));

            return item;
        };

        var performSearch = function () {
            var query = lastSearch;

            // clear results list
            results.clear();
            itemsIndex = {};

            if (query) {
                var result = editor.call('entities:fuzzy-search', query);

                hierarchy.hidden = true;
                results.hidden = false;

                var selected = [];
                if (editor.call('selector:type') === 'entity')
                    selected = editor.call('selector:items');

                for (var i = 0; i < result.length; i++) {
                    var item = addItem(result[i]);

                    itemsIndex[result[i].get('resource_id')] = item;

                    if (selected.indexOf(result[i]) !== -1)
                        item.selected = true;

                    results.append(item);
                }
            } else {
                results.hidden = true;
                hierarchy.hidden = false;
            }
        };

        search.on('change', function (value: string) {
            value = value.trim();

            if (lastSearch === value) return;
            lastSearch = value;

            if (value) {
                search.class!.add('not-empty');
            } else {
                search.class!.remove('not-empty');
            }

            performSearch();
        });

    }


}