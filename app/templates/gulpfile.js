'use strict';
//依赖包
var gulp = require('gulp'),
    changed = require('gulp-changed'),
    deleteLines = require('gulp-delete-lines'),
    zip = require('gulp-zip'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    prompt = require('gulp-prompt'),
    clean = require('gulp-clean'),
    jeditor = require("gulp-json-editor"),
    connect = require('gulp-connect');
//公用变量    
var _manifest = "./app/manifest.json",
    _pkg = require(_manifest),
    _dist = process.env.USERPROFILE.replace(/\\/g, "\/") + "/AppData/Roaming/SogouExplorer/Extension/" + _pkg.id + "/" + _pkg.version,
    _sextName = _pkg.id + "_v",
    _zipDevFiles = "app/**/*.*",
    _allFiles = [_zipDevFiles, '!app/manifest.json'],
    _copyFiles = ['app/**/*.*', '!app/styles/**/*.css','!app/scripts/**/*.js'],
    _css = "app/styles/**/*.css",
    _js = ['app/scripts/**/*.js', '!app/scripts/chromereload.js'],
    _sextDir = "sext",

    _sextFiles = "temp/**/*.*",
    _tempDir = "temp",
    _tempManifest = "temp/manifest.json",
    _tempCssDir = "temp/styles",
    _tempJsDir = "temp/scripts",
    _tempJson = {
        'version': '1.0.0.0'
    };
//构建初始化
gulp.task('build', ['sext_dev'], function() {
    connect.server({
        root: 'app',
        livereload: true
    });
    gulp.watch(_allFiles, ['changed', 'reload']); //监视文件
});
//文件变化处理
gulp.task('changed', function() {
    gulp.src(_allFiles).pipe(changed(_dist)).pipe(gulp.dest(_dist));
});
//执行 livereload
gulp.task('reload', function() {
    gulp.src(_allFiles).pipe(connect.reload());
});
// 开发模式打包
gulp.task('sext_dev', function() {
    return gulp.src(_zipDevFiles).pipe(zip(_sextName + _pkg.version + '_dev.sext')).pipe(gulp.dest(_sextDir));
});



//publish
gulp.task('sext', ['manifest'], function() {
    var filters = {
        'filters': ['<script src="scripts/chromereload.js"></script>']
    };
    return gulp.src(_sextFiles).pipe(deleteLines(filters)).pipe(zip(_sextName + _tempJson.version + '.sext')).pipe(gulp.dest(_sextDir));
});
//reset version
gulp.task('manifest',['minifycss'],function() {
    var prompt_option = {
        type: 'input',
        name: 'version',
        message: 'please create a new version'
    }, callBack = function(res) {
            _tempJson.version = res.version || _pkg.version;
    };
    return gulp.src(_tempManifest).pipe(prompt.prompt(prompt_option, callBack)).pipe(jeditor(_tempJson)).pipe(gulp.dest(_tempDir));
});
//minifycss
gulp.task('minifycss',['minifyjs'], function() {
    return gulp.src(_css).pipe(minifycss()).pipe(gulp.dest(_tempCssDir));
});
//minifyjs
gulp.task('minifyjs',['copy'], function() {
    var opt = {
                options: {
                    mangle: false, //不混淆变量名
                    preserveComments: 'all' //去掉注释
                }
            };
    return gulp.src(_js).pipe(uglify(opt)).pipe(gulp.dest(_tempJsDir));
});
//copy
gulp.task('copy',['clean'],function() {
    return gulp.src(_copyFiles).pipe(gulp.dest(_tempDir));
});
// clean
gulp.task('clean', function() {
  return gulp.src(_tempDir, {read: false}).pipe(clean({force: true}));
});
