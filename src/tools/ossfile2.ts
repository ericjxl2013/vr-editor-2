/**
 * 并发上传未处理版本
 */
import { PostParam } from './axios';
import {getAssetJsonVersion,getLocalAssetJson,setAssetJsonVersion,setLocalAssetJson} from './indexeddb';

export let stsInf:sts|null;
interface sts { 
    Expiration: number;
    AccessKeyId:string;
    AccessKeySecret:string;
    SecurityToken:string;
  }
export let client: OSS | null = null;

export let getSts = async () => {
    return new Promise<OSS | null>(async (resolve) => {
        if (stsInf == null || stsInf.Expiration - new Date().getTime() < 0) {
            let data = await PostParam('/Power/sts',{});
            stsInf = data.data.data;
            if (stsInf && stsInf.AccessKeyId && stsInf.AccessKeySecret && stsInf.SecurityToken) {
                let opp = {
                    region: 'oss-cn-hangzhou',
                    accessKeyId: stsInf.AccessKeyId,
                    accessKeySecret: stsInf.AccessKeySecret,
                    stsToken: stsInf.SecurityToken,
                    bucket: 'veryenginedb'
                };
                client = new OSS(opp);
                resolve(client);
            }
            else {
                resolve(null);
            }
        }
        else {
            resolve(client);
        }
    })
}

