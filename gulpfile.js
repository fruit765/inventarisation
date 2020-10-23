"use strict"
const {src, dest, parallel, watch} = require ("gulp")
const nodemon = require('gulp-nodemon')

function backendServer(done) {
    nodemon({
        script: './src/app.js'
      , ext: 'js html'
      , ignore: ['./session/*']
      , env: { 'NODE_ENV': 'development' }
      , done: done
      })
}


// function backendWatch () {
//     watch("./**/*.js",() => {node 'index.js'});
// }

exports.default = parallel(backendServer);