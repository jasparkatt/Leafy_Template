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
    cssPath: 'src/style/*.css'
}
//css task
function cssTask(){
    return src(files.cssPath)
    .pipe(plumber())
    .pipe(cleanCss())
    .pipe(rename('main.min.css'))
    .pipe(dest('dist/style/'));
}
exports.default = cssTask

