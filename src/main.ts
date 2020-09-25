import { Editor, Layout, Viewport, HierarchyKeeper, AssetsPanel, InitializeBefore, InitializeAfter, Debug, Tools, AssetsKeeper, Search, Drop, InitializeData } from './editor';
// import { Element, Canvas } from './ui';
import { VeryEngine } from './engine';
// import { Database } from './editor/middleware/offline/database';

export * from './index';

// 添加到全局变量
window.editor = new Editor();

// 全局注册debug类
window.debug = new Debug();

// 初始化全局信息类
let initialize: InitializeBefore = new InitializeBefore();

// 后期可以修改为load、start等string表示的事件，通过event来实现
// 打开project或者scene，1对多的关系，记录一下默认的scene（上一次打开的scene），一开始就打开默认的scene；
// 当前project的编辑器设置，如摄像机等，各种设置数据；
// assets数据；
// scene的数据，可能会多个，当前scene，不同scene之间还有顺序关系；

// 整体布局
let layout = new Layout();
layout.init();

let drop = new Drop();
let search = new Search();

// 层级菜单
let hierarchy = new HierarchyKeeper();

// 资源菜单
let assetsKeeper = new AssetsKeeper();

// 编辑视窗
let viewport = new Viewport();
VeryEngine.viewport = viewport;

// 初始化全局信息类
let initializeAfter: InitializeAfter = new InitializeAfter();

// 初始数据
let initializeData: InitializeData = new InitializeData();

// TODO
// Tools.loadBabylon();
// 加载资源

// 关联资源

// 本地数据库测试
// VeryEngine.database = new Database();
// VeryEngine.database.connect('test', 'store', 1, ['xxx']);

// let im = new Image();
// im.src = "test.jpeg";
// im.onload = () => {
//   console.log('--------------');
//   console.log(im.name);
//   console.log(im.sizes);
// }

/* TEST
editor.once('load', () => {
  console.log('once');
});

editor.on('array', () => {
  console.log('1');
});
editor.on('array', () => {
  console.log('2');
});
editor.on('array', () => {
  console.log('3');
});

editor.on('array', (args0: any, args1: any) => {
  console.log(args0 + ' +++ ' +  args1);
});

editor.method('method', (a: any) => {
  console.log(a);
});


editor.emit('load');
editor.emit('load');

editor.emit('array', 'abc', 'dfg');
editor.emit('array');

editor.call('method', 123);
*/

// let parent: HTMLElement = document.getElementById('test')!;

// console.log('children');

// console.log(parent);
// console.log(parent.childNodes);

// for(let i: number = 0; i < parent.children.length; i++) {
//   (<HTMLElement>(parent.children[i])).ui = new Element();
//   console.warn((<HTMLElement>(parent.children[i])).ui === undefined);
//   console.log((<HTMLElement>(parent.children[i])).ui);
//   (<HTMLElement>(parent.children[i])).ui.destroy();
//   console.log(parent.children[i] instanceof HTMLElement);
// }

// console.log('childNodes');

// for(let i: number = 0; i < parent.childNodes.length; i++) {
//   console.log(parent.childNodes[i] instanceof HTMLElement);
// }
