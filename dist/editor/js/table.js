document.addEventListener("keydown",function(event){
　　if(event.ctrlKey && event.keyCode==83){
    event.preventDefault();
    saveData(true);
　　　console.log('你按下了CTRL+S');
　　}
})
// 全局变量
var dataLoaded = false;
var projectName = "VeRyEngine";
var example = document.getElementById("VeryTable");
var hot1 = new Handsontable(example, {
    data: Handsontable.helper.createEmptySpreadsheetData(300, 9),
    colWidths: 120,
    width: "100%",
    height: "100%",
    rowHeights: 23,
    rowHeaders: true,
    colHeaders: true,
    licenseKey: "non-commercial-and-evaluation",
    autoColumnSize: true,
    fixedRowsTop: 1, // 固定显示第一行
    manualColumnResize: true, // 允许手动设置列宽
    manualRowResize: true, // 允许手动设置行宽
    manualRowMove: true, // 允许拖拽移动某一行
    contextMenu: {
        items: {
            row_above: {
                name: "插入行（当前行上方）",
            },
            row_below: {
                name: "插入行（当前行下方）",
            },
            separator: Handsontable.plugins.ContextMenu.SEPARATOR,
            remove_row: {
                name: "删除行",
                disabled: function () {
                    // `disabled` can be a boolean or a function
                    // Disable option when first row was clicked
                    return this.getSelectedLast()[0] === 0; // `this` === hot3
                },
            },
            clear_cell: {
                name: "清除内容",
                callback: function () {
                    console.log(this.getSelected());
                },
            },
            clear_all: {
                name: "清空表格",
                callback: function () {
                    this.clear();
                },
            },
            separator: Handsontable.plugins.ContextMenu.SEPARATOR,
            undo: {
                name: "撤销",
            },
            redo: {
                name: "重做",
            },
            separator: Handsontable.plugins.ContextMenu.SEPARATOR,
            make_read_only: {
                name: "设为只读",
            },
            separator: Handsontable.plugins.ContextMenu.SEPARATOR,
            alignment: {
                name: "对齐方式",
            },
            separator: Handsontable.plugins.ContextMenu.SEPARATOR,
            copy: {
                name: "复制",
            },
            cut: {
                name: "剪切",
            },
        },
    },
    stretchH: "all",
    afterChange: (changes) => {
        if (changes && changes[0][0] !== 0) {
            //第一行标题忽略掉
            // console.log(changes[0]);
            saveData(false);
        }
    },
});

hot1.setDataAtCell(0, 0, "对象/模板对象");
hot1.setDataAtCell(0, 1, "触发激活条件");
hot1.setDataAtCell(0, 2, "触发名");
hot1.setDataAtCell(0, 3, "触发参数");
hot1.setDataAtCell(0, 4, "逻辑条件");
hot1.setDataAtCell(0, 5, "变量定义/状态定义和赋值");
hot1.setDataAtCell(0, 6, "响应名/变量赋值");
hot1.setDataAtCell(0, 7, "响应参数");
hot1.setDataAtCell(0, 8, "关联状态");

// 第一行为ReadOnly、居中
hot1.updateSettings({
    cells: function (row, column, prop) {
        const cellProperties = {};
        if (row === 0) {
            cellProperties.readOnly = true;
            cellProperties.editor = false;
            cellProperties.className = "htCenter htMiddle";
            cellProperties.allowRemoveRow = false;
        }
        return cellProperties;
    },
});

axios.defaults.headers.post["Content-Type"] = "application/json";

// 加载数据
const loadData = () => {
    // 获取表格数据
    var path = window.location.href;
    var paramsArray = path.split("?")[1].split("&");
    var tableName="";
    var tableId="";
    for (var i = 0; i < paramsArray.length; i++) {
        var arrayData = paramsArray[i].split("=");
        if(arrayData[0]=="name")
            tableName=arrayData[1];
        else if(arrayData[0]=="id")
            tableId=arrayData[1];
    }
    var projectID = window.location.pathname.substring(7);
    ossfile.getJsonAsset(projectID,tableId,"table").then(function (response){
        if(response!=""){

            let data = JSON.parse(response);
            console.log(response);
            // 先将json转化为字符串
            let tempData = JSON.stringify(data);
            // 对字符串再进行反转义
            tempData = escape2Html(tempData);
            console.log(JSON.parse(tempData));
            // 转化为json后，赋值给表格
            hot1.loadData(JSON.parse(tempData).table);
            dataLoaded = true;
        }
    }).
    catch(function(error){
        console.log("load error: " + error);
    });
};

