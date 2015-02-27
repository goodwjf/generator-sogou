    'use strict';
    var gulp = require('gulp'),
        changed = require('gulp-changed'),
        zip = require('gulp-zip'),
        connect = require('gulp-connect');
    var pkg = require('./app/manifest.json'),
        _dist = process.env.USERPROFILE.replace(/\\/g,"\/") + "/AppData/Roaming/SogouExplorer/Extension/" + pkg.id + "/" + pkg.version,
        _sextName = pkg.id + "_v" + pkg.version;
    gulp.task('build', ['sext'], function() {
        connect.server({
            root: 'app',
            livereload: true
        });
        gulp.watch(['app/**/*.*'], ['files', 'reload']);
    });
    gulp.task('files', function() {
        gulp.src('app/**/*.*').pipe(changed(_dist)).pipe(gulp.dest(_dist));
    });
    gulp.task('reload', function() {
        gulp.src('app/**/*.*').pipe(connect.reload());
    });
    gulp.task('sext', function() {
        return gulp.src('app/**/*.*').pipe(zip(_sextName + '.sext')).pipe(gulp.dest('sext'));
    });
    /*   
    gulp.task('default', ['clean'], function () {  
        gulp.start('start');  
    }); 

    gulp.task('start', function() {  
        console.log('This is default task, Developing...');  
    });  
      
    gulp.task('clean', function() {  
      console.log('cleaning...');  
    });  */