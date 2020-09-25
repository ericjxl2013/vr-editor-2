import { Observer } from '../../lib';
import { Config } from '../global';

export class AssetsCreateTable {


    public constructor() {
        editor.method('assets:create:table', function (args: any) {

            if(Config.tableAssetsID !== '') {
                console.warn('抱歉，暂时只允许创建一个表格！');
                editor.call('status:text', '抱歉，暂时只允许创建一个表格！');
                return;
            }
            // if (!editor.call('permissions:write'))
            //     return;
            args = args || {};

            var path: string[] = [];
            var currentFolder = editor.call('assets:panel:currentFolder');

            if (currentFolder && currentFolder.get)
                path = currentFolder.get('path').concat(currentFolder.get('id'));

            var asset = {
                name: '新表格.table',
                type: 'table',
                source: false,
                preload: false,
                parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
                filename: '新表格.table',
                // file: new Blob(['{ }'], { type: 'application/json' }),
                scope: {
                    type: 'project',
                    id: Config.projectID
                },
                path: path.join(',')
            };

            // console.warn('创建表格');

            editor.call('assets:create', asset);
        });

        // TODO: 简单处理
        editor.method('assets:open-table', (table_name: string) => {
            // console.log(table_name);
            window.open(window.location.protocol + '//' + window.location.host + '/table/' + Config.projectID + '?name=' + table_name + '&id=' + Config.tableAssetsID);
        });

        editor.on('assets:add', function (asset: Observer) {
            if(asset.get('type') === 'table') {
                Config.tableAssetsID = asset.get('id');
                // console.log('设置表格ID：' + Config.tableAssetsID);
            }
        });

    }

}