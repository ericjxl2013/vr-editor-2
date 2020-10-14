import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
import { Config } from '../global';
import { UUid } from '../utility/uuid';
import { BabylonLoader } from '../middleware/loader/babylonLoader';


export class AssetsUpload {

    public constructor() {

        // 当前任务记录
        var uploadJobs = 0;
        var assetFile: any = {};
        var fileIndex = 0;
        var fileCount = 0;
        var userSettings: any = editor.call('settings:projectUser');
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;

        var targetExtensions: { [key: string]: boolean } = {
            'jpg': true,
            'jpeg': true,
            'png': true,
            'gif': true,
            'table': true,
            'html': true,
            'json': true,
            'xml': true,
            'txt': true,
            'vert': true,
            'frag': true,
            'glsl': true,
            'mp3': true,
            'ogg': true,
            'wav': true,
            'mp4': true,
            'm4a': true,
            'js': true,
            'atlas': true,
            'babylon': true
        };

        var typeToExt: { [key: string]: string[] } = {
            'model': ['fbx', 'dae', 'obj', '3ds', 'babylon'],
            'data': ['txt', 'xml', 'atlas', 'table'],
            'html': ['html'],
            'json': ['json'],
            'texture': ['tif', 'tga', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'dds', 'hdr', 'exr'],
            'audio': ['wav', 'mp3', 'mp4', 'ogg', 'm4a'],
            'shader': ['glsl', 'frag', 'vert'],
            'script': ['js'],
            'font': ['ttf', 'ttc', 'otf', 'dfont']
        };


        var extToType: { [key: string]: string } = {};
        for (var type in typeToExt) {
            for (var i = 0; i < typeToExt[type].length; i++) {
                extToType[typeToExt[type][i]] = type;
            }
        }


        editor.method('assets:canUploadFiles', function (files: any) {
            // check usage first
            var totalSize = 0;
            for (var i = 0; i < files.length; i++) {
                totalSize += files[i].size;
            }
            // 计算用户当前空间用量，假如要限制每个用户的空间大小，超过则不允许再上传
            // return config.owner.size + totalSize <= config.owner.diskAllowance;

            console.log('资源总容量：' + (totalSize / 1024 / 1024));

            return true;
        });


        var appendCommon = function (form: any, args: any) {
            // parent folder
            if (args.parent) {
                if (args.parent instanceof Observer) {
                    form.parent = args.parent.get('id');
                } else {
                    var id = parseInt(args.parent, 10);
                    if (!isNaN(id))
                        form.parent = (id + '');
                }
            }

            // filename
            if (args.filename) {
                form.filename = args.filename;
            }
            if (args.name) {
                form.name = args.name;
            }
            // file
            if (args.file && args.file.size) {
                form.file = args.file, (args.filename || args.name);
            }

            return form;
        };

        var create = function (args: any) {
            var formData: any = {};
            if (!args.type) {
                console.error('\'type\' required for upload request');
            }
            formData.type = args.type;
            if (args.tags) {
                formData.tags = args.tags.join('\n');
            }
            if (args.source_asset_id) {
                formData.source_asset_id = args.source_asset_id;
            }
            if (args.data) {
                formData.data = JSON.stringify(args.data);
            }
            if (args.meta) {
                formData.meta = JSON.stringify(args.meta);
            }
            formData.preload = args.preload === undefined ? true : args.preload;
            formData = appendCommon(formData, args);
            return formData;
        }

        var update = function (assetId: string, args: any) {
            var form: any = {};
            form.assetId = assetId;
            form = appendCommon(form, args);
            return form;
        };

        editor.method('assets:uploadFile', async (args: any, fn?: Function) => {
            // 单独处理创建表格或者文件夹类，不需要等待所有文件上传完毕后再修改asset josn
            if (fileCount == 0) {
                fileCount = 1;
                var assetJson = await ossfile.getJsonConfig(Config.projectID, 'assets');
                assetFile = JSON.parse(assetJson);
            }
            var form: any = {};
            let replaceMode: boolean = false;
            if (args.asset && args.type && args.type !== 'model') {
                var assetId = args.asset.get('id');
                form = update(assetId, args);
                replaceMode = true;
                form.replaceAsset = assetId;
                if (args.type) {
                    form.type = args.type;
                }
            } else {
                form = create(args);
            }

            form.projectID = Config.projectID;
            form.path = args.path;

            var job = ++uploadJobs;
            editor.call('status:job', 'asset-upload:' + job, 0);

            // 上传新资源
            if (!replaceMode) {
                var backData = [];
                var assetData: any = {};
                if (form.file) {
                    if (form.file.length == undefined) {
                        var hash = await UUid.getmd5(form.file);
                        var assetID = UUid.createAssetID();

                        // TODO: 上传文件入口，异常处理？？？
                        await ossfile.uploadFile(form.file, Config.projectID, assetID, form.name, hash);

                        var createdAt = UUid.createdAtTime();
                        assetData = {
                            id: assetID,
                            type: form.type,
                            createdAt: createdAt,
                            modifiedAt: createdAt,
                            name: form.name,
                            preload: form.preload,
                            has_thumbnail: false,
                            scope: {
                                type: 'project',
                                id: form.projectID,
                            },
                            file: {
                                filename: form.file.name,
                                size: form.file.size,
                                hash: hash,
                            },
                            data: null,
                            path: form.path === '' ? [] : form.path.split(','),
                        };
                        // 最近的文件夹path值
                        var closestPath = !assetData.path || assetData.path.length === 0 ? 'root' : assetData.path[assetData.path.length - 1];
                        if (!assetFile.assets) {
                            assetFile['assets'] = {};
                        }
                        // 与babylon文件进行索引
                        if (form.type === 'texture') {
                            assetData['has_thumbnail'] = true;

                            if (assetFile.assets[assetID] === undefined) {
                                assetFile.assets[assetID] = assetData;
                            }
                            backData.push(assetData);

                            // 添加resource 信息
                            if (!assetFile.babylon_resource) {
                                assetFile['babylon_resource'] = {};
                            }
                            // babylon_resource path信息
                            if (!assetFile.babylon_resource[closestPath]) {
                                assetFile.babylon_resource[closestPath] = {};
                            }
                            assetFile.babylon_resource[closestPath][assetID] = true;
                            // 关联babylon material
                            if (!assetFile.babylon) {
                                assetFile['babylon'] = { path: {} };
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
                                                if (itemKey === 'asset_id') {
                                                    continue;
                                                }
                                                // 关联判断,bingo
                                                if (
                                                    itemData[matKey][itemKey] ===
                                                    form.name
                                                ) {
                                                    // 修改material参数
                                                    if (
                                                        itemData[matKey]['asset_id'] &&
                                                        assetFile.assets[
                                                        itemData[matKey]['asset_id']
                                                        ]
                                                    ) {
                                                        assetFile.assets[
                                                            itemData[matKey]['asset_id']
                                                        ].data[itemKey][
                                                            'texture_id'
                                                        ] = assetID;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (form.type === 'model') {
                            if (assetFile.assets[assetID] === undefined) {
                                assetFile.assets[assetID] = assetData;
                            }
                            backData.push(assetData);

                            var ext1 = form.file.name.split('.');
                            var ext = ext1[ext1.length - 1].toLowerCase();

                            // babylon文件解析
                            if (ext === 'babylon') {
                                if (!assetFile.babylon) {
                                    assetFile['babylon'] = { path: {} };
                                }
                                // resource 信息
                                if (!assetFile.babylon_resource) {
                                    assetFile['babylon_resource'] = {};
                                }
                                // babylon path信息
                                if (!assetFile.babylon.path[closestPath]) {
                                    assetFile.babylon.path[closestPath] = {};
                                }
                                assetFile.babylon.path[closestPath][assetID] = true;
                                // babylon material信息
                                assetFile.babylon[assetID] = { materials: {} };
                                // 读取文件
                                var babylonFile;
                                babylonFile = await new Promise<string>((resolve, reject) => {
                                    var reader = new FileReader();
                                    reader.readAsText(form.file, 'utf-8');
                                    reader.onload = function (e) {
                                        resolve(reader.result!.toString());
                                    };
                                    reader.onerror = function (err) {
                                        reject(err);
                                    }
                                })
                                babylonFile = JSON.parse(babylonFile);
                                if (babylonFile.materials) {
                                    for (
                                        var i = 0, len = babylonFile.materials.length;
                                        i < len;
                                        i++
                                    ) {
                                        var matID = UUid.createAssetID();
                                        var matData = babylonFile.materials[i];
                                        var matAssetData = {
                                            id: matID,
                                            type: 'material',
                                            createdAt: createdAt,
                                            modifiedAt: createdAt,
                                            name: matData.name,
                                            preload: false,
                                            has_thumbnail: false,
                                            scope: {
                                                type: 'project',
                                                id: form.projectID,
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
                                        assetFile.babylon[assetID]['materials'][
                                            matData.id
                                        ] = {
                                            asset_id: matID,
                                        };
                                        // 检测texture
                                        if (matData.diffuseTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['diffuseTexture'] =
                                                matData.diffuseTexture.name;
                                        }
                                        if (matData.specularTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['specularTexture'] =
                                                matData.specularTexture.name;
                                        }
                                        if (matData.reflectionTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['reflectionTexture'] =
                                                matData.reflectionTexture.name;
                                        }
                                        if (matData.refractionTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['refractionTexture'] =
                                                matData.refractionTexture.name;
                                        }
                                        if (matData.emissiveTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['emissiveTexture'] =
                                                matData.emissiveTexture.name;
                                        }
                                        if (matData.bumpTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['bumpTexture'] = matData.bumpTexture.name;
                                        }
                                        if (matData.opacityTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['opacityTexture'] =
                                                matData.opacityTexture.name;
                                        }
                                        if (matData.ambientTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['ambientTexture'] =
                                                matData.ambientTexture.name;
                                        }
                                        if (matData.lightmapTexture) {
                                            assetFile.babylon[assetID]['materials'][
                                                matData.id
                                            ]['lightmapTexture'] =
                                                matData.lightmapTexture.name;
                                        }
                                    }
                                }

                                // texture关联
                                if (assetFile.babylon_resource[closestPath]) {
                                    var resourceData =
                                        assetFile.babylon_resource[closestPath];
                                    var matData = assetFile.babylon[assetID]['materials'];
                                    for (var mat_id in matData) {
                                        for (var item_id in matData[mat_id]) {
                                            if (item_id === 'asset_id') continue;
                                            for (var resource_id in resourceData) {
                                                // 条件成立
                                                if (
                                                    assetFile.assets[resource_id].name ===
                                                    matData[mat_id][item_id]
                                                ) {
                                                    assetFile.assets[
                                                        matData[mat_id]['asset_id']
                                                    ].data[item_id][
                                                        'texture_id'
                                                    ] = resource_id;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < form.file.length; i++) {
                            console.error('上传资源未知情况！！！！！');
                            console.error(form.file[i]);
                        }
                    }
                }
                else {
                    if (form.type === 'folder') {
                        var assetID = UUid.createAssetID();
                        var createdAt = UUid.createdAtTime();
                        assetData = {
                            id: assetID,
                            type: form.type,
                            createdAt: createdAt,
                            modifiedAt: createdAt,
                            name: form.name,
                            preload: form.preload,
                            has_thumbnail: false,
                            scope: {
                                type: 'project',
                                id: form.projectID,
                            },
                            file: null,
                            data: null,
                            path:
                                form.path === '' ? [] : form.path.split(','),
                        };
                        if (!assetFile.assets) {
                            assetFile['assets'] = {};
                        }
                        if (assetFile.assets[assetID] === undefined) {
                            assetFile.assets[assetID] = assetData;
                        }
                        backData.push(assetData);
                    }
                    else if (form.type === 'table') {
                        var assetID = UUid.createAssetID();
                        var createdAt = UUid.createdAtTime();
                        await ossfile.uploadJsonAsset(Config.tableStandard, form.projectID, assetID, 'table');

                        var createdAt = UUid.createdAtTime();
                        assetData = {
                            id: assetID,
                            type: form.type,
                            createdAt: createdAt,
                            modifiedAt: createdAt,
                            name: form.name,
                            preload: form.preload !== undefined ? form.preload : false,
                            has_thumbnail: false,
                            scope: {
                                type: 'project',
                                id: form.projectID,
                            },
                            file: {
                                filename: form.name,
                                size: 0,
                                hash: UUid.createUuid(),
                            },
                            data: null,
                            path:
                                form.path === '' ? [] : form.path.split(','),
                        };
                        if (!assetFile.assets) {
                            assetFile['assets'] = {};
                        }
                        if (assetFile.assets[assetID] === undefined) {
                            assetFile.assets[assetID] = assetData;
                        }
                        backData.push(assetData);
                    }
                }
                // 更新asset data关联数据
                BabylonLoader.assetsData.babylon = assetFile.babylon;
                BabylonLoader.assetsData.babylon_resource = assetFile.babylon_resource;

                for (let i = 0, len = backData.length; i < len; i++) {
                    // asset data也要更新
                    BabylonLoader.assetsData.assets[backData[i].id] = backData[i];
                    var asset = new Observer(backData[i]);
                    editor.call('assets:add', asset);
                }

                // TODO：简易更新material preview数据
                editor.call('material:preview:assemble', BabylonLoader.assetsData);
                editor.call('material:preview:start');
            }
            else {
                var assetData: any = {};
                if (form.type === 'texture' && form.file) {
                    var hash = await UUid.getmd5(form.file);
                    await ossfile.uploadFile(form.file, Config.projectID, form.assetId, form.name, hash);
                    assetFile.assets[form.assetId].modifiedAt = UUid.createdAtTime();
                    assetFile.assets[form.assetId].file['size'] = form.file.size;
                    assetFile.assets[form.assetId].file['hash'] = hash;
                    assetData = assetFile.assets[form.assetId];
                } else if (form.type === 'model') {
                    // 待定，先不覆盖，直接上传新的数据
                }
                if (assetData) {
                    let asset: Observer = editor.call('assets:get', assetData.id);
                    if (asset && asset.get('type') === 'texture') {
                        asset.set('modifiedAt', assetData.modifiedAt);
                        asset.set('file.size', assetData.file.size);
                        asset.set('file.hash', assetData.file.hash);
                        asset.emit('thumbnails.m:set', assetData.name + '?' + assetData.file.hash);
                        // console.log('更新图片');
                    }
                }
            }
            fileIndex++;
            if (fileIndex === fileCount) {
                console.log('所有文件上传完成');
                ossfile.upLoadJsonConfig(JSON.stringify(assetFile), Config.projectID, 'assets');
                fileIndex = 0; fileCount = 0;
                assetFile = {};
            }

            // Ajax.post(url, form);

            // 上传数据，具体入口
            // Ajax(data)
            //     .on('load', function (status, data) {
            //         editor.call('status:job', 'asset-upload:' + job);
            //         if (fn) {
            //             fn(null, data);
            //         }
            //     })
            //     .on('progress', function (progress) {
            //         editor.call('status:job', 'asset-upload:' + job, progress);
            //     })
            //     .on('error', function (status, data) {
            //         if (/Disk allowance/.test(data)) {
            //             data += '. <a href='/upgrade' target='_blank'>UPGRADE</a> to get more disk space.';
            //         }

            //         editor.call('status:error', data);
            //         editor.call('status:job', 'asset-upload:' + job);
            //         if (fn) {
            //             fn(data);
            //         }
            //     });
        });

        editor.method('assets:upload:files', function (files: FileList) {
            if (fileCount != 0) {
                console.error('上一次上传指令还未执行完成');
                return;
            }

            if (!editor.call('assets:canUploadFiles', files)) {
                // var msg = 'Disk allowance exceeded. <a href='/upgrade' target='_blank'>UPGRADE</a> to get more disk space.';
                // editor.call('status:error', msg);
                return;
            }

            var currentFolder = editor.call('assets:panel:currentFolder');

            // 遍历每一个文件
            fileCount = files.length;
            fileIndex = 0;
            for (var i = 0; i < files.length; i++) {
                var path: string[] = [];

                if (currentFolder && currentFolder.get)
                    path = currentFolder.get('path').concat(currentFolder.get('id'));

                var source = false;
                var ext1: string[] = files[i].name.split('.');
                if (ext1.length === 1)
                    continue;

                var ext: string = ext1[ext1.length - 1].toLowerCase();

                var type = extToType[ext] || 'binary';

                var source = type !== 'binary' && !targetExtensions[ext];


                // 同一文件夹重名文件覆盖
                var sourceAsset = null;
                var candidates = editor.call('assets:find', function (item: Observer) {
                    // check files in current folder only
                    if (item.get('path').join(',') !== path.join(','))
                        return false;

                    if (files[i].name === item.get('name')) {
                        return true;
                    }

                    //     // try locate source when dropping on its targets
                    //     if (source && !item.get('source') && item.get('source_asset_id')) {
                    //         var itemSource = editor.call('assets:get', item.get('source_asset_id'));
                    //         if (itemSource && itemSource.get('type') === type && itemSource.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                    //             sourceAsset = itemSource;
                    //             return false;
                    //         }
                    //     }


                    //     if (item.get('source') === source && item.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                    //         // we want the same type or try to replace a texture atlas with the same name if one exists
                    //         if (item.get('type') === type || (type === 'texture' && item.get('type') === 'textureatlas')) {
                    //             return true;
                    //         }
                    //     }

                    return false;
                });


                // candidates contains [index, asset] entries. Each entry
                // represents an asset that could be overwritten by the uploaded asset.
                // Use the first candidate by default (or undefined if the array is empty).
                // If we are uploading a texture try to find a textureatlas candidate and
                // if one exists then overwrite the textureatlas instead.
                // var asset = candidates[0];
                // if (type === 'texture') {
                //     for (var j = 0; j < candidates.length; j++) {
                //         if (candidates[j][1].get('type') === 'textureatlas') {
                //             asset = candidates[j];
                //             type = 'textureatlas';
                //             break;
                //         }
                //     }
                // }

                var data = null;
                if (ext === 'js') {
                    data = {
                        order: 100,
                        scripts: {}
                    };
                }

                editor.call('assets:uploadFile', {
                    asset: (candidates && candidates.length > 0) ? candidates[0][1] : null,
                    // asset: null,
                    file: files[i],
                    type: type,
                    path: path.join(','),
                    name: files[i].name,
                    parent: editor.call('assets:panel:currentFolder'),
                    pipeline: true,
                    data: data,
                    // meta: asset ? asset[1].get('meta') : null,
                    meta: null
                }, function (err: Error, data: any) {
                    var onceAssetLoad = function (asset: Observer) {
                        var url = asset.get('file.url');
                        if (url) {
                            editor.call('scripts:parse', asset);
                        } else {
                            asset.once('file.url:set', function () {
                                editor.call('scripts:parse', asset);
                            });
                        }
                    };

                    var asset = editor.call('assets:get', data.id);
                    if (asset) {
                        onceAssetLoad(asset);
                    } else {
                        editor.once('assets:add[' + data.id + ']', onceAssetLoad);
                    }
                });
            }
        });



        // 上传文件或文件夹，文件上传入口
        editor.method('assets:upload:picker', function (args: any) {
            args = args || {};

            var parent = args.parent || editor.call('assets:panel:currentFolder');

            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            // 服务器需要识别此name
            fileInput.name = 'file';
            // fileInput.accept = '';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.style.verticalAlign = 'middle';
            fileInput.style.textAlign = 'center';
            VeryEngine.assets.append(fileInput);

            var onChange = function () {
                ossfile.getJsonConfig(Config.projectID, 'assets').then(assetJsonStr => {
                    assetFile = JSON.parse(assetJsonStr);
                    editor.call('assets:upload:files', fileInput.files);
                    // 上传文件以后，开始做一些处理
                    // 解析.babylon文件，初步处理以后上传给服务器

                    var fl = fileInput.files!.length;
                    var i = 0;

                    while (i < fl) {
                        // localize file var in the loop
                        var file = fileInput.files![i];
                        // console.log('name: ' + file.name);
                        // console.warn('type: ' + file.type);
                        // console.warn('size: ' + file.size);
                        // console.warn('lastModified: ' + file.lastModified);
                        i++;
                    }

                    fileInput.value = '';
                    fileInput.removeEventListener('change', onChange);
                    fileInput.parentNode!.removeChild(fileInput);
                })
            };

            fileInput.addEventListener('change', onChange, false);
            fileInput.click();

        });
    }
}