import { Observer } from "../../lib";

export class EntityDelete {


    public constructor() {
        editor.method('entities:delete', function (entities: Observer[]) {
            var records: any = [];
            var entitiesToDelete: Observer[] = [];
            var i;
            var parent;

            // index entities
            var resourceIds: { [key: string]: Observer } = {};
            for (i = 0; i < entities.length; i++) {
                resourceIds[entities[i].get('resource_id')] = entities[i];
            }

            // find out if entity has ancestor
            for (i = 0; i < entities.length; i++) {
                var child = false;
                parent = editor.call('entities:getParentResourceId', entities[i].get('resource_id'));

                while (!child && parent) {
                    if (resourceIds[parent]) {
                        child = true;
                    } else {
                        parent = editor.call('entities:getParentResourceId', parent);
                    }
                }

                if (!child) {
                    entitiesToDelete.push(entities[i]);
                }
            }

            // delete only top level entities
            entities = entitiesToDelete;

            for (i = 0; i < entities.length; i++) {
                var resourceId = entities[i].get('resource_id');
                var parentId = editor.call('entities:getParentResourceId', resourceId);
                var ind;
                if (parentId) {
                    parent = editor.call('entities:get', parentId);
                    if (parent) {
                        ind = parent.get('children').indexOf(resourceId);
                    }
                }

                records.push({
                    resourceId: resourceId,
                    parentId: parentId,
                    ind: ind,
                    data: entities[i]._data2
                });
            }

            // Build a map of all entity reference properties in the graph. This is
            // effectively a snapshot of the entity references as they were at the point of deletion,
            // so that they can be re-constituted later if the deletion is undone.
            // var entityReferencesMap = {};
            // recursivelySearchForEntityReferences(editor.call('entities:root'), entityReferencesMap);

            // remove the entities from the scene
            for (i = 0; i < entities.length; i++) {
                editor.call('entities:removeEntity', entities[i], null);
            }

            // sort records by index
            // so that entities are re-added
            // in the correct order in undo
            records.sort(function (a: any, b: any) {
                return a.ind - b.ind;
            });


            // TODO: history
        });
    }


}