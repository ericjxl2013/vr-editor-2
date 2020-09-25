import { Observer } from "../../lib";

export class TestAssets {
    public constructor() {
        // path中后一个文件夹为最近文件夹
        let p1 = new Observer({ id: 'p1', name: '1.png', file: { url: 'pic/1.png'}, path: ['1', '7'], type: 'texture', thumbnails: 'pic/1.png' });
        let p2 = new Observer({ id: 'p2', name: '2.png', file: { url: 'pic/2.png'}, path: ['1', '7'], type: 'texture', thumbnails: 'pic/2.png' });
        let p3 = new Observer({ id: 'p3', name: '3.png', file: { url: 'pic/3.png'}, path: ['1', '7'], type: 'texture', thumbnails: 'pic/3.png' });
        let p4 = new Observer({ id: 'p4', name: '4.jpg', file: { url: 'pic/4.jpg'}, path: ['1', '7'], type: 'texture', thumbnails: 'pic/4.jpg' });
        let p5 = new Observer({ id: 'p5', name: '5.png', file: { url: 'pic/5.png'}, path: ['1', '7'], type: 'texture', thumbnails: 'pic/5.png' });
        let p6 = new Observer({ id: 'p6', name: '6.png', file: { url: 'pic/6.png'}, path: ['1', '7'], type: 'texture', thumbnails: 'pic/6.png' });

        editor.call('assets:add', p1);
        editor.call('assets:add', p2);
        editor.call('assets:add', p3);
        editor.call('assets:add', p4);
        editor.call('assets:add', p5);
        editor.call('assets:add', p6);

        let a3 = new Observer({ id: '3', name: '文件夹3', path: ['1'], type: 'folder' });
        let a4 = new Observer({ id: '4', name: '文件夹4', path: ['1'], type: 'folder' });
        let a5 = new Observer({ id: '5', name: '5文件夹', path: ['1'], type: 'folder' });
        let a6 = new Observer({ id: '6', name: '北京', path: ['1'], type: 'folder' });
        let a7 = new Observer({ id: '7', name: '浙江', path: ['1'], type: 'folder' });
        let a8 = new Observer({ id: '8', name: '_杭州', path: ['1'], type: 'folder' });
        let a9 = new Observer({ id: '9', name: '^西湖', path: ['1'], type: 'folder' });
        let a10 = new Observer({ id: '10', name: 'aaa', path: ['1'], type: 'folder' });
        let a11 = new Observer({ id: '11', name: 'ccc', path: ['1'], type: 'folder' });
        let a12 = new Observer({ id: '12', name: 'b被子', path: ['1'], type: 'folder' });

        let a1 = new Observer({ id: '1', name: '文件夹1', path: [], type: 'folder' });
        let a2 = new Observer({ id: '2', name: '文件夹2', path: [], type: 'folder' });

        editor.call('assets:add', a3);
        editor.call('assets:add', a4);
        editor.call('assets:add', a5);
        editor.call('assets:add', a6);
        editor.call('assets:add', a7);
        editor.call('assets:add', a8);
        editor.call('assets:add', a9);
        editor.call('assets:add', a10);
        editor.call('assets:add', a11);
        editor.call('assets:add', a12);

        editor.call('assets:add', a1);
        editor.call('assets:add', a2);

        let t1 = new Observer({ id: 't1', name: '0.jpg', file: { url: 'scene/1.jpg'}, path: [], type: 'texture', thumbnails: 'scene/0.jpg' });
        let t2 = new Observer({ id: 't2', name: '1.jpg', file: { url: 'scene/1.jpg'}, path: [], type: 'texture', thumbnails: 'scene/1.jpg' });
        let t3 = new Observer({ id: 't3', name: '2.jpg', file: { url: 'scene/1.jpg'}, path: [], type: 'texture', thumbnails: 'scene/2.jpg' });
        let t4 = new Observer({ id: 't4', name: '3.jpg', file: { url: 'scene/1.jpg'}, path: [], type: 'texture', thumbnails: 'scene/3.jpg' });

        editor.call('assets:add', t1);
        editor.call('assets:add', t2);
        editor.call('assets:add', t3);
        editor.call('assets:add', t4);



        let img1 = new Observer({ id: 'img1', name: 'a.mat', path: [], type: 'material' });
        editor.call('assets:add', img1);
    }
}