let getSuffix=function(fileName:string){
    if(fileName){
        let nameSplit=fileName.split('.');
        if(nameSplit.length>1)
            return nameSplit[1];
        else
            return fileName;
    }
    else{
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
export let uploadFile=async(file:File,projectId:string,assetId:string,fileName:string,hash?:string)=>{
    return new Promise<boolean>(async (resolve) => {
        if(hash){
            setAssetJsonVersion(projectId,assetId,hash);
        }
        else{
            let result=await PostParam("Dev/updateAssetVersion",{softwareId:projectId,assetId:assetId});
            if(result.data.data){
                setAssetJsonVersion(projectId,assetId,result.data.data);
            }
        }
        var reader = new FileReader();
        reader.onload = function(e){
            // target.result 该属性表示目标对象的DataURL
            if(reader.result instanceof ArrayBuffer)
            {
                let data = new Blob([new Uint8Array(reader.result)]);
                setLocalAssetJson(projectId,assetId,data);
            }
        }
        let suffix=getSuffix(fileName);
        reader.readAsArrayBuffer(file);
        let client = await getSts();
        let filePath = 'project/' + projectId + "/ALL/assets/";
        fileName=filePath+assetId+"."+suffix;
        try{
            await client!.put(filePath,file);
            if(isImage(fileName))
                await client!.putACL(filePath, 'public-read');
            resolve(true);
        }
        catch{
            resolve(false);
        }
    })
}

let isImage=function(fileName:string){
    if(fileName.endsWith('.jpg')||fileName.endsWith('.png')||fileName.endsWith('jpeg')||fileName.endsWith('gif')){
        return true;
    }
    else{
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
export let uploadJsonAsset=async(assetStr:string,projectId:string,assetId:string,fileName:string,mode:boolean=true)=>{
    return new Promise<boolean>(async (resolve) => {
        setLocalAssetJson(projectId,assetId,assetStr);
        
        if(mode){
            let result= await PostParam("/Dev/updateAssetVersion",{softwareId:projectId,assetId:assetId});
            if(result.data.data){
                setAssetJsonVersion(projectId,assetId,result.data.data);
            }
            if(!assetStr){
                assetStr=await getLocalAssetJson(projectId,assetId) as string;
            }
            let client = await getSts();
            let assetPath=assetId+'.'+getSuffix(fileName);
            let filePath = 'project/' + projectId + "/ALL/assets/";
            filePath = filePath + assetPath;
            let data = new Blob([assetStr]);
            try {
                await client!.put(filePath, data);
                resolve(true);
            }
            catch{
                resolve(false);
            }
        }
        else{
            resolve(false);
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

export let getJsonAsset = async (projectId:string,assetId:string,fileName:string,hash?:string) => {
    return new Promise<string>(async (resolve, reject) => {
        let tag=false;
        if(hash){
            let localHash=await getAssetJsonVersion(projectId,assetId);
            if(!localHash||localHash!=hash){
                tag=true;
                setAssetJsonVersion(projectId,assetId,hash);
            }
            else{
                let jsonhash=await getLocalAssetJson(projectId,assetId);
                var reader = new FileReader();
                reader.onload = function(){
                     resolve(reader.result as string);
                };
                reader.readAsText(jsonhash as Blob);
            }
        }
        else{
            let serverResult= await PostParam("Dev/queryAssetVersion",{softwareId:projectId,assetId:assetId});
            let localVersion=await getAssetJsonVersion(projectId,assetId);
            if(!serverResult.data.data&&!localVersion){
                resolve("");
            }
            else if(localVersion&&(!serverResult.data.data||serverResult.data.data<=localVersion)){
                let jsonStr=await getLocalAssetJson(projectId,assetId);
                resolve(jsonStr as string);
            }
            else{
                setAssetJsonVersion(projectId,assetId,serverResult.data.data);
                tag=true;
            }
        }
        if(tag){
            let client = await getSts();
            let filePath = 'project/' + projectId + "/ALL/assets/";
            let result = await client!.list({prefix: filePath,delimiter: '/'});
            filePath = filePath + assetId+"."+getSuffix(fileName);
            let existtag=true;
            if(result.objects){
                for(let i=0;i<result.objects.length;i++){
                    if(result.objects[i].name==filePath){
                        existtag=false;
                    }
                }
            }
            if(existtag){
                resolve("");
            }
            else{
                let url = client!.signatureUrl(filePath, { expires: 3600 });
                let r = await axios.get(url, { responseType: 'blob' });//getBlob(url);
                let data = r.data;
                if(hash)
                    setLocalAssetJson(projectId,assetId,data);
                var reader = new FileReader();
                reader.readAsText(data, 'utf-8');
                reader.onload = function () {
                    var str=reader.result!.toString();
                    if(!hash)
                        setLocalAssetJson(projectId,assetId,str);
                    resolve(str);
                };
                reader.onerror = function (err) {
                    reject(err);
                }
            }
        }
    })
}
let urls:any={};


/**
 * 获取文件的网址
 */
export let getUrl=async (projectId:string,assetId:string,fileName:string,hash:string) => {
    return new Promise<string>(async (resolve, reject) => {
        let filehash=await getAssetJsonVersion(projectId,assetId);
        if(filehash==hash)
        {
            if(urls[assetId]){
                resolve(urls[assetId]);
            }
            else{
                let fileBlob=await getLocalAssetJson(projectId,assetId);
                let url=URL.createObjectURL(fileBlob);
                urls[assetId]=url;
                resolve(url);
            }
        }
        else
        {
            let url = client!.signatureUrl('project/' + projectId + "/ALL/assets/"+assetId+"."+getSuffix(fileName), { expires: 3600 });
            getJsonAsset(projectId,assetId,fileName,hash);
            resolve(url);
        }
    })
}

/**
 * 获取图文缩略图的网址
 */
export let getThumbnailUrl=async (projectId:string,assetId:string,fileName:string,hash:string) => {
    return new Promise<string>(async (resolve, reject) => {
        if(!isImage(fileName)){
            reject(fileName+",该文件不是图片类型，无法获取缩略图");
        }
        let thumbnailAssetId=assetId+"t";
        let filehash=await getAssetJsonVersion(projectId,assetId);
        if(filehash==hash)
        {
            if(urls[thumbnailAssetId]){
                resolve(urls[thumbnailAssetId]);
            }
            else{
                let fileBlob=await getLocalAssetJson(projectId,thumbnailAssetId);
                if(!fileBlob)
                 fileBlob=await getLocalAssetJson(projectId,assetId);
                let url=URL.createObjectURL(fileBlob);
                urls[thumbnailAssetId]=url;
                resolve(url);
            }
        }
        else
        {
            let url = client!.signatureUrl('project/' + projectId + "/ALL/assets/"+assetId+"."+getSuffix(fileName), {expires: 3600, process: 'style/myThumbnail'});
            let r = await axios.get(url, { responseType: 'blob' });//getBlob(url);
            let data = r.data;
            setLocalAssetJson(projectId,thumbnailAssetId,data);
            resolve(url);
        }
    })
}


/**
 * 下载asset内容
 */
export let donwLoad=async(projectId:string,assetId:string,fileName:string,hash:string)=>{
    let url=await getUrl(projectId,assetId,fileName,hash);
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
export let upLoadJsonConfig = async (josnStr: string, projectId: string,jsonName:string) => {
    return new Promise<boolean>(async (resolve) => {
        let nameSplit=jsonName.split('.');
        jsonName=nameSplit[0];
        let result=await PostParam("Dev/updateAssetVersion",{softwareId:projectId,assetId:jsonName});
        if(result.data.data){
            setAssetJsonVersion(projectId,jsonName,result.data.data);
        }
        setLocalAssetJson(projectId,jsonName,josnStr);
        let client = await getSts();
        let filePath = 'project/' + projectId + "/ALL/";
        filePath = filePath + jsonName + '.json';
        let data = new Blob([josnStr]);
        try {
            await client!.put(filePath, data);
            resolve(true);
        }
        catch{
            resolve(false);
        }
    })
}


/**
 * 获取json的配置文件
 * @param projectId  项目id
 * @param jsonName  json名，不需要后缀
 */
export let getJsonConfig = async (projectId: string, jsonName:string) => {
    return new Promise<string>(async (resolve, reject) => {
        let serverResult= await PostParam("Dev/queryAssetVersion",{softwareId:projectId,assetId:jsonName});
        let localVersion=await getAssetJsonVersion(projectId,jsonName);
        if(!serverResult.data.data&&!localVersion){
            resolve("");
        }
        else if(localVersion&&(!serverResult.data.data||serverResult.data.data<=localVersion)){
            let jsonStr=await getLocalAssetJson(projectId,jsonName);
            resolve(jsonStr as string);
        }
        else{
            let client = await getSts();
            let filePath = 'project/' + projectId + "/ALL/";
            let result = await client!.list({prefix: filePath,delimiter: '/'});
            filePath = filePath + jsonName + '.json';
            let existtag=true;
            if(result.objects){
                for(let i=0;i<result.objects.length;i++){
                    if(result.objects[i].name==filePath){
                        existtag=false;
                    }
                }
            }
            if(existtag){
                resolve("");
            }
            else{
                setAssetJsonVersion(projectId,jsonName,serverResult.data.data);
                let url = client!.signatureUrl(filePath, { expires: 3600 });
                let r = await axios.get(url, { responseType: 'blob' });//getBlob(url);
                let data = r.data;
                var reader = new FileReader();
                reader.readAsText(data, 'utf-8');
                reader.onload = function (e) {
                    var valueStr=reader.result!.toString();
                    setLocalAssetJson(projectId,jsonName,valueStr);
                    resolve(valueStr);
                };
                reader.onerror = function (err) {
                    reject(err);
                }
            }
        }
    })
}


export let login=async(projectID:string,refer:string)=>{
    return new Promise<any>(async (resolve, reject) => {

        let r:any={};
        let userId=parseInt(window.location.search.substring(1));
        userId=4;
        console.log(4);
        if(userId==-1||userId==NaN){
            reject('无法获取用户id');
        }
        try
        {
            if(true)//(refer&&refer.indexOf("admin.veryengine.cn")>0)
            {
                var response=await PostParam("/User/Login4",{userId:userId,softwareId:projectID});
                var data=response.data;
                if (data.code === "00000") {

                }
                else{
                    console.error(data.message);
                }
            }
            var response=await PostParam("/Software/SoftwareName",{softwareId:projectID});
            var data=response.data;
            if (data.code === "00000") {
                r.data= data.data;
                r.code="00000";
            }
            else{
                r.code="1";
                r.message=data.message;
            }
            resolve(r);
        }
        catch(e){
            reject(e);
        }
    });

}