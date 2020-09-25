const fs = require("fs");

//封装readfile为Promise
const readFile = function (url) {
    return new Promise((resovle, reject) => {
        // 设置编码格式
        fs.readFile(url, "utf8", (err, data) => {
            if (err) reject(err);
            resovle(data);
        });
    });
};

const writeFile = function (url, data) {
    return new Promise((resovle, reject) => {
        fs.writeFile(url, data, "utf8", (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

// 初始化时提取本地数据
exports.acquire = async (ctx, next) => {
    // let url = ctx.url;
    let request = ctx.request;
    let req_query = request.query;
    let req_queryString = request.querystring;
    let projectID = req_query.projectID;
    let assetID = req_query.id;
    let name = decodeURI(req_query.name);

    // console.log(url);
    // console.log(req_queryString);
    // console.log(name);
    var path = "dist/assets/" + assetID + "/" + name;
    if (!fs.existsSync(path)) {
        console.log("表格文件不存在：" + path);
        return ctx.sendError("0005", "表格文件不存在：" + path);
    } else {
        var data;
        try {
            data = await readFile(path);
        } catch {
            return ctx.sendError("0005", "表格文件不存在：" + path);
        }
        if (data) {
            // console.log('data: ' + data);
            return ctx.send(JSON.parse(data));
        } else {
            console.log("Empty");
            return ctx.sendError("0005", "表格为空：" + path);
        }
    }
};

// 接收客户端提交的表格数据
exports.commit = async (ctx, next) => {
    let request = ctx.request;
    let req_query = request.query;
    let req_queryString = request.querystring;
    let projectID = req_query.projectID;
    let assetID = req_query.id;
    let name = decodeURI(req_query.name);
    

    let data = ctx.request.body;

    var path = "dist/assets/" + assetID + "/" + name;
    // console.log('数据：' + data);
    if (data) {
        if (!fs.existsSync(path)) {
            console.log("表格文件不存在：" + path);
            return ctx.sendError("0005", "表格文件不存在：" + path);
        } else {
            // 数据格式
            try {
                await writeFile(path, JSON.stringify(data));
                return ctx.send("success");
            } catch (err) {
                console.log("write file error: " + err);
                return ctx.sendError("0004", "save error: " + err);
            }
        }
    } else {
        return ctx.sendError("0004", "undifined data! check please!");
    }
};

// 存储数据为txt表格
