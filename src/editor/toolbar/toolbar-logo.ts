import { Button } from "../../ui";

export class ToolbarLogo {

    public constructor() {

        var root = editor.call('layout.root');
        var toolbar = editor.call('layout.toolbar');

        var logo = new Button();
        logo.class!.add('logo');
        logo.on('click', function () {
            // menu.open = true;
            console.log('logo click');
        });
        toolbar.append(logo);


    }


}