// 加载数据
const loadData2 = () => {
    return new Promise(function (resolve, reject) {
        // 获取表格数据
        axios
            .get("/api/table/acquire")
            .then(function (response) {
                let data = response.data;
                // console.log(data);
                if (data.code === "0000") {
                    // 先将json转化为字符串
                    let tempData = JSON.stringify(data.data);
                    // 对字符串再进行反转义
                    tempData = escape2Html(tempData);
                    // 转化为json后，赋值给表格
                    hot1.loadData(JSON.parse(tempData).table);
                    resolve(hot1);
                } else {
                    // Do nothing
                    console.log("load not right: " + data.message);
                    reject(data.message);
                }
            })
            .catch(function (error) {
                console.log("load error: " + error);
                reject(error);
            });
    });
};

var saveFlag;
// 保存数据，延迟1.5秒
const saveData = (tag) => {
    if (saveFlag) {
        clearTimeout(saveFlag);
    }
    saveFlag = setTimeout(saveImmediate, 1500,tag);
};

const saveImmediate = (tag) => {
    // console.log("saved now");
    // 格式化数据
    // 转化成json格式
    let data = { table: hot1.getData() };
    // 转成json字符串
    let table = JSON.stringify(data);
    // // 插入行默认为null，将null替换为空字符（在BlueTable中处理）
    // table = table.replace(/null/g, '""');
    // // 当前表格内容也同时更新
    // console.log(table);
    // hot1.loadData(JSON.parse(table).table);
    // 将字符串中的转义字符及html相关格式文本进行转化
    table = html2Escape(table);

    var path = window.location.href;
    var paramsArray = path.split("?")[1].split("&");
    var tableName="";
    var tableId="";
    for (var i = 0; i < paramsArray.length; i++) {
        var arrayData = paramsArray[i].split("=");
        if(arrayData[0]=="name")
            tableName=arrayData[1];
        else if(arrayData[0]=="id")
            tableId=arrayData[1];
    }
    var projectID = window.location.pathname.substring(7);
    ossfile.uploadJsonAsset(table,projectID,tableId,".table",tag).then(function (response){
        if(response){
            console.log("已保存");
        }
    }).
    catch(function(error){
        console.log("保存错误：" + error);
    });
};

// 初始化
(function () {
    loadData();
    // console.log(document.getElementById("VeryTable").clientWidth);
    // console.log(document.getElementById("renderCanvas").style.width);
})();

const loadTxt = function (name, table) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/" + name + ".txt", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // if (!checkTypescriptSupport(xhr)) {
                // 	return;
                // }

                xhr.onreadystatechange = null;
                parserData(xhr.responseText, table);

                // blockEditorChange = true;
                // jsEditor.setValue(xhr.responseText);
                // jsEditor.setPosition({ lineNumber: 0, column: 0 });
                // blockEditorChange = false;
                // compileAndRun();

                // setToMultipleID("currentScript", "innerHTML", title);

                // currentSnippetToken = null;
            }
        }
    };
    xhr.send(null);
};

const parserData = function (data, table) {
    if (data) {
        // 解析数据，允许\n存在，所以要寻找一个通用的方式

        table.setDataAtCell(3, 3, data);
    }
};

//HTML标签转义（< -> &lt;）
function html2Escape(sHtml) {
    var temp = document.createElement("div");
    temp.textContent != null
        ? (temp.textContent = sHtml)
        : (temp.innerText = sHtml);
    var output = temp.innerHTML;
    temp = null;
    return output;
}

//HTML标签反转义（&lt; -> <）
function escape2Html(str) {
    var temp = document.createElement("div");
    temp.innerHTML = str;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}

// 表格重新渲染
hot1.render();
