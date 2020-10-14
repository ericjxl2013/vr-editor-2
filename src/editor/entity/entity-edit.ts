import { Observer } from "../../lib";
import { BabylonLoader } from "../middleware/loader/babylonLoader";

export class EntityEdit {


    public constructor() {

        let childToParent: { [key: string]: string } = {};
        // 为回退作准备
        let deletedCache: { [key: string]: any } = {};

        // 更新entity数据，不做具体实例处理
        editor.on('entities:add', function (entity: Observer) {
            // console.log('entity-edit-children');
            var children = entity.get('children');
            for (var i = 0; i < children.length; i++)
                childToParent[children[i]] = entity.get('resource_id');

            entity.on('children:insert', function (value: string) {
                // console.warn('children:insert in entity-edit');
                childToParent[value] = entity.get('resource_id');
                BabylonLoader.updateSceneData(entity.get('resource_id'), entity._data2);
                editor.call('make:scene:dirty');
            });
            entity.on('children:remove', function (value: string) {
                // console.warn('children:remove in entity-edit');
                delete childToParent[value];
                BabylonLoader.updateSceneData(entity.get('resource_id'), entity._data2);
                editor.call('make:scene:dirty');
            });
        });

        var updateEntityReferenceFields = function (entityReferencesMap: any, oldValue: string, newValue: any) {
            var referencesToThisEntity = entityReferencesMap[oldValue];
            if (!referencesToThisEntity) return;

            referencesToThisEntity.forEach(function (reference: any) {
                var sourceEntity = editor.call('entities:get', reference.sourceEntityGuid);
                if (!sourceEntity) return;

                var prevHistory = sourceEntity.history.enabled;
                sourceEntity.history.enabled = false;
                sourceEntity.set('components.' + reference.componentName + '.' + reference.fieldName, newValue);
                sourceEntity.history.enabled = prevHistory;
            });
        };


        var addEntity = function (entity: Observer, parent: Observer, select: boolean, ind: number | undefined, entityReferencesMap: any) {
            entityReferencesMap = entityReferencesMap || {};
            // ind = ind || 0;

            childToParent[entity.get('resource_id')] = parent.get('resource_id');

            var children = entity.get('children');
            if (children.length)
                entity.set('children', []);

            // call add event
            editor.call('entities:add', entity);

            // console.error(entity);



            // TODO: 上传到服务器
            // shareDb 
            // editor.call('realtime:scene:op', {
            //     p: ['entities', entity.get('resource_id')],
            //     oi: entity.origin
            // });

            // this is necessary for the entity to be added to the tree view
            // parent.history.enabled = false;
            // 添加tree item 菜单入口
            parent.insert('children', entity.get('resource_id'), ind);
            // console.warn(parent);



            // parent.history.enabled = true;

            // if (select) {
            //     setTimeout(function () {
            //         editor.call('selector:history', false);
            //         editor.call('selector:set', 'entity', [entity]);
            //         editor.once('selector:change', function () {
            //             editor.call('selector:history', true);
            //         });
            //     }, 0);
            // }

            // add children too
            // children.forEach(function (childIdOrData: any) {
            //     var data;

            //     // If we've been provided an id, we're re-creating children from the deletedCache
            //     if (typeof childIdOrData === 'string') {
            //         data = deletedCache[childIdOrData];
            //         if (!data) {
            //             return;
            //         }
            //         // If we've been provided an object, we're creating children for a new entity
            //     } 

            //     var child = new Observer(data);
            //     // TODO
            //     addEntity(child, entity, false, 0, entityReferencesMap);
            // });

            BabylonLoader.addSceneData(entity.get('resource_id'), entity.origin);

            // Hook up any entity references which need to be pointed to this newly created entity
            // (happens when addEntity() is being called during the undoing of a deletion). In order
            // to force components to respond to the setter call even when they are running in other
            // tabs or in the Launch window, we unfortunately have to use a setTimeout() hack :(
            // var guid = entity.get('resource_id');

            // First set all entity reference fields targeting this guid to null
            // TODO: 待定，更新属性菜单
            // updateEntityReferenceFields(entityReferencesMap, guid, null);
            // setTimeout(function () {
            //     // Then update the same fields to target the guid again
            //     updateEntityReferenceFields(entityReferencesMap, guid, guid);
            // }, 0);

            // if (entity.get('__postCreationCallback')) {
            //     entity.get('__postCreationCallback')(entity);
            // }
        };

        var removeEntity = function (entity: Observer, entityReferencesMap: any) {
            entityReferencesMap = entityReferencesMap || {};
            // deletedCache[entity.get('resource_id')] = entity.json();
            deletedCache[entity.get('resource_id')] = entity._data2;

            // Nullify any entity references which currently point to this guid
            // updateEntityReferenceFields(entityReferencesMap, entity.get('resource_id'), null);

            // remove children
            // console.log(entity.get('children'));
            let childrenIDs = entity.get('children');
            if (childrenIDs && childrenIDs.length > 0) {
                childrenIDs = childrenIDs.slice(0);
                for (let i = 0, len = childrenIDs.length; i < len; i++) {
                    var childEntity = editor.call('entities:get', childrenIDs[i]);
                    if (!childEntity)
                        return;
                    removeEntity(childEntity, entityReferencesMap);
                }
            }

            if (editor.call('selector:type') === 'entity' && editor.call('selector:items').indexOf(entity) !== -1) {
                editor.call('selector:history', false);
                editor.call('selector:remove', entity);
                // TODO：选择历史记录
                editor.once('selector:change', function () {
                    editor.call('selector:history', true);
                });
            }

            // remove from parent
            var parentId = childToParent[entity.get('resource_id')];
            if (parentId) {
                var parent = editor.call('entities:get', parentId);
                if (parent) {
                    // parent.history.enabled = false;
                    parent.removeValue('children', entity.get('resource_id'));
                    // parent.history.enabled = true;
                }
            }
            let removeEntityID = entity.get('resource_id');
            // call remove method
            editor.call('entities:remove', entity);

            // 更新scene数据
            BabylonLoader.removeSceneData(removeEntityID);
            editor.call('make:scene:dirty');

        };


        editor.method('entities:addEntity', addEntity);
        editor.method('entities:removeEntity', removeEntity);

        editor.method('entities:getParentResourceId', function (childResourceId: string) {
            return childToParent[childResourceId];
        });

        editor.method('entities:updateChildToParentIndex', function (childResourceId: string, parentResourceId: string) {
            childToParent[childResourceId] = parentResourceId;
        });

        editor.method('entities:getFromDeletedCache', function (resourceId: string) {
            return deletedCache[resourceId];
        });


        editor.method('save:scene', () => {
            BabylonLoader.saveScene();
        });


    }
}