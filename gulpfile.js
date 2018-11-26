'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
// var connect = require('connect');
// var serve = require('serve-static');
var browsersync = require('browser-sync');
var browserify = require('browserify');
var source = require('vinyl-source-stream'); // Added
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var rename = require('gulp-rename');
var es = require('event-stream');
var merge = require('merge-stream');

// proccess style 
gulp.task('styles', function() {
    return gulp.src('app/sass/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('dist/css'));
});

// process scripts
gulp.task('scripts', function() {
    return gulp.src('dist/js/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            // .pipe(concat('main.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'));
});

gulp.task('images', function() {
    return gulp.src('app/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
});

// gulp.task('server', function() {
//     return connect().use(serve(__dirname))
//         .listen(8080)
//         .on('listening', function() {
//             console.log('Server Running: View at http://localhost:8080');
//         });
// });

gulp.task('browsersync', function() {
    return browsersync({
        server: {
            baseDir: './'
        }
    })
});

// gulp.task('browserify', function() {
//     return browserify('./app/js/convert.js')
//         .transform('babelify', {
//             presets: ['env']
//         })
//         .bundle()
//         .pipe(source('bundle.js'))
//         .pipe(buffer())
//         // .pipe(uglify())
//         .pipe(gulp.dest('./dist/js/'));
// });

gulp.task('browserify', function() {
     // we define our input files, which we want to have
    // bundled:
    var files = [
        './app/js/main.js',
        './app/js/convert.js'
    ];
    // map them to our stream function
    var tasks = files.map(function(entry) {
        return browserify({ entries: [entry] })
            .transform('babelify', {presets: ['env']})
            .bundle()
            .pipe(source(entry))
            // rename them to have "bundle as postfix"
            .pipe(rename({
                dirname: './',
                extname: '.bundle.js'
            }))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest('./dist/js/'));
        });
    // create a merged stream
    return es.merge.apply(null, tasks);
})

// watch file for changes
gulp.task('watch', function() {
    gulp.watch('app/sass/*.scss', ['styles', browsersync.reload]);
    gulp.watch('app/js/*.js', ['browserify', browsersync.reload]);
    gulp.watch('app/img/*', ['images', browsersync.reload]);
    gulp.watch('./*.html').on('change', browsersync.reload);
});

// default task
gulp.task('default', ['styles', 'browserify', 'images', /*'server',*/ 'browsersync', 'watch']);