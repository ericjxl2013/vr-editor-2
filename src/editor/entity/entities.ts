import { Entity } from "./entity";
import { GameObject, ResourceContainer } from "../middleware";
import { Observer, ObserverList } from "../../lib";

export class Entities {
    public lists: Entity[] = [];
    private _indexed: { [key: string]: Entity } = {};

    private container: ResourceContainer;

    public constructor() {
        this.container = new ResourceContainer();



        var entities = new ObserverList({
            id: 'resource_id'
        });

        var entityRoot: Nullable<Observer> = null;

        // on adding
        entities.on('add', function (entity: Observer) {
            editor.emit('entities:add', entity, entity === entityRoot);
        });

        // on removing
        entities.on('remove', function (entity: Observer) {
            editor.emit('entities:remove', entity);
            entity.destroy();
            // entity.entity = null;
        });

        // allow adding entity
        editor.method('entities:add', function (entity: Observer) {
            if (entity.get('root'))
                entityRoot = entity;

            entities.add(entity);
        });

        // allow remove entity
        editor.method('entities:remove', function (entity: Observer) {
            entities.remove(entity);
        });

        // remove all entities
        editor.method('entities:clear', function () {
            entities.clear();
        });

        // get entity
        editor.method('entities:get', function (resourceId: string) {
            return entities.get(resourceId);
        });


        // list entities
        editor.method('entities:list', function () {
            return entities.array();
        });


        // get root entity
        editor.method('entities:root', function () {
            return entityRoot;
        });





    }

    // 1.建立基本的数据格式；
    // 2.串联hierarchy，包括基本的菜单；
    // 3.尝试建立property；
    // 4.串联Assets结构与UI；

    public addRaw(entity_data: any): void {
        // console.log('***entity-data***');
        // console.log(entity_data);

        // 目标，创建babylon scene资源
        // Editor模式和Publish模式有何异同？
        // Editor需要有一个Observer的中间层，需要建立层级关系，需要记录增改删除操作
        // Publish可以从scene数据直接加载资源即可；

        let gameObject = this.createGameObject(entity_data);


        // add component

        // children

        // parent

        this.container.addGameObject(gameObject);
    }

    public addEntity(entity: Observer): void {

    }


    private create(entity: Observer): GameObject {

        let type: string = entity.get('type');
        type = type.toLowerCase();
        if (type === 'root') {
            // 不需要生成

        } else if (type === 'mesh') {
            // 模型

            // 首先加载数据，生成babylon mesh数据结构
            // 提取地址，http或者其他方式加载
            // Http下载，加入回调函数处理，查看babylon默认的处理方式；
            // scenes数据如何从Assets数据中拿数据，到babylon中间件中寻找缓存

        } else if (type === 'empty') {
            // 空物体

        } else if (type === 'camera') {
            // node作为父物体

        } else if (type === 'light') {
            // node作为父物体

        } else if (type === 'particle') {
            // 貌似没有相对应的结构

        } else if (type === 'sprite') {
            // 貌似没有相对应的结构


        }


        // 根据要求生成GameObject
        let instance = new GameObject(entity.get('name'));

        return instance;
    }

    private createGameObject(entity: any): GameObject {
        // TODO: 解析是node还是mesh
        // 设置name
        let instance = new GameObject(entity.name);
        // 设置guid
        instance.guid = entity.resource_id;

        // 设置位置
        // 设置角度
        // 设置比例值
        // 设置enable ? 不存在的情况
        instance.setActive(entity.enabled);
        // 设置visiable

        // 设置tags

        return instance;
    }

    public add(item: Entity): void { }

    public has(item: Entity): boolean {
        return false;
    }

    public set(index: string, item: Entity): void { }

    public get(index: string): Nullable<Entity> {
        return this._indexed[index];
    }

    public indexOf(item: Entity): number {
        return this.lists.indexOf(item);
    }
}
