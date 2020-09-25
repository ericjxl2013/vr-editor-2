export class Resources {

    public constructor () {

    }


    public static get(url: string) {
        // return new AjaxRequest({ url: url });
    }

    public static post(url: string, data: any) {
        // return new AjaxRequest({
        //     method: 'POST',
        //     url: url,
        //     data: data
        // });
    }

    public static put = function (url: string, data: any) {
        // return new AjaxRequest({
        //     method: 'PUT',
        //     url: url,
        //     data: data
        // });
    }

    public static delete = function (url: string) {
        // return new AjaxRequest({
        //     method: 'DELETE',
        //     url: url
        // });
    }


}