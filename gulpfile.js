'use strict';

/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
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

/* настройки сервера */
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

/* подключаем gulp и плагины */
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

/* задачи */

// запуск сервера
gulp.task('webserver', function () {
    webserver(config);
});

gulp.task('vendor', function () {
    return gulp.src(path.src.vendor)
        .pipe(gulp.dest((path.build.vendor)))
        .pipe(order(sortVendors(path.src.vendor))) //sort vendor files as they are ordered in src list
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest(path.build.vendor));
});

// сбор html
gulp.task('html:build', function () {
    return gulp.src(path.src.html) // выбор всех html файлов по указанному пути
        .pipe(plumber()) // отслеживание ошибок
        .pipe(rigger()) // импорт вложений
        .pipe(gulp.dest(path.build.html)) // выкладывание готовых файлов
        .pipe(webserver.reload({ stream: true })); // перезагрузка сервера
});


// сбор XML, JSON конфига
gulp.task('config:build', function () {
    return gulp.src(path.src.config) // выбор всех html файлов по указанному пути
        .pipe(gulp.dest(path.build.html)) // выкладывание готовых файлов
        .pipe(webserver.reload({ stream: true })); // перезагрузка сервера
});

// сбор стилей
gulp.task('css:build', function () {
    return gulp.src(path.src.style) // получим main.scss
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(sourcemaps.init()) // инициализируем sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer()) // добавим префиксы
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// сбор стилей
gulp.task('css:build:min', function () {
    return gulp.src(path.src.style) // получим main.scss
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(sourcemaps.init()) // инициализируем sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer()) // добавим префиксы
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS()) // минимизируем CSS
        .pipe(sourcemaps.write('./')) // записываем sourcemap
        .pipe(gulp.dest(path.build.css)) // выгружаем в build
        .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// сбор js
gulp.task('js:build', function () {
    return gulp.src(path.src.js) // получим файл main.js
        .pipe(babel({presets: ['@babel/env']})) //convert to es5 with babel
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rigger()) // импортируем все указанные файлы в main.js
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// сбор js
gulp.task('js:build:min', function () {
    return gulp.src(path.src.js) // получим файл main.js
        .pipe(babel({presets: ['@babel/env']})) //convert to es5 with babel
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(rigger()) // импортируем все указанные файлы в main.js
        .pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init()) //инициализируем sourcemap
        .pipe(uglify()) // минимизируем js
        .pipe(sourcemaps.write('./')) //  записываем sourcemap
        .pipe(gulp.dest(path.build.js)) // положим готовый файл
        .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// перенос шрифтов
gulp.task('fonts:build', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

// обработка картинок
gulp.task('image:build', function () {
    return gulp.src(path.src.img) // путь с исходниками картинок
        .pipe(cache(
            imagemin([ // сжатие изображений
                imagemin.gifsicle({ interlaced: true }),
                imageminMozjpeg({
                    progressive: true,
                    quality: 70
                }),
                imageminOptipng(),
                imageminSvgo({ plugins: [{removeViewBox: false}] })
            ])
        )).pipe(gulp.dest(path.build.img)); // выгрузка готовых файлов
});

// удаление каталога build
gulp.task('clean:build', function () {
    return gulp.src(path.clean, { read: false })
        .pipe(rimraf());
});

// очистка кэша
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// сборка
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

// сборка минифицированой версии
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

// запуск задач при изменении файлов
gulp.task('watch', function () {
    gulp.watch(path.watch.html, gulp.series('html:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
    gulp.watch(path.watch.config, gulp.series('config:build'));
});

// задача по умолчанию
gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')
));
