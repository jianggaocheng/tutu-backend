var gulp = require('gulp');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');

gulp.task('default', function() {
    gulp.start('lint');
    gulp.start('sass');
});

gulp.task('lint', function() {
    return gulp.src(['./**/*.js', '!./**/public/**/*.js', '!./node_modules/**'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('sass', function() {
    gulp.src('./common/public/sass/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest('./common/public/css'));
});