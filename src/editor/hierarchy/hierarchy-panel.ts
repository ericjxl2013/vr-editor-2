import { Panel, Button, Tooltip, Tree, TreeItem, TopElementPanel, ReparentDragItems } from '../../ui';
import { VeryEngine } from '../../engine';
import { HierarchySearch } from './hierarchy-search';
import { HierarchyMenu } from './hierarchy-menu';
import { HierarchyContextMenu } from './hierarchy-context-menu';
import { Observer } from '../../lib';
import { Config } from '../global';
import { BabylonLoader } from '../middleware/loader/babylonLoader';

export class HierarchyPanel {

    // hierarchy index
    private uiItemIndex: { [key: string]: TreeItem } = {};


    public constructor() {

        let self = this;
        // left control
        // hierarchy index
        // let uiItemIndex: any = {};
        let awaitingParent: any = {};
        let panel: TopElementPanel = VeryEngine.hierarchy;

        let hierarchy: Tree = new Tree();
        VeryEngine.hierarchyTree = hierarchy;

        let rootParent: TreeItem;

        // TODO: hierarchy权限管理，有些人可看不可编辑；
        // hierarchy.allowRenaming = editor.call('permissions:write');
        hierarchy.draggable = hierarchy.allowRenaming;
        hierarchy.class!.add('hierarchy');
        panel.append(hierarchy);

        let resizeQueued = false;
        let resizeTree = function () {
            resizeQueued = false;
            hierarchy.element!.style.width = '';
            hierarchy.element!.style.width = (panel.content.dom!.scrollWidth - 5) + 'px';
        };
        let resizeQueue = function () {
            if (resizeQueued) return;
            resizeQueued = true;
            requestAnimationFrame(resizeTree);
        };
        panel.on('resize', resizeQueue);
        hierarchy.on('open', resizeQueue);
        hierarchy.on('close', resizeQueue);
        setInterval(resizeQueue, 1000);

        // return hierarchy
        editor.method('entities:hierarchy', function () {
            return hierarchy;
        });

        // list item selected
        hierarchy.on('select', function (item: TreeItem) {
            // open items till parent
            let parent = item.parent;
            while (parent && parent instanceof TreeItem) {
                parent.open = true;
                parent = parent.parent;
            }
            // focus
            item.elementTitle.focus();
            // add selection
            // TODO
            // console.log('hierarchy 面板选中entity');
            // console.log(item.entity);

            // TODO: 当前entity为undefined
            editor.call('selector:add', 'entity', item.entity);
        });

        // list item deselected
        hierarchy.on('deselect', function (item: TreeItem) {
            // TODO:
            // console.log('selector:remove entity');
            editor.call('selector:remove', item.entity);
        });

        // scrolling on drag
        let dragScroll = 0;
        let dragTimer: NodeJS.Timer | null = null;;
        let dragLastEvt;
        let dragEvt = function (evt: MouseEvent) {
            if (!hierarchy._dragging) {
                clearInterval(Number(dragTimer));
                window.removeEventListener('mousemove', dragEvt);
                return;
            }
            let rect = panel.content.dom!.getBoundingClientRect();

            if ((evt.clientY - rect.top) < 32 && panel.content.dom!.scrollTop > 0) {
                dragScroll = -1;
            } else if ((rect.bottom - evt.clientY) < 32 && (panel.content.dom!.scrollHeight - (rect.height + panel.content.dom!.scrollTop)) > 0) {
                dragScroll = 1;
            } else {
                dragScroll = 0;
            }
        };

        hierarchy.on('dragstart', function () {
            dragTimer = setInterval(function () {
                if (dragScroll === 0)
                    return;

                panel.content.dom!.scrollTop += dragScroll * 8;
                hierarchy._dragOver = null;
                hierarchy._updateDragHandle();
            }, 1000 / 60);

            dragScroll = 0;
            window.addEventListener('mousemove', dragEvt, false);

            // TODO:
            // console.log('get drag TreeItem entity resourceId');

            let resourceId = hierarchy._dragItems[0].entity.get('resource_id');
            editor.call('drop:set', 'entity', { resource_id: resourceId });
            editor.call('drop:activate', true);
        });

        hierarchy.on('dragend', function () {
            // console.log('hierarchy panel drag end');
            editor.call('drop:activate', false);
            editor.call('drop:set');
        });

        // TODO
        let target = editor.call('drop:target', {
            ref: panel.content.dom,
            type: 'entity',
            hole: true,
            passThrough: true
        });
        target.element.style.outline = 'none';

        // let classList = ['tree-item-entity', 'entity-id-' + 'ids-to-be-done', 'c-model'];
        // if (isRoot) {
        //   classList.push('tree-item-root');
        // }

        // let rootElement = new TreeItem({
        //     text: 'Scene',
        //     classList: classList
        // });
        // rootElement.class!.remove('c-model');
        // hierarchy.element!.appendChild(rootElement.element!);
        // hierarchy.emit('append', rootElement);


        /*
        for (let i: number = 0; i < 10; i++) {
          let element1 = new TreeItem({
            text: '物体名' + (i + 1),
            classList: classList
          });
          editor.emit('entities:add', element1);
          hierarchy.emit('append', element1);
          rootElement.append(element1);
    
          for (let k = 0; k < 5; k++) {
            let element2 = new TreeItem({
              text: '子物体名' + (k + 1),
              classList: classList
            });
            editor.emit('entities:add', element2);
            hierarchy.emit('append', element2);
            element1.append(element2);
            for (let x = 0; x < 5; x++) {
              let element3 = new TreeItem({
                text: '二级子物体' + (x + 1),
                classList: classList
              });
              editor.emit('entities:add', element3);
              hierarchy.emit('append', element3);
    
              element2.append(element3);
    
            }
          }
        }
        */

        // reparenting
        hierarchy.on('reparent', function (items: ReparentDragItems[]) {
            var records: any = [];

            var preserveTransform = !Tree._ctrl || !Tree._ctrl();

            // make records and collect relevant data
            for (var i = 0; i < items.length; i++) {
                if (items[i].item.entity.reparenting)
                    continue;

                var record: any = {
                    item: items[i].item,
                    parent: (<TreeItem>items[i].item.parent!).entity,
                    entity: items[i].item.entity,
                    parentOld: (<TreeItem>items[i].old!).entity,
                    resourceId: items[i].item.entity.get('resource_id'),
                    parentId: (<TreeItem>items[i].item.parent).entity.get('resource_id'),
                    parentIdOld: (<TreeItem>items[i].old!).entity.get('resource_id')
                };

                if (preserveTransform && record.entity) {
                    record.position = record.entity.node.position.clone();
                    record.rotation = record.entity.node.rotation.clone();
                }

                // relative entity
                record.indOld = record.parentOld.get('children').indexOf(record.resourceId);

                // console.error(record.parent);
                // console.error(record.entity);
                // console.error(record.parentOld);
                // console.warn(record.item);
                // console.warn(record.item.parent);
                // console.warn(record.item.parent.element);
                // console.warn(record.item.parent.element.childNodes);

                record.indNew = Array.prototype.indexOf.call(record.item.parent.element.childNodes, record.item.element) - 1;

                // console.warn(record.indNew);

                records.push(record);
            }

            for (var i = 0; i < records.length; i++) {
                var record = records[i];

                record.entity.reparenting = true;

                // console.warn(record);

                // record.parent.history.enabled = false;
                // record.parentOld.history.enabled = false;
                // record.entity.history.enabled = false;

                if (record.parent === record.parentOld) {
                    // move
                    record.parent.removeValue('children', record.resourceId);
                    record.parent.insert('children', record.resourceId, record.indNew + ((record.indNew > record.indOld) ? (records.length - 1 - i) : 0));
                } else {
                    // reparenting

                    // remove from old parent
                    record.parentOld.removeValue('children', record.resourceId);

                    // add to new parent children
                    if (record.indNew !== -1) {
                        // before other item
                        record.parent.insert('children', record.resourceId, record.indNew);
                    } else {
                        // at the end
                        record.parent.insert('children', record.resourceId);
                    }

                    // set parent
                    record.entity.set('parent', record.parentId);
                }

                // console.error(record);

                BabylonLoader.updateSceneData(record.parentOld.get('resource_id'), record.parentOld._data2);
                BabylonLoader.updateSceneData(record.parent.get('resource_id'), record.parent._data2);
                BabylonLoader.updateSceneData(record.entity.get('resource_id'), record.entity._data2);
                editor.call('make:scene:dirty');

                if (preserveTransform && record.position) {
                    // record.entity.node.position = record.position;
                    // record.entity.node.rotation = record.rotation;

                    // var localPosition = record.entity.node.position;
                    // var localRotation = record.entity.node.rotation;
                    // record.entity.set('position', [localPosition.x, localPosition.y, localPosition.z]);
                    // record.entity.set('rotation', [localRotation.x, localRotation.y, localRotation.z]);
                }

                // record.parent.history.enabled = true;
                // record.parentOld.history.enabled = true;
                // record.entity.history.enabled = true;
                record.entity.reparenting = false;
            }

            // TODO: history

            resizeQueue();
            // editor.call('viewport:render');
        });

        // selector add
        editor.on('selector:add', function (entity: Observer, type: string) {
            if (type !== 'entity')
                return;

            self.uiItemIndex[entity.get('resource_id')].selected = true;
        });

        // selector remove
        editor.on('selector:remove', function (entity: Observer, type: string) {

            if (type !== 'entity')
                return;

            self.uiItemIndex[entity.get('resource_id')].selected = false;
        });

        // selector change
        editor.on('selector:change', function (type: string, items: Observer[]) {
            if (type !== 'entity') {
                hierarchy.clear();
            } else {
                var selected = hierarchy.selected;
                var ids: any = {};

                // build index of selected items
                for (var i = 0; i < items.length; i++) {
                    ids[items[i].get('resource_id')] = true;
                };

                // deselect unselected items
                for (var i = 0; i < selected.length; i++) {
                    if (!ids[selected[i].entity.get('resource_id')])
                        selected[i].selected = false;
                }
            }
        });


        // entity removed
        editor.on('entities:remove', function (entity: Observer) {
            self.uiItemIndex[entity.get('resource_id')].destroy();
            resizeQueue();
        });


        // element.append();
        var componentList: any;
        // entity added
        editor.on('entities:add', function (entity: Observer, isRoot: boolean) {

            // console.log('add hierarchy entity: ' + entity.get('name'));
            if (entity.get('type') === 'transformnode' || entity.get('type') === 'mesh') {
                entity.node = VeryEngine.viewScene.getNodeByID(entity.get('resource_id'));
            }
            var classList = ['tree-item-entity', 'entity-id-' + entity.get('resource_id')];
            if (isRoot) {
                classList.push('tree-item-root');
            }

            var element = new TreeItem({
                text: entity.get('name'),
                classList: classList
            });

            if (!isRoot) {
                if (entity.get('type') === 'camera') {
                    element.class?.add('c-camera');
                } else if (entity.get('type') === 'light') {
                    element.class?.add('c-light');
                } else {
                    element.class?.add('c-model');
                }
            }


            element.entity = entity;
            element.enabled = entity.get('enabled');


            if (!componentList)
                componentList = editor.call('components:list');

            // entity.reparenting = false;

            // index
            self.uiItemIndex[entity.get('resource_id')] = element;

            // name change
            entity.on('name:set', function (value: string) {
                element.text = value;
                resizeQueue();
            });

            entity.on('enabled:set', function (value: boolean) {
                element.enabled = value;
            });

            entity.on('children:move', function (value: string, ind: number, indOld: number) {
                var item = self.uiItemIndex[value];
                if (!item || item.entity.reparenting)
                    return;

                element.remove(item);

                var next = self.uiItemIndex[entity.get('children.' + (ind + 1))];
                var after = null;
                let isNext: boolean = next ? true : false;
                if (next === item) {
                    // next = null;
                    isNext = false;

                    if (ind > 0)
                        after = self.uiItemIndex[entity.get('children.' + ind)]
                }

                if (item.parent)
                    (<TreeItem>item.parent).remove(item);

                if (next) {
                    element.appendBefore(item, next);
                } else if (after) {
                    element.appendAfter(item, after);
                } else {
                    element.append(item);
                }
            });

            // remove children
            entity.on('children:remove', function (value: string) {
                var item = self.uiItemIndex[value];
                if (!item || item.entity.reparenting)
                    return;

                element.remove(item);
            });

            // add children
            entity.on('children:insert', function (value: string, ind: number) {

                // console.warn('children:insert in hierarchy-panel');
                var item = self.uiItemIndex[value];

                if (!item || item.entity.reparenting)
                    return;

                if (item.parent)
                    (<TreeItem>item.parent).remove(item);

                var next = self.uiItemIndex[entity.get('children.' + (ind + 1))];
                if (next) {
                    element.appendBefore(item, next);
                } else {
                    element.append(item);
                }
            });

            // collaborators
            var users = element.users = document.createElement('span');
            users.classList.add('users');
            element.elementTitle.appendChild(users);

            // if (entity.get('root')) {
            //     // root
            //     hierarchy.append(element);
            //     element.open = true;
            // } else {
            //     if(entity.get('parent') === editor.call('entities:root').get('resource_id')) {
            //         rootParent.append(element);
            //     }
            // }

            // var children = entity.get('children');
            // if (children.length) {
            //     for (var c = 0; c < children.length; c++) {
            //         var child = self.uiItemIndex[children[c]];
            //         if (!child) {
            //             var err = 'Cannot find child entity ' + children[c];
            //             editor.call('status:error', err);
            //             console.error(err);
            //             continue;
            //         }
            //         element.append(child);
            //     }
            // }

            resizeQueue();

        });


        // append all treeItems according to child order
        // 加载scene数据后，统一运行一遍，设定tree item
        editor.on('entities:load', function (upload?: boolean) {
            var entities = editor.call('entities:list');

            // var datas: any = {};

            // var path1: string = '';
            // var path2: string = '';
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                // if (upload) {
                //     datas[entity.get('resource_id')] = entity.origin;
                // }

                // console.warn(entity.get('resource_id'));

                // if (entity.get('asset') && entity.get('asset2')) {
                //     path1 = entity.get('asset');
                //     path2 = entity.get('asset2');
                // }

                var element = self.uiItemIndex[entity.get('resource_id')];

                if (entity.get('root')) {
                    // root
                    hierarchy.append(element);
                    element.open = true;
                    rootParent = element;
                }
                // else {
                //     if (entity.get('parent') === '') {
                //         rootParent.append(element);
                //     }
                // }

                var children = entity.get('children');
                if (children.length) {
                    for (var c = 0; c < children.length; c++) {
                        var child = self.uiItemIndex[children[c]];
                        if (!child) {
                            var err = '父物体： ' + entity.get('name') + '，hierarchy菜单无法关联到子物体，子物体ID：' + children[c];
                            editor.call('status:error', err);
                            console.error(err);
                            continue;
                        }
                        element.append(child);
                    }
                }
            }

            // if (upload) {
            //     axios.post('/api/addScene', { projectID: Config.projectID, entities: datas, path1: path1, path2: path2 })
            //         .then(response => {
            //             var data = response.data;
            //             if (data.code === '0000') {
            //                 console.log(data.data);
            //             } else {
            //                 console.error(data.message);
            //             }
            //         })
            //         .catch(
            //             error => {
            //                 console.error(error);
            //             }

            //         );
            // }

            // if (path1 && path2 && !upload) {
            //     editor.call('loadTempModel2', path1, path2);
            // }
        });


        // deleting entity
        editor.on('entity:delete', function (entity: Observer) {
            editor.call('entities:remove', entity);
        });

        // get entity item
        editor.method('entities:panel:get', function (resourceId: string) {
            return self.uiItemIndex[resourceId];
        });

        // highlight entity
        editor.method('entities:panel:highlight', function (resourceId: string, highlight: boolean) {
            var item = self.uiItemIndex[resourceId];
            if (!item) return;

            if (highlight)
                item.class!.add('highlight');
            else
                item.class!.remove('highlight');
        });

    }

}