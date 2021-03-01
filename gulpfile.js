"use strict"
const { src, dest, parallel, watch, series } = require("gulp")
const ts = require("gulp-typescript")
const tsProject = ts.createProject("tsconfig.json")
const nodemon = require('gulp-nodemon')
const exec = require('child_process').exec
const del = require('del')

function backendServer(done) {
    nodemon({
        script: './dist/src/app.js'
        , ext: 'js'
        , ignore: ['session/*', "src/**/*", "dist/src/**/*"]
        , env: { 'NODE_ENV': 'development' }
        , done: done
    })
}

function clean(cb) {
    del(['./dist/']);
    cb();
  }

function tsc() {
    return tsProject.src().pipe(tsProject()).js.pipe(dest("dist"))
}

function nodejs(cb) {
    exec('node dist/src/app.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function tsWatch() {
    watch(["src/**/*", "serverConfig.js"], series(clean, tsc))
}
// function backendWatch () {
//     watch("./**/*.js",() => {node 'index.js'});
// }

exports.tsc = tsWatch
exports.default = parallel(tsWatch, backendServer)