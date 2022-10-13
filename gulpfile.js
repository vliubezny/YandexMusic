const gulp = require("gulp");
const zip = require("gulp-zip");

gulp.task("default", () => {
  return gulp
    .src("src/**")
    .pipe(zip("YandexPlayer.zip"))
    .pipe(gulp.dest("dist"));
});
