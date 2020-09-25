const gulp = require("gulp");  // 构建工具
const browserify = require("browserify"); // 把所有模块捆绑成一个JavaScript文件
const source = require("vinyl-source-stream"); // 将Browserify的输出文件适配成gulp能够解析的格式
// const watchify = require("watchify"); // Watchify启动Gulp并保持运行状态，当你保存文件时自动编译。 帮你进入到编辑-保存-刷新浏览器的循环中。
var uglify = require("gulp-uglify");  // 代码混淆和压缩
var sourcemaps = require("gulp-sourcemaps");  // 确保sourcemaps可以工作，这些调用让我们可以使用单独的sourcemap文件，而不是之前的内嵌的sourcemaps
var buffer = require("vinyl-buffer"); // 确保sourcemaps可以工作
const tsify = require("tsify"); // Browserify的一个插件

function build(){
   return new browserify({
        basedir: "src/tools",
        debug: true,
        entries: ["out.ts"],
        standalone:"ossfile"
   })
   //es6 转化
   // .transform(babelify, {
   //   presets: [
   //     'es2015'
   // ]})

  //ts 转化
  .plugin(tsify)
   .bundle()
   .pipe(source("ossfile.js"))
   .pipe(buffer())
   .pipe(sourcemaps.init({ loadMaps: true }))
   .pipe(uglify())
   .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("dist/editor")); 
}

gulp.task("default",build);