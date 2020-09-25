export class ContextMenu {

  public constructor() {
    // 阻止默认鼠标右键菜单
    window.addEventListener('contextmenu', function (evt) {
      evt.preventDefault();
    }, false);
  }

}