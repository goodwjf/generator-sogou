'use strict';
//依赖包
var gulp = require('gulp'),
    changed = require('gulp-changed'),
    deleteLines = require('gulp-delete-lines'),
    zip = require('gulp-zip'),
    prompt = require('gulp-prompt'),
    jeditor = require("gulp-json-editor"),
    connect = require('gulp-connect');
//公用变量    
var _manifest = "./app/manifest.json",
    _pkg = require(_manifest),
    _dist = process.env.USERPROFILE.replace(/\\/g, "\/") + "/AppData/Roaming/SogouExplorer/Extension/" + _pkg.id + "/" + _pkg.version,
    _sextName = _pkg.id + "_v",
    _zipDevFiles = "app/**/*.*",
    _allFiles = [_zipDevFiles, '!app/manifest.json'],
    _sextFiles = ['app/**/*.*', '!app/scripts/chromereload.js'],
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
    return gulp.src(_zipDevFiles).pipe(zip(_sextName + _pkg.version + '_dev.sext')).pipe(gulp.dest('sext'));
});
//发布打包
gulp.task('sext', ['manifest'], function() {
    var filters = {
        'filters': ['<script src="scripts/chromereload.js"></script>']
    };
    return gulp.src(_sextFiles).pipe(deleteLines(filters)).pipe(zip(_sextName + _tempJson.version + '.sext')).pipe(gulp.dest('sext'));
});
//重置版本号
gulp.task('manifest', function() {
    var prompt_option = {
        type: 'input',
        name: 'version',
        message: 'please create a new version'
    }, callBack = function(res) {
            _tempJson.version = res.version || _pkg.version;
        };
    return gulp.src(_manifest).pipe(prompt.prompt(prompt_option, callBack)).pipe(jeditor(_tempJson)).pipe(gulp.dest("./app"));
});