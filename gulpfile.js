"use strict";
//load plugins

const { src, dest, watch, series, parallel } = require('gulp');
const newer = require("gulp-newer"); //pass only source files that
//are newer than corresponding destination files
const del = require("del"); //clean out folders
const rename = require("gulp-rename"); //rename files
const plumber = require("gulp-plumber"); //prevent pipe breaking
const cleanCss = require("gulp-clean-css"); //minify css
const htmlmin = require("gulp-htmlmin"); //minify html
const uglify = require("gulp-uglify"); //minify js
const copyNodeModules = require("copy-node-modules");
const shell = require("gulp-shell");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const imagemin = require('gulp-imagemin');
const copy = require("gulp-copy");
const cacheClean = require("gulp-cache");
const replace = require('gulp-replace');
const browserSync = require('browser-sync');

//construct some file paths
const files = {
        buildPath: ['src/scripts/main.js', 'src/style/main.css'],
        imgPath: 'src/img/*.png',
        coreCssPath: 'src/core_scripts/*.css', //may need to explicity set order if this doesnt work?
        coreJsPath: 'src/core_scripts/*.js', //ditto ^^
        jsPath: 'src/scripts/*.js',
        cssPath: 'src/style/*.css',
        htmlPath: 'src/index.html',
        nodePath: './',
        stylesBuild: './dist/styles/', // this is where the minified, compiled css will go
        jsBuild: './dist/scripts/', //this is where the minified js will go
        nodeBuild: '.dist/',
        coreBuild: './dist/core_scripts/', //this is where the plugin js and css will go after being min and conct
        sourcemapsBuild: '../',
        imgBuild: './dist/img/',
        deletedPaths: './dist', //delete the dist dir before a new build
        /* conJsmain: './dist/scripts/main.min.js',
        conJscore: './dist/core_scripts/core.js',
        conCssmain: './dist/styles/main.min.css',
        conCsscore: './dist/core_scripts/core.css' */
    }
    //create our dev server
function serve() {
    return browserSync.init({
        server: './',
        open: true,
        port: 3000
    });
}
//clean cache for live reload issues....
//need to change the src files so it doensnt change the index.html file in root on task run
var cbString = new Date().getTime();
//try switching the return src value to ./ so it doesn't overwrite the index.html found there
//will need to double check that it isn't replacing the src/index.html with that one from the root tho
function cacheBustTask() {
    return src(files.htmlPath)
        .pipe(replace(/cb=\d+/, 'cb=' + cbString))
        .pipe(dest('.'));
}
//clean out build folder i.e dist
function clean() {
    return del([files.deletedPaths]);
    console.log('Files and folders that would be deleted:\n', files.deletedPaths.join('\n'));
}
//need task to copy over faviconslook at buffer
function copyFav() {
    return src('./favicon.ico')
        .pipe(copy('dist', { prefix: 1 }))
        .pipe(dest('./'));
}
//need a minify image task for pngs
function imgTask() {
    return src(files.imgPath)
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(dest(files.imgBuild))
}
//need a minify the css and html after concat too

//css task
function cssTask() {
    return src(files.cssPath)
        .pipe(plumber())
        .pipe(cleanCss())
        .pipe(rename('main.min.css'))
        .pipe(dest(files.stylesBuild))
}
//js task
function jsTask() {
    return src(files.jsPath)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(dest(files.jsBuild))
}
//html tasks
function htmlTask() {
    return src(files.htmlPath)
        .pipe(plumber())
        .pipe(htmlmin({ removeComments: true }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(rename('index.min.html'))
        .pipe(dest(files.deletedPaths))
}
//copy and minify and concat the js and css
//found in src core_scripts. these are standard
//leaflet plugins
//core scripts task
function coreCssTask() {
    return src(files.coreCssPath)
        .pipe(sourcemaps.init())
        .pipe(cleanCss('*.css'))
        .pipe(concat('core.css'))
        .pipe(sourcemaps.write(files.sourcemapsBuild))
        .pipe(dest(files.coreBuild))
}

function coreJsTask() {
    return src(files.coreJsPath)
        .pipe(sourcemaps.init())
        .pipe(uglify('*.js'))
        .pipe(concat('core.js'))
        .pipe(sourcemaps.write(files.sourcemapsBuild))
        .pipe(dest(files.coreBuild))
}

function devBuild() {
    return src(files.buildPath)
        .pipe(copy('temp'))
        .pipe(dest('./'));
}

/* function concatjsTask(){
    return src(files.conJsmain, files.conJscore)
    .pipe(concat('main.js'))
    .pipe(dest(files.jsBuild))
}
function concatCssTask(){
    return src(files.conCssmain, files.conCsscore)
    .pipe(concat('main.css'))
    .pipe(dest(files.stylesBuild))
} */

//copy needed packages from node folder i.e leaflet
//need to tweek code to just keep the js/css you need
//can probably do something similar to this for plugins folder copyover
function nodeTask() {
    return src(files.nodePath)
        .pipe(shell('node copyNode'))
}
//create some watch tasks
function watchTask() {
    watch([files.cssPath, files.jsPath, files.htmlPath]),
        cacheBustTask,
        parallel(cssTask, jsTask, htmlTask),
        parallel(coreCssTask, coreJsTask),
        serve
}
//create exported tasks to make it easier to plug into other stuff e.g series parallel etc
exports.cacheBustTask = cacheBustTask;
exports.copyFav = copyFav;
exports.imgTask = imgTask;
exports.cssTask = cssTask;
exports.jsTask = jsTask;
exports.htmlTask = htmlTask;
exports.clean = clean;
exports.watchTask = watchTask;
exports.nodeTask = nodeTask;
exports.coreCssTask = coreCssTask;
exports.coreJsTask = coreJsTask;
exports.serve = serve;
exports.devBuild = devBuild;
/* exports.concatjsTask = concatjsTask;
exports.concatCssTask = concatCssTask; */
//set some series or parallels
exports.default = series(
    clean,
    nodeTask,
    parallel(imgTask, copyFav, cssTask, jsTask, htmlTask, coreCssTask, coreJsTask)
);
exports.cleanCor = series(
    cacheBustTask,
    clean,
    nodeTask,
    parallel(cssTask, jsTask, htmlTask),
    parallel(imgTask, copyFav),
    parallel(coreCssTask, coreJsTask)
    // parallel(concatjsTask, concatCssTask)
);
exports.rebuild = series(
    cacheBustTask,
    parallel(cssTask, jsTask, htmlTask),
    serve
);
exports.devtst = series(
    cacheBustTask,
    devBuild,
    serve);
//need to figure out task to use jsut the html from ./
//to run against the css and js in the src folder.
//and have that particular build be used by server
//create a temp folder and pipe the css and js from styles
//and scripts in src and the index.html from the root
//might need to fix the files paths in the files declareations