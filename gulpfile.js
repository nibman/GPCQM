var env,
config = require('./config')(),
tasks= require('gulp-task-listing'),
gulp = require('gulp'),
rs = require('run-sequence'),
$ = require('gulp-load-plugins')({
  pattern: '*'
});
// ---------------------------------------------

gulp.task('set-fromage-dev', function(){
    env = "build";
});
gulp.task('set-fromage-prod', function(){
    env = "public";
});


// Watch ---------------------------------------
gulp.task('sass', ['watch']);

gulp.task('watch', function() {

   $.browserSync.init({
      proxy: config.basePaths.serverPath + ':' + config.basePaths.port, // makes a proxy for localhost:5000,
      notify: true,
      open: false,
  });

  gulp.watch(config.paths.sass.src, ['sass-compile']);
  gulp.watch(config.paths.html.nunjucks, ['generate-html']);
  gulp.watch(config.paths.js.src, ['scripts-compile']);
});


// Sass ----------------------------------------
gulp.task('sass-compile', function() {
  gulp.src(config.paths.sass.src)
    .pipe($.cssGlobbing())
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      style: 'expanded',
      includePaths: 'build/assets/sass/categories/'
    }))
    .pipe($.autoprefixer({
      browsers: config.paths.sass.prefix
    }))
    .pipe($.rename('styles.css'))
    .pipe(gulp.dest(config.paths.css.dest))
    .pipe($.cleanCss())
    .pipe($.stripCssComments())
    .pipe($.rename({suffix: '.min'}))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.paths.css.output))
    .pipe($.browserSync.stream( { match: '**/*.min.css' } ));
});

// Javascripts -------------------------------
gulp.task('scripts-compile', function() {
  gulp.src([config.paths.js.src])
    .pipe($.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe($.sourcemaps.init())
    .pipe($.concat('scripts.js'))
    // .pipe(gulp.dest(config.assets.jsOutput))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.uglify())
    .pipe(gulp.dest(config.paths.js.dest))
    .pipe($.browserSync.stream( { match: '**/*.js' } ));
});

gulp.task('js', ['scripts-compile']);


// HTML  -------------------------------
gulp.task('html-compress', function() {
  gulp.src([config.paths.html.src])
    .pipe($.htmlclean())
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.paths.html.output))
    .pipe($.browserSync.stream( { match: '**/*.html' } ));
});

gulp.task('templates', ['html-compress']);

// Fonts -------------------------------
gulp.task('copy-fonts', function() {
   gulp.src(config.paths.fonts.src)
   .pipe(gulp.dest(config.paths.fonts.dest));
});

// nunjucks templating  -------------------------------
gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src(config.paths.html.pages)
  // Renders template with nunjucks
  .pipe($.nunjucksRender({
      path: [config.paths.html.templates]
    }))
  // output files in html folder
  .pipe(gulp.dest(config.paths.html.dest))
});

gulp.task('generate-html', function(){
    rs('nunjucks', 'html-compress');
});

// gulp.task('generate-css', function() {
//   gulp.src(config.assets.cssJsSource)
//   .pipe($.absurd())
//   .pipe($.rename({extname: '.scss'}))
//   .pipe(gulp.dest(config.assets.cssJsOutput));
// });


// Default -------------------------------
gulp.task('default', function() {
  $.util.log('Default is running...');
  return tasks.withFilters(null, 'default')();
});
