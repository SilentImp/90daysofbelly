var gulp              = require('gulp')
    , styl            = require('gulp-stylus')
    , concat          = require('gulp-concat')
    , coffee          = require('gulp-coffee')
    , jade            = require('gulp-jade')
    , sourcemaps      = require('gulp-sourcemaps')
    , imagemin        = require('gulp-imagemin')
    , pngquant        = require('imagemin-pngquant')
    , svgo            = require('imagemin-svgo')
    , uglify          = require('gulp-uglify')
    , csso            = require('gulp-csso')
    , postcss         = require('gulp-postcss')
    , autoprefixer    = require('autoprefixer-core')
    , deploy          = require('gulp-gh-pages')
    , prettify        = require('gulp-jsbeautifier')
    , plumber         = require('gulp-plumber')
    , path            = {
      'development'     : {
        'stylus'        : 'development/stylus/**/*.styl'
        , 'js'          : 'development/js/**/*.js'
        , 'coffee'      : 'development/coffee/**/*.coffee'
        , 'coffee_tmp'  : 'development/js/'
        , 'css'         : 'development/css/**/*.css'
        , 'css_tmp'     : 'development/css/'
        , 'images'      : 'development/images/**'
        , 'jade'        : 'development/jade/**/*.jade'
        , 'svg'         : 'development/svg/**/*.svg'
      }
      , 'production'    : {
        'root'          : 'production/'
        , 'css'         : 'production/css/'
        , 'js'          : 'production/js/'
        , 'images'      : 'production/images/'
        , 'svg'         : 'production/svg/'
      }
    }


gulp.task('images', function () {
  return gulp.src(path.development.images)
          .pipe(plumber())
          .pipe(imagemin({
              progressive: true,
              svgoPlugins: [{removeViewBox: false}],
              use: [pngquant()]
            }))
          .pipe(gulp.dest(path.production.images));
});

gulp.task('svg', function () {
  return gulp.src(path.development.svg)
          // .pipe(svgo())
          .pipe(gulp.dest(path.production.svg));
});

gulp.task('coffee', function () {
  return gulp.src(path.development.coffee)
          .pipe(plumber())
          .pipe(coffee({bare: true}))
          .pipe(gulp.dest(path.development.coffee_tmp));
});

gulp.task('js', ['coffee'], function () {
  return gulp.src(path.development.js)
          .pipe(plumber())
          .pipe(sourcemaps.init())
          .pipe(concat('script.js'))
          .pipe(prettify({indentSize: 4}))
          // .pipe(uglify())
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(path.production.js));
});

gulp.task('stylus', function () {
  var processors = [
          autoprefixer({browsers: ['last 2 versions']})
    ];
  return gulp.src([path.development.stylus, path.development.css])
          .pipe(plumber())
          .pipe(sourcemaps.init())
          .pipe(styl())
          .pipe(postcss(processors))
          .pipe(concat('styles.css'))
          .pipe(csso())
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(path.production.css));
});

gulp.task('jade', function () {
  return gulp.src(path.development.jade)
          .pipe(plumber())
          .pipe(jade())
          .pipe(prettify({indentSize: 4}))
          .pipe(gulp.dest(path.production.root));
});

gulp.task('deploy', function () {
  console.log('deploying');
  return gulp.src('production/**')
          .pipe(plumber())
          .pipe(deploy({
            cacheDir:   'gh-cache',
            remoteUrl:  'git@github.com:SilentImp/90daysofbelly.git'
          }).on('error', function(){
            console.log('error', arguments);
          }));
});

gulp.task('build', ['svg', 'images', 'stylus', 'js', 'jade'], function () {});

gulp.task('watch', function () {
  gulp.watch([path.development.stylus, path.development.css] ,  ['stylus']);
  gulp.watch(path.development.coffee,                           ['js']);
  gulp.watch(path.development.js,                               ['js']);
  gulp.watch(path.development.jade,                             ['jade']);
});

gulp.task('default', ['stylus', 'js', 'jade', 'images', 'svg']);
