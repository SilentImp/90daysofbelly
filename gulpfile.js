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
    , autoprefixer    = require('gulp-autoprefixer')
    , deploy          = require('gulp-gh-pages')
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
        , 'svg'        : 'development/svg/**/*.svg'
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
          .pipe(coffee({bare: true}))
          .pipe(gulp.dest(path.development.coffee_tmp));
});

gulp.task('js', ['coffee'], function () {
  return gulp.src(path.development.js)
          .pipe(sourcemaps.init())
          .pipe(concat('script.js'))
          .pipe(uglify())
          .pipe(sourcemaps.write({includeContent: false}))
          .pipe(gulp.dest(path.production.js));
});

gulp.task('stylus', function () {
  return gulp.src([path.development.stylus, path.development.css])
          .pipe(styl())
          .pipe(autoprefixer({
              browsers: ['last 2 versions'],
              cascade: false
          }))
          .pipe(concat('styles.css'))
          .pipe(csso())
          .pipe(gulp.dest(path.production.css));
});

gulp.task('jade', function () {
  return gulp.src(path.development.jade)
          .pipe(jade())
          .pipe(gulp.dest(path.production.root));
});

gulp.task('deploy', function () {
  console.log('deploying');
  return gulp.src('production/**')
          .pipe(deploy({
            cacheDir:   'gh-cache',
            remoteUrl:  'git@github.com:SilentImp/90daysofbelly.git'
          }).on('error', function(){
            console.log('error', arguments);
          }));
});

gulp.task('watch', function () {
  gulp.watch([path.development.stylus, path.development.css] ,  ['stylus']);
  gulp.watch(path.development.coffee,                           ['js']);
  gulp.watch(path.development.js,                               ['js']);
  gulp.watch(path.development.jade,                             ['jade']);
});

gulp.task('default', ['stylus', 'js', 'jade']);

