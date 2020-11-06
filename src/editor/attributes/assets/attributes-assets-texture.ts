import { Observer } from "../../../lib";
import { Button } from "../../../ui";
import { BabylonLoader } from "../../middleware/loader/babylonLoader";
import { Config } from "../../global/config";

export class AttributeAssetsTexture {

    public constructor() {

        var panelsStates: any = {};

        editor.on('attributes:inspect[asset]', function (assets: Observer[]) {

            // console.error('attributes:inspect[asset]');
            // console.error(assets);

            for (var i = 0; i < assets.length; i++) {
                if (assets[i].get('type') !== 'texture' && assets[i].get('type') !== 'textureatlas' || assets[i].get('source'))
                    return;
            }

            var events: any = [];

            var ids: string[] = [];
            for (var i = 0; i < assets.length; i++)
                ids.push(assets[i].get('id'));

            let id = ids.sort(function (a: string, b: string) {
                return a.localeCompare(b);
            }).join(',');

            var panelState = panelsStates[id];
            var panelStateNew = false;
            if (!panelState) {
                panelStateNew = true;
                panelState = panelsStates[id] = {};

                panelState['texture'] = false;
                panelState['compression'] = false;
            }

            // 多个材质，改变属性面板标题
            if (assets.length > 1) {
                var numTextures = 0;
                var numTextureAtlases = 0;
                for (var i = 0; i < assets.length; i++) {
                    if (assets[i].get('type') === 'texture') {
                        numTextures++;
                    } else {
                        numTextureAtlases++;
                    }
                }
                var msg = '';
                var comma = '';
                // if (numTextures) {
                //     msg += numTextures + ' Texture' + (numTextures > 1 ? 's' : '');
                //     comma = ', ';
                // }
                if (numTextures) {
                    msg += numTextures + '张贴图';
                    comma = ', ';
                }
                if (numTextureAtlases) {
                    msg += comma + numTextureAtlases + ' Texture Atlas' + (numTextureAtlases > 1 ? 'es' : '');
                }
                editor.call('attributes:header', msg);
            }

            // properties panel
            var panel = editor.call('attributes:addPanel', {
                name: '贴图',
                foldable: true,
                folded: panelState['texture']
            });
            panel.class.add('component');
            panel.on('fold', function () { panelState['texture'] = true; });
            panel.on('unfold', function () { panelState['texture'] = false; });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:asset', panel, panel.headerElement);

            // Calculate Meta按钮，暂时没用其实
            var btnGetMeta = new Button('Calculate Meta');
            btnGetMeta.class!.add('calculate-meta', 'large-with-icon');
            var btnGetMetaVisibility = function () {
                var visible = false;
                for (var i = 0; i < assets.length; i++) {
                    if (!visible && !assets[i].get('meta'))
                        visible = true;
                }
                btnGetMeta.hidden = !visible;
            };
            btnGetMeta.on('click', function () {
                if (!editor.call('permissions:write'))
                    return;

                for (var i = 0; i < assets.length; i++) {
                    if (assets[i].get('meta'))
                        continue;

                    editor.call('realtime:send', 'pipeline', {
                        name: 'meta',
                        id: assets[i].get('uniqueId')
                    });
                }
                btnGetMeta.enabled = false;
            });
            panel.append(btnGetMeta);

            btnGetMetaVisibility();
            for (var i = 0; i < assets.length; i++) {
                if (btnGetMeta.hidden && !assets[i].get('meta'))
                    btnGetMeta.hidden = false;

                events.push(assets[i].on('meta:set', function () {
                    btnGetMetaVisibility();
                }));
                events.push(assets[i].on('meta:unset', function () {
                    btnGetMeta.hidden = false;
                }));
            }

            // width
            var fieldWidth = editor.call('attributes:addField', {
                parent: panel,
                name: 'Width',
                link: assets,
                path: 'meta.width',
                placeholder: 'pixels'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:width', fieldWidth.parent.innerElement.firstChild.ui);

            // height
            var fieldHeight = editor.call('attributes:addField', {
                parent: panel,
                name: 'Height',
                link: assets,
                path: 'meta.height',
                placeholder: 'pixels'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:height', fieldHeight.parent.innerElement.firstChild.ui);

            // depth
            var fieldDepth = editor.call('attributes:addField', {
                parent: panel,
                name: 'Depth',
                link: assets,
                path: 'meta.depth',
                placeholder: 'bit'
            });
            var checkDepthField = function () {
                if (!fieldDepth.value)
                    fieldDepth.element.innerHTML = 'unknown';
            };
            checkDepthField();
            fieldDepth.on('change', checkDepthField);
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:depth', fieldDepth.parent.innerElement.firstChild.ui);

            // alpha
            var fieldAlpha = editor.call('attributes:addField', {
                parent: panel,
                name: 'Alpha',
                link: assets,
                path: 'meta.alpha'
            });
            var checkAlphaField = function () {
                if (!fieldAlpha.value)
                    fieldAlpha.element.innerHTML = 'false';
            };
            checkAlphaField();
            fieldAlpha.on('change', checkAlphaField);
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:alpha', fieldAlpha.parent.innerElement.firstChild.ui);

            // interlaced
            var fieldInterlaced = editor.call('attributes:addField', {
                parent: panel,
                name: 'Interlaced',
                link: assets,
                path: 'meta.interlaced'
            });
            var checkInterlacedField = function () {
                if (!fieldInterlaced.value)
                    fieldInterlaced.element.innerHTML = 'false';
            };
            checkInterlacedField();
            fieldInterlaced.on('change', checkInterlacedField);
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:interlaced', fieldInterlaced.parent.innerElement.firstChild.ui);


            // rgbm
            var fieldRgbm = editor.call('attributes:addField', {
                parent: panel,
                name: 'Rgbm',
                link: assets,
                path: 'data.rgbm',
                type: 'checkbox'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:rgbm', fieldRgbm.parent.innerElement.firstChild.ui);

            // mipmaps
            var fieldMips = editor.call('attributes:addField', {
                parent: panel,
                name: 'Mipmaps',
                link: assets,
                path: 'data.mipmaps',
                type: 'checkbox'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:mipmaps', fieldMips.parent.innerElement.firstChild.ui);

            // filtering
            var fieldFiltering = editor.call('attributes:addField', {
                parent: panel,
                name: 'Filtering',
                type: 'string',
                enum: {
                    '': '...',
                    'nearest': 'Point',
                    'linear': 'Linear'
                }
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:filtering', fieldFiltering.parent.innerElement.firstChild.ui);




            // preview
            if (assets.length === 1) {

                var root = editor.call('attributes.rootPanel');

                var reloadImage = function () {
                    // if (assets[0].get('file.url') && assets[0].get('file.hash')) {
                    //     image.src = assets[0].get('file.url').appendQuery('t=' + assets[0].get('file.hash'));
                    //     previewContainer.style.display = '';
                    // } else {
                    //     previewContainer.style.display = 'none';
                    // }

                    if (assets[0].get('file')) {
                        ossfile.getUrl(Config.projectID,assets[0].get('id'),assets[0].get('name'),assets[0].get('file.hash')).then(response=>{
                            image.src = response;
                            previewContainer.style.display = '';
                        })
                    } else {
                        previewContainer.style.display = 'none';
                    }
                };

                var previewContainer = document.createElement('div');
                previewContainer.classList.add('asset-preview-container');

                var preview = document.createElement('div');
                preview.classList.add('asset-preview');
                var image = new Image();
                image.onload = function () {
                    root.class.add('animate');
                    preview.style.backgroundImage = 'url("' + image.src + '")';
                };
                reloadImage();
                previewContainer.appendChild(preview);

                preview.addEventListener('click', function () {
                    if (root.element.classList.contains('large')) {
                        root.element.classList.remove('large');
                    } else {
                        root.element.classList.add('large');
                    }
                }, false);

                root.class.add('asset-preview');
                root.element.insertBefore(previewContainer, root.innerElement);

                var eventsPreview: any[] = [];
                eventsPreview.push(assets[0].on('file.hash:set', reloadImage));
                eventsPreview.push(assets[0].on('file.url:set', reloadImage));

                panel.on('destroy', function () {
                    for (var i = 0; i < eventsPreview.length; i++)
                        eventsPreview[i].unbind();
                    previewContainer.parentNode!.removeChild(previewContainer);
                    root.class.remove('asset-preview', 'animate');
                });
            }

            panel.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
            });


        });



    }

}