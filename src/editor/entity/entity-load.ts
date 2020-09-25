import { Entities } from './entities';
import { Observer } from '../../lib';
import { Loader } from '../middleware/loader';
import { TopElementContainer, Progress } from '../../ui';

export class EntityLoad {

    public loadedEntities: boolean = false;

    // private _entities: Entities = new Entities();

    public constructor() {

        var hierarchyOverlay = new TopElementContainer({
            flex: true
        });
        hierarchyOverlay.class!.add('progress-overlay');
        editor.call('layout.hierarchy').append(hierarchyOverlay);

        var p = new Progress();
        p.on('progress:100', function () {
            hierarchyOverlay.hidden = true;
        });
        hierarchyOverlay.append(p);
        p.hidden = true;

        var loadedEntities = false;

        editor.method('entities:loaded', function () {
            return loadedEntities;
        });


        editor.on('scene:raw', function (data: any) {
            // editor.call('selector:clear');
            // editor.call('entities:clear');
            // editor.call('attributes:clear');

            // console.log(data);

            var total = Object.keys(data.entities).length;
            var i = 0;

            // list
            for (var key in data.entities) {
                let entity = new Observer(data.entities[key]);
                editor.call('entities:add', entity);
                p.progress = (++i / total) * 0.8 + 0.1;
                if (!data.entities[key].root) {
                    editor.call('create:scene:element', entity);
                }
            }

            p.progress = 1;

            loadedEntities = true;
            editor.emit('entities:load');
        });

        editor.call('attributes:clear');

        editor.on('scene:unload', function () {
            editor.call('entities:clear');
            editor.call('attributes:clear');
        });

        editor.on('scene:beforeload', function () {
            hierarchyOverlay.hidden = false;
            p.hidden = false;
            p.progress = 0.1;
        });






        

    }




    /*
    public scene_raw(row_data: any): void {
        // 解析entity

        // 清空
        // editor.call('selector:clear');
        // editor.call('entities:clear');
        // editor.call('attributes:clear');

        // Loader.append(row_data);

        // 加载进度条计算
        var total = Object.keys(row_data.entities).length;
        var i = 0;

        // list 挨个解析
        for (var key in row_data.entities) {
            // 是否需要加入一个中间结构
            this._entities.addRaw(row_data.entities[key]);
            let entity = new Observer(row_data.entities[key]);
            // debug.warn(entity.get('name'));
            // debug.warn(entity.get('resource_id'));
            // if (entity.has('components.rigidbody')) {
            //     debug.warn(entity.get('components.rigidbody.type'));
            // }

            // editor.call('entities:add', new Observer(data.entities[key]));
            // p.progress = (++i / total) * 0.8 + 0.1;
        }

        // p.progress = 1;

        this.loadedEntities = true;

        // 解析完成，其他面板设置
        editor.emit('entities:load');
    }
    */

}