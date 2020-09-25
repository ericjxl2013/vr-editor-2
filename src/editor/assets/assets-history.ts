import { Observer } from "../../lib";
import { ObserverHistory } from "../../lib/observer-history";

export class AssetsHistory {

    public constructor() {

        // editor.on('assets:add', function (asset: Observer) {
        //     if (asset.history)
        //         return;

        //     var id = asset.get('id');

        //     asset.history = new ObserverHistory({
        //         item: asset,
        //         prefix: 'asset.' + id + '.',
        //         getItemFn: function () {
        //             return editor.call('assets:get', id);
        //         }
        //     });

        //     // record history
        //     asset.history.on('record', function (action, data) {
        //         editor.call('history:' + action, data);
        //     });
        // });

    }

}