import { Config } from "../global";

export class Scenes {

    private _prefix: string = '（未保存）';

    public constructor() {

        let self = this;


        editor.method('make:scene:dirty', () => {
            if (!document.title.startsWith(self._prefix)) {
                document.title = self._prefix + document.title;
            }
            Config.isSceneDirty = true;
            // console.error('make:scene:dirty');
        });

        editor.method('make:scene:clear', () => {
            Config.isSceneDirty = false;
            if (document.title.startsWith(self._prefix)) {
                document.title = document.title.substring(self._prefix.length);
            }
        });



        // Create a scene and pass result to callback
        // editor.method('scenes:new', function (name: string, callback: Function) {
        //     var data = {
        //         projectId: config.project.id,
        //         branchId: config.self.branch.id
        //     };

        //     if (name) data.name = name;

        //     Ajax({
        //         url: '{{url.api}}/scenes',
        //         auth: true,
        //         method: 'POST',
        //         data: data
        //     })
        //         .on('load', function (status: boolean, data: any) {
        //             if (callback)
        //                 callback(data);
        //         });
        // });


    }


}