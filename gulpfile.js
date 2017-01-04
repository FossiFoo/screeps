"use strict";

var gulp = require("gulp");
var babel = require("gulp-babel");
var del = require("del");
var path = require("path");
var spawn = require('child_process').spawn;
var jest = require("jest-cli");

gulp.paths = {
    src: "src",
    test: "test",
    dist: "dist",
    tmp: ".tmp",
    e2e: "e2e"
};

// require("require-dir")("./gulp");

gulp.task("flow", function() {
    return spawn("flow", ["status"]);
});

function build(done) {
    return gulp.src((path.resolve(gulp.paths.src, "./*.js")))
        .pipe(babel())
        .pipe(gulp.dest(gulp.paths.tmp));
}

function sync() {
    return gulp.src(path.resolve(gulp.paths.tmp, "./*.js"))
        .pipe(gulp.dest(gulp.paths.dist));
}

function watchFunc(done) {
    return gulp.series("build", "sync");
}

gulp.task("screeps", function() {
    return gulp.src("*.js")
        .pipe(screeps(options));
});

gulp.task("build", build);
gulp.task("sync", sync);

gulp.task("clean", function(done) {
    return del([path.resolve(gulp.paths.tmp), path.resolve(gulp.paths.dist)], done);
});

gulp.task("watch", function() {
    return gulp.watch((gulp.paths.src), watchFunc());
});

gulp.task("run", gulp.series("build", "sync","watch"));

gulp.task("default", gulp.series("clean", "build", "sync"));
