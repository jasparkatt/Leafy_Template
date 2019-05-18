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
const copyNodeModules = require("copy-node-modules");
const shell = require("gulp-shell");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");

//construct some file paths
const files = {
    coreCssPath: 'src/core_scripts/*.css',//may need to explicity set order if this doesnt work?
    coreJsPath: 'src/core_scripts/*.js',//ditto ^^
    jsPath: 'src/scripts/*.js',
    cssPath: 'src/style/*.css',
    htmlPath: 'src/index.html',
    nodePath: './',
    stylesBuild: './dist/styles/', // this is where the minified, compiled css will go
    jsBuild: './dist/scripts/',//this is where the minified js will go
    nodeBuild: '.dist/',
    coreBuild: './dist/core_scripts/',//this is where the plugin js and css will go after being min and conct
    sourcemapsBuild: '../',
    deletedPaths: './dist',//delete the dist dir before a new build
}
//clean out build folder i.e dist
function clean(){
    return del([files.deletedPaths]);
    console.log('Files and folders that would be deleted:\n', files.deletedPaths.join('\n'));
}

//need a minify image task for pngs
//need a minify the css and html after concat too

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
//html tasks
function htmlTask(){
    return src(files.htmlPath)
    .pipe(plumber())
    .pipe(htmlmin({removeComments: true}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename('index.min.html'))
    .pipe(dest(files.deletedPaths))
}
//copy and minify and concat the js and css
//found in src core_scripts. these are standard
//leaflet plugins
//core scripts task
function coreCssTask(){
    return src(files.coreCssPath)
    .pipe(sourcemaps.init())
        .pipe(concat('core.css'))
    .pipe(sourcemaps.write(files.sourcemapsBuild))
    .pipe(dest(files.coreBuild))
}
function coreJsTask(){
    return src(files.coreJsPath)
    .pipe(sourcemaps.init())
        .pipe(concat('core.js'))
    .pipe(sourcemaps.write(files.sourcemapsBuild))
    .pipe(dest(files.coreBuild))
}

//copy needed packages from node folder i.e leaflet
//need to tweek code to just keep the js/css you need
//can probably do something similar to this for plugins folder copyover
function nodeTask(){
    return src(files.nodePath)
    .pipe(shell('node copyNode'))
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
exports.nodeTask = nodeTask;
exports.coreCssTask = coreCssTask;
exports.coreJsTask = coreJsTask;
//set some series or parallels
exports.default = series(
    clean,
    nodeTask,
    parallel(cssTask, jsTask, htmlTask, coreCssTask, coreJsTask),
    watchTask
);
