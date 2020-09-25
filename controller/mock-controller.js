const fs = require("fs");
const formidable = require("formidable");

const createUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

function getRealTime(str) {
    if (str < 10) {
        return "0" + str;
    }
    return str;
}

function createdAt() {
    var now = new Date();
    var Y = now.getFullYear();
    var m = getRealTime(now.getMonth() + 1);
    var d = getRealTime(now.getDate());
    var H = getRealTime(now.getHours());
    var i = getRealTime(now.getMinutes());
    // var s = getRealTime(now.getSeconds());
    return Y + "-" + m + "-" + d + " " + H + ":" + i;
}

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

const existsFile = (url) => {
    return new Promise((resovle, reject) => {
        fs.exists(url, (exists) => {
            resovle(exists);
        });
    });
};

const mkDir = (url) => {
    return new Promise((resovle, reject) => {
        fs.mkdir(url, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

const renameFile = function (oldpath, newpath) {
    return new Promise((resovle, reject) => {
        fs.rename(oldpath, newpath, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

exports.projects = async (ctx, next) => {
    var data;
    try {
        data = await readFile("dist/database/userinfo.json");
    } catch {
        return ctx.sendError("0002", "No Such File");
    }
    if (data) {
        var jsonData = JSON.parse(data);
        if (jsonData[global.mockUserName]) {
            // console.log(jsonData[global.mockUserName]);
            return ctx.send(jsonData[global.mockUserName]);
        } else {
            return ctx.sendError("0002", "Empty");
        }
    } else {
        console.log("settings文件为空");
        return ctx.sendError("0002", "Empty");
    }
};

exports.createProject = async (ctx, next) => {
    var data = ctx.request.body;
    // console.log(data);

    // 初始化项目文件
    // 判断根目录是否存在
    var exists = await existsFile("dist/projects");
    if (!exists) {
        await mkDir("dist/projects");
    } else {
        // console.log("目录存在：" + "dist/projects");
    }
    
    var dataFile={};
    exists = await existsFile("dist/database/projects.json");
    var dataFile;
    if (exists) {
        dataFile = await readFile("dist/database/projects.json");
        dataFile = JSON.parse(dataFile);
    } else {
        dataFile = {};
    }
    exists = true;
    var projectID = createUuid().substring(0, 8);
    while (exists) {
        if (dataFile[projectID] === undefined) {
            exists=false;
            dataFile[projectID]=data['name'];
            await mkDir("dist/projects/" + projectID);
            await writeFile(
                "dist/database/projects.json",
                JSON.stringify(dataFile)
            );
        }
        else{
            projectID = createUuid().substring(0, 8);
        }
    }
    // 用户数据更新
    exists = await existsFile("dist/database/userinfo.json");
    if (exists) {
        dataFile = await readFile("dist/database/userinfo.json");
        dataFile = JSON.parse(dataFile);
        if (dataFile[global.mockUserName] === undefined) {
            dataFile[global.mockUserName] = { projects: [] };
        }
    } else {
        dataFile = {};
        dataFile[global.mockUserName] = { projects: [] };
    }
    var createdTime = createdAt();
    // console.log(dataFile[global.mockUserName]);
    // console.log(dataFile[global.mockUserName]["projects"]);
    dataFile[global.mockUserName]["projects"].push({
        id: projectID,
        name: data["name"],
        createdAt: createdTime,
        icon: "",
    });
    await writeFile("dist/database/userinfo.json", JSON.stringify(dataFile));


    
    return ctx.send(
        dataFile[global.mockUserName]["projects"][
            dataFile[global.mockUserName]["projects"].length - 1
        ]
    );
};


exports.getProject = async (ctx, next) => {
    var data = ctx.request.body;
    var projectID = data.projectID;
    var exists = await existsFile(
        "dist/database/projects.json"
    );
    if (exists) {
        var fileData = await readFile(
            "dist/database/projects.json"
        );
        fileData = JSON.parse(fileData);
        if(fileData[projectID]){
            return ctx.send(fileData[projectID]);
        }
        else{
            return ctx.sendError("0002", "Empty");
        }
    } else {
        return ctx.sendError("0002", "Empty");
    }
};

exports.getJsonConfig = async (ctx, next) => {
    var data = ctx.request.body;
    var projectID = data.projectID;
    var jsonName=data.jsonName;
    var exists = await existsFile(
        "dist/projects/" + projectID + "/"+jsonName+".json"
    );
    if (exists) {
        var fileData = await readFile(
            "dist/projects/" + projectID + "/"+jsonName+".json"
        );
        return ctx.send(fileData);
    } else {
        return ctx.send("");
    }
};

exports.uploadJsonConfig=async (ctx, next) => {
    var data = ctx.request.body;
    var projectID = data.projectID;
    var jsonName=data.jsonName;
    var jsonStr=data.jsonStr;
    await writeFile( "dist/projects/" + projectID + "/"+jsonName+".json", jsonStr);
    ctx.send("true");
};

exports.uploadFile=async(ctx,next)=>{
    var fileName="";
    var file;
    const form = formidable({ multiples: false });
    await new Promise((resolve, reject) => {
        form.uploadDir = "dist/assets";
        form.parse(ctx.req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            fileName = fields.fileName;
            file = files["file"];
            resolve();
        });
    });
    await renameFile(file.path, "dist/assets/"+fileName);

    ctx.send("true");
}

exports.uploadJsonAsset=async(ctx,next)=>{
    var data = ctx.request.body;
    var jsonName=data.jsonName;
    var jsonStr=data.jsonStr;
    await writeFile( "dist/assets/" +jsonName, jsonStr);
    ctx.send("true");
}

exports.getJsonAsset = async (ctx, next) => {
    var data = ctx.request.body;
    var jsonName=data.jsonName;
    var exists = await existsFile(
        "dist/assets/" +jsonName
    );
    if (exists) {
        var fileData = await readFile(
            "dist/assets/" +jsonName
        );
        return ctx.send(fileData);
    } else {
        return ctx.send("");
    }
};
