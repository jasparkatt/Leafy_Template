"use strict";
//load plugins

const {src, dest, watch, series, parallel} = require('gulp');
const newer = require("gulp-newer");//pass only source files that
//are newer than corresponding destination files
const del = require("del");//clean out folders
const rename = require("gulp-rename");//rename files
const plumber = require("gulp-plumber"); //prevent pipe breaking
const cleanCss = require("gulp-clean-css");//minify css
const htmlmin = require("gulp-htmlmin");//minify html
const uglify = require("gulp-uglify");//minify js

//construct some file paths
const files = {
    jsPath: 'src/scripts/*.js',
    cssPath: 'src/style/*.css',
    htmlPath: './index.html',
    stylesBuild: './dist/styles/', // this is where the minified, compiled css will go
    jsBuild: './dist/scripts/',//this is where the minified js will go
    deletedPaths: './dist',//delete the dist dir before a new build
}
//clean out build folder i.e dist
function clean(){
    return del([files.deletedPaths]);
    console.log('Files and folders that would be deleted:\n', files.deletedPaths.join('\n'));
}

//css task
function cssTask(){
    return src(files.cssPath)
    .pipe(plumber())
    .pipe(cleanCss())
    .pipe(rename('main.min.css'))
    .pipe(dest(files.stylesBuild));
}
//js task
function jsTask(){
    return src(files.jsPath)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(dest(files.jsBuild))
}
function htmlTask(){
    return src(files.htmlPath)
    .pipe(plumber())
    .pipe(htmlmin({removeComments: true}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename('index.min.html'))
    .pipe(dest(files.deletedPaths))
}
//create some watch tasks
function watchTask(){
    watch([files.cssPath, files.jsPath, files.htmlPath]),
        parallel(cssTask,jsTask,htmlTask)
}
//create exported tasks to make it easier to plug into other stuff e.g series parallel etc
exports.cssTask = cssTask;
exports.jsTask = jsTask;
exports.htmlTask = htmlTask;
exports.clean = clean;
exports.watchTask = watchTask;
//set some series or parallels
exports.default = series(
    clean,
    parallel(cssTask, jsTask, htmlTask),
    watchTask
);
