const gulp = require("gulp");  // 构建工具
const browserify = require("browserify"); // 把所有模块捆绑成一个JavaScript文件
const source = require("vinyl-source-stream"); // 将Browserify的输出文件适配成gulp能够解析的格式
const tsify = require("tsify"); // Browserify的一个插件
// const watchify = require("watchify"); // Watchify启动Gulp并保持运行状态，当你保存文件时自动编译。 帮你进入到编辑-保存-刷新浏览器的循环中。
var uglify = require("gulp-uglify");  // 代码混淆和压缩
var sourcemaps = require("gulp-sourcemaps");  // 确保sourcemaps可以工作，这些调用让我们可以使用单独的sourcemap文件，而不是之前的内嵌的sourcemaps
var buffer = require("vinyl-buffer"); // 确保sourcemaps可以工作

const paths = {
  pages: ["src/*.html"]
};

// const watchedBrowserify = watchify(
//   browserify({
//     basedir: ".",
//     debug: true,
//     entries: ["src/main.ts"],
//     cache: {},
//     packageCache: {}
//   }).plugin(tsify)
// );

gulp.task("copy-html", function() {
  return gulp.src(paths.pages).pipe(gulp.dest("dist/editor"));
});

// function bundle() {
//   return watchedBrowserify
//     .bundle()
//     .pipe(source("bundle.js"))
//     .pipe(buffer())
//     .pipe(sourcemaps.init({ loadMaps: true }))
//     .pipe(uglify())
//     .pipe(sourcemaps.write("./"))
//     .pipe(gulp.dest("dist"));
// }

gulp.task("default", gulp.parallel("copy-html", () => {
    return browserify({
        basedir: ".",
        debug: true,
        entries: ["src/main.ts"],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source("vreditor.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("dist/editor"));
}));
// watchedBrowserify.on("update", bundle);
// watchedBrowserify.on("log", gutil.log);
