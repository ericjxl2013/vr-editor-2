
import { Ajax, AjaxRequest } from './ajax';
let getSuffix = function (fileName: string) {
    if (fileName) {
        let nameSplit = fileName.split('.');
        if (nameSplit.length > 1)
            return nameSplit[nameSplit.length - 1];
        else
            return fileName;
    }
    else {
        return "";
    }
}

/**
 * 上传文件
 * @param file 要上传的文件
 * @param projectId 软件id
 * @param assetId  文件的assetId
 * @param fileName  文件名
 * @param hash  文件hash值，若为undefined版本控制通过version序号实现
 */
export let uploadFile = async (file: File, projectId: string, assetId: string, fileName: string, hash?: string) => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            var form = new FormData();
            form.append('file', file);
            form.append('fileName', assetId + "." + getSuffix(fileName));
            var data = {
                url: "/api/uploadFile",
                method: 'PUT',
                // auth: true,
                data: form,
                ignoreContentType: true,
                headers: {
                    Accept: 'application/json'
                }
            };

            (<AjaxRequest>new Ajax(data)).on('load', (status: any, data: any) => {
                resolve();
            });

        }
        catch (e) {
            reject(e);
        }
    })
}

let isImage = function (fileName: string) {
    if (fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('jpeg') || fileName.endsWith('gif')) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * 上传assetStr
 * @param assetStr 要上传的assetStr内容
 * @param projectId 软件id
 * @param assetId  assetStr的assetId
 * @param fileName  assetStr名
 * @param mode  若为true:本地保存的同时同步到服务器上；false:只在本地缓存
 * @ignore mode为true时,assetJosn可为undefined,读取本地缓存同步到服务器
 */
export let uploadJsonAsset = async (assetStr: string, projectId: string, assetId: string, fileName: string, mode: boolean = true) => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            let response = await axios.post('/api/uploadJsonAsset', { jsonName: assetId + '.' + getSuffix(fileName), jsonStr: assetStr });
            var data = response.data;
            if (data.code === '0000') {
                resolve(data.data);
            }
            else {
                reject(data.message);
            }
        }
        catch (e) {
            reject(e);
        }
    })
}

/**
 * 获取asset json
 * @param projectId 软件id
 * @param assetId  assetStr的assetId
 * @param fileName  assetStr名
 * @param hash  assetStr的hash值，若为undefined，版本控制按version序号处理
 */

export let getJsonAsset = async (projectId: string, assetId: string, fileName: string, hash?: string) => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            let response = await axios.post('/api/getJsonAsset', { jsonName: (assetId + "." + getSuffix(fileName)) });
            var data = response.data;
            if (data.code === '0000') {
                resolve(data.data);
            }
            else {
                reject(data.message);
            }
        }
        catch (e) {
            reject(e);
        }
    });
}
let urls: any = {};


/**
 * 获取文件的网址
 */
export let getUrl = async (projectId: string, assetId: string, fileName: string, hash: string) => {
    return new Promise<string>(async (resolve, reject) => {
        resolve("/assets/" + assetId + "." + getSuffix(fileName));
    })
}

/**
 * 获取图文缩略图的网址
 */
export let getThumbnailUrl = async (projectId: string, assetId: string, fileName: string, hash: string) => {
    return new Promise<string>(async (resolve, reject) => {
        resolve("/assets/" + assetId + "." + getSuffix(fileName));
    })
}


/**
 * 下载asset内容
 */
export let donwLoad = async (projectId: string, assetId: string, fileName: string, hash: string) => {
    let url = await getUrl(projectId, assetId, fileName, hash);
    var a = document.createElement('a');
    a.innerHTML = fileName;

    // 指定生成的文件名
    a.download = fileName;
    a.href = url;

    document.body.appendChild(a);

    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", false, false);

    a.dispatchEvent(evt);

    document.body.removeChild(a);
}


/**
 * 上传json的配置文件
 * @param josnStr 配置文件的string内容
 * @param projectId  项目id
 * @param jsonName  json名，不需要后缀
 */
export let upLoadJsonConfig = async (jsonStr: string, projectId: string, jsonName: string) => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            let response = await axios.post('/api/uploadJsonConfig', { projectID: projectId, jsonName: jsonName, jsonStr: jsonStr });
            var data = response.data;
            if (data.code === '0000') {
                resolve(data.data);
            }
            else {
                reject(data.message);
            }
        }
        catch (e) {
            reject(e);
        }
    })
}


/**
 * 获取json的配置文件
 * @param projectId  项目id
 * @param jsonName  json名，不需要后缀
 */
export let getJsonConfig = async (projectID: string, jsonName: string) => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            let response = await axios.post('/api/getJsonConfig', { projectID: projectID, jsonName: jsonName });
            var data = response.data;
            if (data.code === '0000') {
                resolve(data.data);
            }
            else {
                reject(data.message);
            }
        }
        catch (e) {
            reject(e);
        }
    });
}


export let login = async (projectID: string, refer: string) => {
    return new Promise<any>(async (resolve, reject) => {
        try {
            let response = await axios.post("/api/getProject", { projectID: projectID });
            var data = response.data;
            if (data.code === '0000') {
                let r: any = {};
                r.code = "00000";
                r.data = data.data;
                resolve(r);
            }
            else {
                reject(data.message);
            }
        }
        catch (e) {
            reject(e);
        }

    });

}