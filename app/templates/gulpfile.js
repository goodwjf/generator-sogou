    'use strict';
    var gulp = require('gulp'),
        changed = require('gulp-changed'),
        deleteLines = require('gulp-delete-lines'),
        zip = require('gulp-zip'),
        connect = require('gulp-connect');
    var pkg = require('./app/manifest.json'),
        _dist = process.env.USERPROFILE.replace(/\\/g, "\/") + "/AppData/Roaming/SogouExplorer/Extension/" + pkg.id + "/" + pkg.version,
        _sextName = pkg.id + "_v" + pkg.version;
    gulp.task('build', ['sext_dev'], function() {
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
    gulp.task('sext_dev', function() {
        return gulp.src('app/**/*.*').pipe(zip(_sextName + '_dev.sext')).pipe(gulp.dest('sext'));
    });
    gulp.task('sext', function() {
        var filters = {
            'filters': ['<script src="scripts/chromereload.js"></script>']
        };
        return gulp.src(['app/**/*.*', '!app/scripts/chromereload.js']).pipe(deleteLines(filters)).pipe(zip(_sextName + '.sext')).pipe(gulp.dest('sext'));
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