'use strict';

/* this variable contains paths to source files (src), to built files (build) and to files that should be watched (watch) */
var path = {
    build: {
        html:   'build/',
        js:     'build/js/',
        css:    'build/css/',
        img:    'build/images/',
        fonts:  'build/fonts/',
        vendor: 'build/js/vendor'
    },
    src: {
        html:   'src/pages/**/*.html',
        js:     'src/js/*.js',
        style:  'src/style/main.scss',
        img:    'src/images/**/*.*',
        fonts:  'src/fonts/**/*.*',
        config: ['src/*.xml', 'src/*.json'],
        vendor: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/popper.js/dist/umd/index.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js'
        ]
    },
    watch: {
        html:   'src/pages/**/*.html',
        js:     'src/js/**/*.js',
        css:    'src/style/**/*.scss',
        img:    'src/images/**/*.*',
        fonts:  'srs/fonts/**/*.*',
        config: ['src/*.xml', 'src/*.json']
    },
    clean: './build/*'
};

/* local server config */
var config = {
    server: {
        baseDir: './build'
    },
    notify: false
};

/* Helpers */
var sortVendors = function (arr) {
    return arr.map(function (item) {return item.slice(item.lastIndexOf('/') + 1)})
}

/* importing gulp plugins */
var gulp = require('gulp'),  // подключаем Gulp
    webserver = require('browser-sync'), // сервер для работы и автоматического обновления страниц
    order = require('gulp-order'), // модуль для сортировки файлов
    concat = require('gulp-concat'), // модуль для объединения нескольких файлов в один
    babel = require('gulp-babel'), //convert to es5 with babel
    plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
    rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
    sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
    sass = require('gulp-sass'), // модуль для компиляции SASS (SCSS) в CSS
    autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
    cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
    uglify = require('gulp-uglify-es').default, // модуль для минимизации JavaScript
    cache = require('gulp-cache'), // модуль для кэширования
    imagemin = require('gulp-imagemin'), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
    imageminMozjpeg = require('imagemin-mozjpeg'), // плагин для сжатия jpeg
    imageminOptipng = require('imagemin-optipng'), // плагин для сжатия png
    imageminSvgo = require('imagemin-svgo'), // плагин для сжатия svg
    rimraf = require('gulp-rimraf'), // плагин для удаления файлов и каталогов
    rename = require('gulp-rename');

/* Tasks */

// Launch local server
gulp.task('webserver', function () {
    webserver(config);
});

// prepare XML, JSON configs
gulp.task('config:build', function () {
    return gulp.src(path.src.config) // take all required files
        .pipe(gulp.dest(path.build.html)) // add files to the compiled project
        .pipe(webserver.reload({ stream: true })); // reload local server
});

// Build all vendor files and combine into one 'vendors.js' file
gulp.task('vendor', function () {
    return gulp.src(path.src.vendor) // get all vendors files
        .pipe(gulp.dest((path.build.vendor))) // add vendors files to the compiled project
        .pipe(order(sortVendors(path.src.vendor))) // sort vendor files as they are ordered in src list
        .pipe(concat('vendors.js')) // concatenate all vendor files into one file
        .pipe(gulp.dest(path.build.vendor)); // add to the compiled project
});

// build html
gulp.task('html:build', function () {
    return gulp.src(path.src.html) // get all HTML files from source folder
        .pipe(plumber()) // check for errors
        .pipe(rigger()) // include all attachments inside HTML files
        .pipe(gulp.dest(path.build.html)) // add files to the compiled project
        .pipe(webserver.reload({ stream: true })); // reload local server
});

// build styles
gulp.task('css:build', function () {
    return gulp.src(path.src.style) // get main.scss
        .pipe(plumber()) // check for errors
        .pipe(sourcemaps.init()) // initialise sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer()) // add old browsers prefixes
        .pipe(gulp.dest(path.build.css)) // add files to the compiled project
        .pipe(webserver.reload({ stream: true })); // reload local server
});

// build minified styles
gulp.task('css:build:min', function () {
    return gulp.src(path.src.style) // get main.scss
        .pipe(plumber()) // check for errors
        .pipe(sourcemaps.init()) // initialise sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer()) // add old browsers prefixes
        .pipe(gulp.dest(path.build.css)) // add files to the compiled project
        .pipe(rename({ suffix: '.min' })) // add .min suffix for minified version
        .pipe(cleanCSS()) // make minified version of CSS
        .pipe(sourcemaps.write('./')) // wright sourcemap
        .pipe(gulp.dest(path.build.css)) // add files to the compiled project
        .pipe(webserver.reload({ stream: true })); // reload local server
});

// build js
gulp.task('js:build', function () {
    return gulp.src(path.src.js) // get main.js
        .pipe(babel({presets: ['@babel/env']})) //convert to es5 with babel
        .pipe(plumber()) // check for errors
        .pipe(rigger()) // include all attachments inside JS file
        .pipe(gulp.dest(path.build.js)) // add files to the compiled project
        .pipe(webserver.reload({ stream: true })); // reload local server
});

// build minified js
gulp.task('js:build:min', function () {
    return gulp.src(path.src.js) // get main.js
        .pipe(babel({presets: ['@babel/env']})) //convert to es5 with babel
        .pipe(plumber()) // check for errors
        .pipe(rigger()) // include all attachments inside JS file
        .pipe(gulp.dest(path.build.js)) // add files to the compiled project
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init()) //initialise sourcemap
        .pipe(uglify()) // do minification
        .pipe(sourcemaps.write('./')) // wright sourcemap
        .pipe(gulp.dest(path.build.js)) // add files to the compiled project
        .pipe(webserver.reload({ stream: true })); // reload local server
});

// copy fonts
gulp.task('fonts:build', function () {
    return gulp.src(path.src.fonts) // get fonts from source
        .pipe(gulp.dest(path.build.fonts)); // add fonts to the compiled project
});

// build images
gulp.task('image:build', function () {
    return gulp.src(path.src.img) // get images from source
        .pipe(cache(
            imagemin([ // compress images
                imagemin.gifsicle({ interlaced: true }),
                imageminMozjpeg({
                    progressive: true,
                    quality: 70
                }),
                imageminOptipng(),
                imageminSvgo({ plugins: [{removeViewBox: false}] })
            ])
        )).pipe(gulp.dest(path.build.img)); // add files to the compiled project
});

// removing build folder
gulp.task('clean:build', function () {
    return gulp.src(path.clean, { read: false })
        .pipe(rimraf());
});

// clear caches
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// Build task
gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'vendor',
            'html:build',
            'css:build',
            'js:build',
            'fonts:build',
            'image:build',
            'config:build'
        )
    )
);

// Build minified version
gulp.task('build:min',
    gulp.series('clean:build',
        gulp.parallel(
            'vendor',
            'html:build',
            'css:build:min',
            'js:build:min',
            'fonts:build',
            'image:build',
            'config:build'
        )
    )
);

// run tasks on files change
gulp.task('watch', function () {
    gulp.watch(path.watch.html, gulp.series('html:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
    gulp.watch(path.watch.config, gulp.series('config:build'));
});

// Default task
gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')
));
