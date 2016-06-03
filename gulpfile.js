"use strict";

var gulp = require("gulp");
var zip = require("gulp-zip");

gulp.task("default", function() {
  return gulp.src("src/**")
    .pipe(zip("YandexPlayer.zip"))
    .pipe(gulp.dest("dist"));
});