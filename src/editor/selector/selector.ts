import { Observer } from '../../lib/observer';
import { ObserverList } from '../../lib';


export class Selector {

    public enabled: boolean = true;

    public selector: ObserverList;
    public legacyScripts: boolean = false;

    public evtChange: boolean;

    public type: string = '';
    public length: number = 0;

    public constructor() {
        this.selector = new ObserverList();

        this.evtChange = false;

        this.init();
    }


    private init(): void {

        let self = this;

        var index: any = {};

        var keyByType = function (type: string) {
            switch (type) {
                case 'entity':
                    return 'resource_id';
                case 'asset':
                    return 'id';
            }
            return '';
        };

        var setIndex = function (type: string, item: Observer) {
            var key = keyByType(type);
            if (!key) return;

            if (!index[type])
                index[type] = {};

            index[type][item.get(key)] = item.once('destroy', function () {
                var state = editor.call('selector:history');
                if (state)
                    editor.call('selector:history', false);

                self.selector.remove(item);
                delete index[type][item.get(key)];

                if (state)
                    editor.call('selector:history', true);
            });
        };

        var removeIndex = function (type: string, item: Observer) {
            if (!index[type]) return;

            var key = keyByType(type);
            if (!key) return;

            var ind = index[type][item.get(key)];
            if (!ind) return;

            ind.unbind();
        };

        var evtChange = false;
        var evtChangeFn = function () {
            evtChange = false;
            // console.log(self.selector.type);
            // console.log(self.selector.array());
            editor.emit('selector:change', self.selector.type, self.selector.array());
        };

        // adding
        self.selector.on('add', function (item: Observer) {
            // add index
            setIndex(self.type, item);
            // console.error("adddddddd: " + self.type);
            editor.emit('selector:add', item, self.type);

            if (!evtChange) {
                evtChange = true;
                setTimeout(evtChangeFn, 0);
            }
        });

        // removing
        self.selector.on('remove', function (item: Observer) {
            editor.emit('selector:remove', item, self.type);
            // console.error("removeeeeeee: " + self.type);
            // remove index
            removeIndex(self.type, item);

            if (self.length === 0)
                self.type = '';

            if (!evtChange) {
                evtChange = true;
                setTimeout(evtChangeFn, 0);
            }
        });


        // selecting item (toggle)
        editor.method('selector:toggle', function (type: string, item: Observer) {
            if (!self.enabled)
                return;

            if (self.selector.length && self.selector.type !== type) {
                self.selector.clear();
            }
            self.selector.type = type;
            self.type = type;

            if (self.selector.has(item)) {
                self.selector.remove(item);
            } else {
                self.selector.add(item);
            }
        });

        // selecting list of items
        editor.method('selector:set', function (type: string, items: Observer[]) {
            if (!self.enabled)
                return;

            self.selector.clear();

            if (!type || !items.length)
                return;

            // make sure items still exist
            if (type === 'asset') {
                items = items.filter(function (item: Observer) {
                    return (self.legacyScripts && item.get('type') === 'script') || !!editor.call('assets:get', item.get('id'));
                });
            } else if (type === 'entity') {
                items = items.filter(function (item: Observer) {
                    return !!editor.call('entities:get', item.get('resource_id'));
                });
                let rootEntity = editor.call('entities:root');
                if (items.indexOf(rootEntity) !== -1) {
                    editor.call('selector:set', 'entity', []);
                    // editor.emit('attributes:inspect[editorSettings]');
                    type = 'editorSettings';
                    items = [editor.call('settings:data')];
                }
            }

            if (!items.length)
                return;

            // type
            self.selector.type = type;
            self.type = type;

            // remove
            // TODO: 删除不重合的部分
            // self.selector.find(function (item: Observer) {
            //     return items.indexOf(item) === -1;
            // }).forEach(function (item: Observer) {
            //     self.selector.remove(item);
            // });

            // add
            for (var i = 0; i < items.length; i++)
                self.selector.add(items[i]);
        });

        // 某个面板选中item // selecting item hierarchy选择物体
        editor.method('selector:add', (type: string, item: Observer) => {

            if (!self.enabled)
                return;

            if (self.selector.has(item))
                return;

            // console.warn('selector add入口, type: ' + type);
            // console.warn(item.get('id'));

            if (self.selector.length > 0 && self.selector.type !== type) {
                self.selector.clear();
            }

            // root为场景设置
            if (type === 'entity' && item.get('type') === 'root') {
                editor.call('selector:set', 'entity', []);
                // editor.emit('attributes:inspect[editorSettings]');
                type = 'editorSettings';
                item = editor.call('settings:data');
            }

            self.selector.type = type;
            self.type = type;
            self.selector.add(item);
        });

        // deselecting item
        editor.method('selector:remove', (item: Observer) => {

            if (!self.enabled)
                return;

            if (!self.selector.has(item))
                return;

            self.selector.remove(item);
        });

        // deselecting
        editor.method('selector:clear', function () {
            if (!self.enabled)
                return;

            self.selector.clear();
        });


        // return select type
        editor.method('selector:type', function () {
            return self.selector.type;
        });


        // return selected count
        editor.method('selector:count', function () {
            return self.selector.length;
        });


        // return selected items
        editor.method('selector:items', function () {
            return self.selector.array();
        });

        // return selected items without making copy of array
        editor.method('selector:itemsRaw', function () {
            return self.selector.data;
        });

        // return if it has item
        editor.method('selector:has', function (item: Observer) {
            return self.selector.has(item);
        });


        editor.method('selector:enabled', function (state: boolean) {
            self.enabled = state;
        });

    }


}