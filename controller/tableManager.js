const fs = require('fs');

//封装readfile为Promise
const readFile = function(url) {
	return new Promise((resovle, reject) => {
		// 设置编码格式
		fs.readFile(url, 'utf8', (err, data) => {
			if (err) reject(err);
			resovle(data);
		});
	});
};

const writeFile = function(url, data) {
	return new Promise((resovle, reject) => {
		fs.writeFile(url, data, 'utf8', err => {
			if (err) reject(err);
			resovle('success');
		});
	});
};

// 初始化时提取本地数据
exports.acquire = async (ctx, next) => {
	// console.log('read ???????');
	// fs.writeFile('public/data/tableTest2.json', '{test: test}', function(err) {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('Saved.');
	// });

	if (!fs.existsSync('dist/data/tableTest.json')) {
		console.log('文件不存在');
		return ctx.send('file not exists');
	} else {
		var data;
		try {
			data = await readFile('dist/data/tableTest.json');
		} catch {
			return ctx.sendError('00005', 'No Such File');
		}
		if (data) {
			// console.log('data: ' + data);
			return ctx.send(JSON.parse(data));
		} else {
			console.log('Empty');
			return ctx.sendError('00005', 'Empty');
		}
	}
};

// 接收客户端提交的表格数据
exports.commit = async (ctx, next) => {
	let data = ctx.request.body;
	// console.log('数据：' + data);
	if (data) {
		// 数据格式
		try {
			await writeFile('dist/data/tableTest.json', JSON.stringify(data));
			return ctx.send('success');
		} catch (err) {
			console.log('write file error: ' + err);
			return ctx.sendError('00004', 'save error: ' + err);
		}
	} else {
		return ctx.sendError('00004', 'undifined data! check please!');
	}
};

// 存储数据为txt表格
