const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
// var locker = require("./lock");

const renameFile = function (oldpath, newpath) {
    return new Promise((resovle, reject) => {
        fs.rename(oldpath, newpath, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

const createUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// 秒时间戳
const createAssetID = () => {
    return (
        Math.round(new Date() / 1000).toString() +
        "-" +
        createUuid().substring(0, 8)
    );
};

function getRealTime(str) {
    if (str < 10) {
        return "0" + str;
    }
    return str;
}

function createdAtTime() {
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

const overwriteFile = function (url, data) {
    return new Promise((resovle, reject) => {
        fs.writeFile(url, data, "binary", (err) => {
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

const copyFile = (src, dest) => {
    return new Promise((resovle, reject) => {
        fs.copyFile(src, dest, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

// 上传全新的资源
exports.upload = async (ctx, next) => {
    const form = formidable({ multiples: false });
    // console.log(ctx.request.body);
    // console.log(form);
    // console.log(ctx.req);
    var file;
    var projectID;
    var assetFields;
    var backData = [];

    await new Promise((resolve, reject) => {
        form.uploadDir = "dist/assets/temp";
        form.hash = "sha1";
        form.parse(ctx.req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            // console.log(files);
            console.log(fields);
            file = files["file"];
            projectID = fields.projectID;
            assetFields = fields;
            resolve();
        });
    });
    var filename;
    var assetData = {};
    if (file) {
        if (file.length === undefined) {
            var assetID = createAssetID();
            await mkDir("dist/assets/" + assetID);
            var newpath = "dist/assets/" + assetID + "/" + file.name;

            //改名
            var oldpath = file.path;
            filename = file.name;
            await renameFile(oldpath, newpath);

            var createdAt = createdAtTime();
            assetData = {
                id: assetID,
                type: assetFields.type,
                createdAt: createdAt,
                modifiedAt: createdAt,
                name: assetFields.name,
                preload: assetFields.preload,
                has_thumbnail: false,
                scope: {
                    type: "project",
                    id: projectID,
                },
                file: {
                    filename: file.name,
                    size: file.size,
                    hash: file.hash,
                },
                data: null,
                path:
                    assetFields.path === "" ? [] : assetFields.path.split(","),
            };

            // 最近的文件夹path值
            var closestPath =
                !assetData.path || assetData.path.length === 0
                    ? "root"
                    : assetData.path[assetData.path.length - 1];

            // TODO: 同时上传多个文件，异步读写文件，文件信息出错
            var assetFile = fs.readFileSync(
                "dist/projects/" + projectID + "/assets.json"
            );

            assetFile = JSON.parse(assetFile);

            if (!assetFile.assets) {
                assetFile["assets"] = {};
            }

            // 与babylon文件进行索引
            if (assetFields.type === "texture") {
                assetData["has_thumbnail"] = true;

                if (assetFile.assets[assetID] === undefined) {
                    assetFile.assets[assetID] = assetData;
                }
                backData.push(assetData);

                // 添加resource 信息
                if (!assetFile.babylon_resource) {
                    assetFile["babylon_resource"] = {};
                }
                // babylon_resource path信息
                if (!assetFile.babylon_resource[closestPath]) {
                    assetFile.babylon_resource[closestPath] = {};
                }
                assetFile.babylon_resource[closestPath][assetID] = true;
                // 关联babylon material
                if (!assetFile.babylon) {
                    assetFile["babylon"] = { path: {} };
                }
                if (assetFile.babylon.path[closestPath]) {
                    var babylons = assetFile.babylon.path[closestPath];
                    for (var babylonKey in babylons) {
                        if (
                            assetFile.babylon[babylonKey] &&
                            assetFile.babylon[babylonKey].materials
                        ) {
                            var itemData =
                                assetFile.babylon[babylonKey].materials;
                            for (var matKey in itemData) {
                                for (var itemKey in itemData[matKey]) {
                                    if (itemKey === "asset_id") {
                                        continue;
                                    }
                                    // 关联判断,bingo
                                    if (
                                        itemData[matKey][itemKey] ===
                                        assetFields.name
                                    ) {
                                        // 修改material参数
                                        if (
                                            itemData[matKey]["asset_id"] &&
                                            assetFile.assets[
                                                itemData[matKey]["asset_id"]
                                            ]
                                        ) {
                                            assetFile.assets[
                                                itemData[matKey]["asset_id"]
                                            ].data[itemKey][
                                                "texture_id"
                                            ] = assetID;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (assetFields.type === "model") {
                if (assetFile.assets[assetID] === undefined) {
                    assetFile.assets[assetID] = assetData;
                }
                backData.push(assetData);

                var ext1 = file.name.split(".");
                var ext = ext1[ext1.length - 1].toLowerCase();

                // babylon文件解析
                if (ext === "babylon") {
                    if (!assetFile.babylon) {
                        assetFile["babylon"] = { path: {} };
                    }
                    // resource 信息
                    if (!assetFile.babylon_resource) {
                        assetFile["babylon_resource"] = {};
                    }
                    // babylon path信息
                    if (!assetFile.babylon.path[closestPath]) {
                        assetFile.babylon.path[closestPath] = {};
                    }
                    assetFile.babylon.path[closestPath][assetID] = true;
                    // babylon material信息
                    assetFile.babylon[assetID] = { materials: {} };
                    // 读取文件
                    var babylonFile = await readFile(newpath);
                    babylonFile = JSON.parse(babylonFile);
                    if (babylonFile.materials) {
                        for (
                            var i = 0, len = babylonFile.materials.length;
                            i < len;
                            i++
                        ) {
                            var matID = createAssetID();
                            var matData = babylonFile.materials[i];
                            var matAssetData = {
                                id: matID,
                                type: "material",
                                createdAt: createdAt,
                                modifiedAt: createdAt,
                                name: matData.name,
                                preload: false,
                                has_thumbnail: false,
                                scope: {
                                    type: "project",
                                    id: projectID,
                                },
                                file: null,
                                data: matData,
                                path: assetData.path,
                            };
                            // 更新整体数据
                            if (assetFile.assets[matID] === undefined) {
                                assetFile.assets[matID] = matAssetData;
                            }
                            backData.push(matAssetData);
                            // 更新
                            assetFile.babylon[assetID]["materials"][
                                matData.id
                            ] = {
                                asset_id: matID,
                            };
                            // 检测texture
                            if (matData.diffuseTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["diffuseTexture"] =
                                    matData.diffuseTexture.name;
                            }
                            if (matData.specularTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["specularTexture"] =
                                    matData.specularTexture.name;
                            }
                            if (matData.reflectionTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["reflectionTexture"] =
                                    matData.reflectionTexture.name;
                            }
                            if (matData.refractionTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["refractionTexture"] =
                                    matData.refractionTexture.name;
                            }
                            if (matData.emissiveTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["emissiveTexture"] =
                                    matData.emissiveTexture.name;
                            }
                            if (matData.bumpTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["bumpTexture"] = matData.bumpTexture.name;
                            }
                            if (matData.opacityTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["opacityTexture"] =
                                    matData.opacityTexture.name;
                            }
                            if (matData.ambientTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["ambientTexture"] =
                                    matData.ambientTexture.name;
                            }
                            if (matData.lightmapTexture) {
                                assetFile.babylon[assetID]["materials"][
                                    matData.id
                                ]["lightmapTexture"] =
                                    matData.lightmapTexture.name;
                            }
                        }
                    }

                    // texture关联
                    if (assetFile.babylon_resource[closestPath]) {
                        var resourceData =
                            assetFile.babylon_resource[closestPath];
                        var matData = assetFile.babylon[assetID]["materials"];
                        for (var mat_id in matData) {
                            for (var item_id in matData[mat_id]) {
                                if (item_id === "asset_id") continue;
                                for (var resource_id in resourceData) {
                                    // 条件成立
                                    if (
                                        assetFile.assets[resource_id].name ===
                                        matData[mat_id][item_id]
                                    ) {
                                        assetFile.assets[
                                            matData[mat_id]["asset_id"]
                                        ].data[item_id][
                                            "texture_id"
                                        ] = resource_id;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            fs.writeFileSync(
                "dist/projects/" + projectID + "/assets.json",
                JSON.stringify(assetFile)
            );
        } else {
            for (var i = 0; i < file.length; i++) {
                console.error("上传资源未知情况！！！！！");
                console.error(file[i]);
                var assetID = createAssetID();
                await mkDir("dist/assets/" + assetID);
                var newpath = "dist/assets/" + assetID + "/" + file[i].name;
                //改名
                var oldpath = file[i].path;
                filename = file[i].name;
                await renameFile(oldpath, newpath);
            }
        }
    } else {
        if (assetFields.type === "folder") {
            var assetID = createAssetID();
            var createdAt = createdAtTime();
            assetData = {
                id: assetID,
                type: assetFields.type,
                createdAt: createdAt,
                modifiedAt: createdAt,
                name: assetFields.name,
                preload: assetFields.preload,
                has_thumbnail: false,
                scope: {
                    type: "project",
                    id: projectID,
                },
                file: null,
                data: null,
                path:
                    assetFields.path === "" ? [] : assetFields.path.split(","),
            };
            // TODO: 同时上传多个文件，异步读写文件，文件信息出错
            var assetFile = fs.readFileSync(
                "dist/projects/" + projectID + "/assets.json"
            );
            assetFile = JSON.parse(assetFile);
            if (!assetFile.assets) {
                assetFile["assets"] = {};
            }
            if (assetFile.assets[assetID] === undefined) {
                assetFile.assets[assetID] = assetData;
            }
            backData.push(assetData);
            fs.writeFileSync(
                "dist/projects/" + projectID + "/assets.json",
                JSON.stringify(assetFile)
            );
        } else if (assetFields.type === "table") {
            var assetID = createAssetID();
            var createdAt = createdAtTime();
            await mkDir("dist/assets/" + assetID);
            var newpath = "dist/assets/" + assetID + "/" + assetFields.name;
            // 读写标准文件
            var tableData = await readFile("dist/standard/tableTest.json");
            await writeFile(newpath, tableData);
            fs.fi 

            var createdAt = createdAtTime();
            assetData = {
                id: assetID,
                type: assetFields.type,
                createdAt: createdAt,
                modifiedAt: createdAt,
                name: assetFields.name,
                preload: assetFields.preload !== undefined ? assetFields.preload : false,
                has_thumbnail: false,
                scope: {
                    type: "project",
                    id: projectID,
                },
                file: {
                    filename: assetFields.name,
                    size: 0,
                    hash: createUuid(),
                },
                data: null,
                path:
                    assetFields.path === "" ? [] : assetFields.path.split(","),
            };
            // TODO: 同时上传多个文件，异步读写文件，文件信息出错
            var assetFile = fs.readFileSync(
                "dist/projects/" + projectID + "/assets.json"
            );
            assetFile = JSON.parse(assetFile);
            if (!assetFile.assets) {
                assetFile["assets"] = {};
            }
            if (assetFile.assets[assetID] === undefined) {
                assetFile.assets[assetID] = assetData;
            }
            backData.push(assetData);
            fs.writeFileSync(
                "dist/projects/" + projectID + "/assets.json",
                JSON.stringify(assetFile)
            );
        }
    } 

    // await next();
    return ctx.send(backData);
};

exports.addScene = async (ctx, next) => {
    var data = ctx.request.body;
    console.log(data);

    var projectID = data.projectID;
    var sceneData = data.scene;
    var sceneIndex = data.sceneIndex;
    var oldData = await readFile("dist/projects/" + projectID + "/scenes.json");
    oldData = JSON.parse(oldData);
    oldData.scenes[sceneIndex] = sceneData;
    await writeFile(
        "dist/projects/" + projectID + "/scenes.json",
        JSON.stringify(oldData)
    );
    return ctx.send();
};

exports.changeAssets = async (ctx, next) => {
    const form = formidable({ multiples: false });
    const assetID = ctx.params.id;
    // console.log(ctx.request.body);
    // console.log(form);
    // console.log(ctx.req);
    var file;
    var projectID;
    var assetFields;
    var assetData = {};

    await new Promise((resolve, reject) => {
        form.uploadDir = "dist/assets/temp";
        form.hash = "sha1";
        form.parse(ctx.req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(assetID);
            console.log(fields);
            file = files["file"];
            assetFields = fields;
            projectID = fields.projectID;
            resolve();
        });
    });

    var assetFile = fs.readFileSync(
        "dist/projects/" + projectID + "/assets.json"
    );
    assetFile = JSON.parse(assetFile);

    // classify
    // change name
    if (assetFields.rename !== undefined) {
        console.log(assetFile.assets[assetID]);
        assetFile.assets[assetID].name = assetFields.rename;
        if (
            assetFile.assets[assetID].file !== null &&
            assetFile.assets[assetID].file !== undefined
        ) {
            var postfix = assetFile.assets[assetID].file.filename
                .split(".")
                .pop();
            var oldUrl =
                "dist/assets/" +
                assetID +
                "/" +
                assetFile.assets[assetID].file.filename;
            if (assetFields.rename.endsWith(postfix)) {
                assetFile.assets[assetID].file.filename = assetFields.rename;
            } else {
                assetFile.assets[assetID].file.filename =
                    assetFields.rename + "." + postfix;
            }

            assetFile.assets[assetID].modifiedAt = createdAtTime();

            // TODO: 改实际物体名字
            await renameFile(
                oldUrl,
                "dist/assets/" +
                    assetID +
                    "/" +
                    assetFile.assets[assetID].file.filename
            );
        }

        assetData = assetFile.assets[assetID];
    } else if (assetFields.move !== undefined) {
        var froms = assetFields.move.split(",");
        for (var i = 0; i < froms.length; i++) {
            var originItem = assetFile.assets[froms[i]];
            var originPath =
                !originItem.path || originItem.path.length === 0
                    ? "root"
                    : originItem.path[originItem.path.length - 1];
            if (assetFields.to === "") {
                assetFile.assets[froms[i]].path = [];
            } else {
                assetFile.assets[froms[i]].path = assetFile.assets[
                    assetFields.to
                ].path.slice(0);
                assetFile.assets[froms[i]].path.push(assetFields.to);
            }
            assetData[froms[i]] = assetFile.assets[froms[i]].path;
            assetFile.assets[froms[i]].modifiedAt = createdAtTime();

            // 如果有子文件夹
            var keys = Object.keys(assetFile.assets);
            for (var j = 0; j < keys.length; j++) {
                if (
                    keys[j] !== froms[i] &&
                    keys[j] !== assetFields.to &&
                    assetFile.assets[keys[j]].path !== undefined &&
                    assetFile.assets[keys[j]].path !== null
                ) {
                    var index = assetFile.assets[keys[j]].path.indexOf(
                        froms[i]
                    );
                    // 有文件夹
                    if (index !== -1) {
                        var lastPath = assetFile.assets[keys[j]].path.slice(
                            index
                        );
                        if (assetFields.to === "") {
                            assetFile.assets[keys[j]].path = lastPath;
                        } else {
                            assetFile.assets[keys[j]].path = assetFile.assets[
                                froms[i]
                            ].path.concat(lastPath);
                        }
                        assetFile.assets[keys[j]].modifiedAt = createdAtTime();
                        assetData[keys[j]] = assetFile.assets[keys[j]].path;
                    }
                }
            }

            // babylon或texture改变位置后，assets数据修改
            var item = assetFile.assets[froms[i]];
            var closestPath =
                !item.path || item.path.length === 0
                    ? "root"
                    : item.path[item.path.length - 1];
            if (item.type && item.type === "model") {
                var ext1 = item.name.split(".");
                var ext = ext1[ext1.length - 1].toLowerCase();
                if (ext === "babylon") {
                    // 先删除
                    if (!assetFile.babylon) {
                        assetFile["babylon"] = { path: {} };
                    }
                    if (!assetFile.babylon.path) {
                        assetFile.babylon["path"] = {};
                    }
                    if (assetFile.babylon.path[originPath]) {
                        delete assetFile.babylon.path[originPath][froms[i]];
                    }
                    // 再修改
                    if (!assetFile.babylon.path[closestPath]) {
                        assetFile.babylon.path[closestPath] = {};
                    }
                    assetFile.babylon.path[closestPath][froms[i]] = true;
                }
            } else if (item.type && item.type === "texture") {
                // 先删除
                if (!assetFile.babylon_resource) {
                    assetFile["babylon_resource"] = { };
                }
                if (assetFile.babylon_resource[originPath]) {
                    delete assetFile.babylon_resource[originPath][froms[i]];
                }
                // 再修改
                if (!assetFile.babylon_resource[closestPath]) {
                    assetFile.babylon_resource[closestPath] = {};
                }
                assetFile.babylon_resource[closestPath][froms[i]] = true;
            }
        }
    } else if (assetFields.replaceAsset !== undefined) {
        if(assetFields.type === "texture" && file) {
            // var newpath = "dist/assets/" + assetID + "/" + file.name;
            // await overwriteFile(newpath, file);
            var newpath = newpath = "dist/assets/" + assetID + "/" + file.name;
            await renameFile(file.path, newpath);
            // 修改文件大小属性、hash值等
            assetFile.assets[assetID].modifiedAt = createdAtTime();
            assetFile.assets[assetID].file["size"] = file.size;
            assetFile.assets[assetID].file["hash"] = file.hash;
            assetData = assetFile.assets[assetID];
            console.log(assetData);
        } else if (assetFields.type === "model") {
            // 待定，先不覆盖，直接上传新的数据
        }
    }

    fs.writeFileSync(
        "dist/projects/" + projectID + "/assets.json",
        JSON.stringify(assetFile)
    );

    // await next();
    return ctx.send(assetData);
};
