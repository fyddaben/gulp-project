var gulp = require('gulp');

var coffee = require('gulp-coffee');

var uglify = require('gulp-uglify');

var sass= require('gulp-sass');

var jade = require('gulp-jade');

var changed = require('gulp-changed');

var minicss = require('gulp-minify-css');

var rimraf = require('rimraf');

var paths = {
  coffee: ['./client/coffee/**/*.coffee'],
  sass: ['./client/sass/1*/*.scss'],
  jade:['./client/templates/1*/*.jade']
};
gulp.task('sass', function() {
  var l= sass({
     onError: function(err) {
            return console.log(err);
        }
  });
  return gulp.src(paths.sass)
    .pipe(changed('./build/css'))
    .pipe(l)
    .pipe(minicss())
    .pipe(gulp.dest('./build/css'));
});

gulp.task('coffee', function() {
  var l= coffee();
  l.on('error',function(e){
      console.log(e)
      l.end()
  });
  return gulp.src(paths.coffee)
    .pipe(changed('./build/js'))
    .pipe(l)
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('jade', function() {
	var l= jade({pretty:true});
	l.on('error',function(e){
	    console.log(e)
	    l.end()
	});
  return gulp.src(paths.jade)
  .pipe(changed('./build/templates'))
  .pipe(l)
  .pipe(gulp.dest('./build/templates'));
});
// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.coffee, ['coffee']);
  gulp.watch(paths.jade, ['jade']);
});


gulp.task('default', ['watch','jade','coffee','sass']);