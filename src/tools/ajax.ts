import { Events } from "./events";

export class Ajax {

    public constructor(args: object | string) {
        if (typeof (args) === 'string')
            args = { url: args };

        return new AjaxRequest(args);
    }

    public static get(url: string): AjaxRequest {
        return new AjaxRequest({ url: url });
    }

    public static post(url: string, data: any): AjaxRequest {
        return new AjaxRequest({
            method: 'POST',
            url: url,
            data: data
        });
    }

    public static put(url: string, data: any): AjaxRequest {
        return new AjaxRequest({
            method: 'PUT',
            url: url,
            data: data
        });
    }

    public static delete(url: string): AjaxRequest {
        return new AjaxRequest({
            method: 'DELETE',
            url: url
        });
    }

    public static params: { [key: string]: any } = {};

    public static param(name: string, value: any): void {
        Ajax.params[name] = value;
    }

}


export class AjaxRequest extends Events {

    private _progress: number = 0;

    private _xhr: XMLHttpRequest;

    public notJson: boolean;

    public constructor(args: any) {
        super();

        if (!args) {
            throw new Error('ajax请求无参数，请检查！')
        }

        this._progress = 0.0;
        this.emit('progress', this._progress);

        this._xhr = new XMLHttpRequest();

        // send cookies
        if (args.cookies)
            this._xhr.withCredentials = true;

        // events
        this._xhr.addEventListener('load', this._onLoad.bind(this), false);
        // this._xhr.addEventListener('progress', this._onProgress.bind(this), false);
        this._xhr.upload.addEventListener('progress', this._onProgress.bind(this), false);
        this._xhr.addEventListener('error', this._onError.bind(this), false);
        this._xhr.addEventListener('abort', this._onAbort.bind(this), false);

        // url
        let url: string = args.url;

        // query
        if (args.query && Object.keys(args.query).length) {
            if (url.indexOf('?') === -1) {
                url += '?';
            }

            var query = [];
            for (var key in args.query) {
                query.push(key + '=' + args.query[key]);
            }

            url += query.join('&');
        }

        // templating
        var parts = url.split('{{');
        if (parts.length > 1) {
            for (var i = 1; i < parts.length; i++) {
                var ends = parts[i].indexOf('}}');
                var key = parts[i].slice(0, ends);

                if (Ajax.params[key] === undefined)
                    continue;

                // replace
                parts[i] = Ajax.params[key] + parts[i].slice(ends + 2);
            }

            url = parts.join('');
        }

        // open request
        this._xhr.open(args.method || 'GET', url, true);

        // 返回数据是否为json格式
        this.notJson = args.notJson || false;

        // header for PUT/POST
        if (!args.ignoreContentType && (args.method === 'PUT' || args.method === 'POST' || args.method === 'DELETE'))
            this._xhr.setRequestHeader('Content-Type', 'application/json');

        // TODO: 权限header参数
        // if (args.auth && config.accessToken) {
        //     this._xhr.setRequestHeader('Authorization', 'Bearer ' + config.accessToken);
        // }

        if (args.headers) {
            for (var key in args.headers)
                this._xhr.setRequestHeader(key, args.headers[key]);
        }

        // stringify data if needed
        if (args.data && typeof (args.data) !== 'string' && !(args.data instanceof FormData)) {
            args.data = JSON.stringify(args.data);
        }

        // make request
        this._xhr.send(args.data || null);
    }

    private _onLoad(): void {
        this._progress = 1.0;
        this.emit('progress', 1.0);

        if (this._xhr.status === 200 || this._xhr.status === 201) {
            if (this.notJson) {
                this.emit('load', this._xhr.status, this._xhr.responseText);
            } else {
                try {
                    var json = JSON.parse(this._xhr.responseText);
                } catch (ex) {
                    this.emit('error', this._xhr.status || 0, new Error('invalid json'));
                    return;
                }
                this.emit('load', this._xhr.status, json);
            }
        } else {
            try {
                var json = JSON.parse(this._xhr.responseText);
                var msg = json.message;
                if (!msg) {
                    msg = json.error || (json.response && json.response.error);
                }

                if (!msg) {
                    msg = this._xhr.responseText;
                }

                this.emit('error', this._xhr.status, msg);
            } catch (ex) {
                this.emit('error', this._xhr.status);
            }
        }
    }

    private _onError(evt: any): void {
        this.emit('error', 0, evt);
    }

    private _onAbort(evt: any): void {
        this.emit('error', 0, evt);
    }

    private _onProgress(evt: any): void {
        if (!evt.lengthComputable)
            return;

        var progress = evt.loaded / evt.total;

        if (progress !== this._progress) {
            this._progress = progress;
            this.emit('progress', this._progress);
        }
    }

    public abort(): void {
        this._xhr.abort();
    }


}