/*!
 * Gulp SMPL Makeup Builder
 *
 * @version 3.6.0
 * @author Artem Dordzhiev (Draft)
 * @type Module gulp
 * @license The MIT License (MIT)
 */

"use strict";

/* Get plugins */
var gulp = require("gulp");
var browserSync = require("browser-sync");
var config = require("./config.json");
var fs = require("fs");
var env = process.env.NODE_ENV;
var envLocale = process.env.YSA_LOCALE;
var pkg = JSON.parse(fs.readFileSync("./package.json"));
var $ = require("gulp-load-plugins")({
    pattern: ["gulp-*", "gulp.*", "del", "merge-stream", "vinyl-buffer"],
});
var webpack = require("webpack-stream");
var ghPages = require("gulp-gh-pages");

/* Error handler closure */
function errorHandler(task, title) {
    "use strict";

    return function (err) {
        $.util.log(
            task
                ? $.util.colors.red(
                      "[" + task + (title ? " -> " + title : "") + "]"
                  )
                : "",
            err.toString()
        );
        this.emit("end");
    };
}

/* Build task */
gulp.task(
    "build",
    $.sequence("clean", ["copy:static"], "icons", [
        "pug",
        "sass",
        "js",
        "js:vendor",
    ])
);
gulp.task("serve", $.sequence("build", "browsersync", "watch"));
gulp.task("default", ["build"]);

/* Sass task */
gulp.task("sass", function () {
    return (
        gulp
            .src("./src/scss/main.scss")
            .pipe($.sourcemaps.init())
            .on("error", errorHandler("sass", "sourcemaps:init"))
            .pipe($.sass())
            .on("error", errorHandler("sass", "compile"))
            .pipe($.autoprefixer())
            .on("error", errorHandler("sass", "autoprefixer"))
            .pipe($.if(config.rtl, $.rtlcss()))
            .on("error", errorHandler("sass", "rtl"))
            //.pipe($.cleanCss()).on('error', errorHandler('sass', 'cleanCSS'))
            .pipe($.sourcemaps.write("."))
            .on("error", errorHandler("sass", "sourcemaps:write"))
            .pipe(gulp.dest("./dist/assets/css/"))
            .pipe(browserSync.stream({ match: "**/*.css" }))
    );
});

/* Pug task */
gulp.task("pug", function () {
    var pugConfig = config.pug ? config.pug : {};
    var locale =
        envLocale || config.locale
            ? JSON.parse(
                  fs.readFileSync(
                      "./src/locales/" + (envLocale || config.locale) + ".json"
                  )
              )
            : null;
    console.log(env);
    var pugOptions = {
        basedir: "./src/pug/",
        pretty: true,
        locals: {
            ENV: env,
            PACKAGE: pkg,
            __: locale,
        },
    };

    return gulp
        .src(["./src/pug/**/*.pug"])
        .pipe(
            $.if(pugConfig.cache, $.changed("./dist/", { extension: ".html" }))
        )
        .pipe($.if(pugConfig.cache, $.if(global.isWatching, $.cached("pug"))))
        .pipe(
            $.if(
                pugConfig.cache,
                $.pugInheritance({ basedir: pugOptions.basedir })
            )
        )
        .pipe(
            $.filter(function (file) {
                return !/\/_/.test(file.path) && !/^_/.test(file.relative);
            })
        )
        .pipe($.pug(pugOptions))
        .on("error", errorHandler("pug", "compile"))
        .pipe(gulp.dest("./dist/"))
        .on("end", function () {
            browserSync.reload();
        });
});

/* JS task */
gulp.task("js", function (done) {
    var webpackMode = fs.existsSync("./webpack.config.js");
    $.sequence(webpackMode ? "js:webpack" : "js:copy", done);
});

gulp.task("js:copy", function () {
    return gulp
        .src(["./src/js/**/*"])
        .pipe($.uglify())
        .on("error", errorHandler("js", "uglify"))
        .pipe(gulp.dest("./dist/assets/js"));
});

gulp.task("js:webpack", function () {
    return gulp
        .src(["./src/js/**/*"])
        .pipe(webpack(require("./webpack.config.js")))
        .pipe(gulp.dest("./dist/assets/js"));
});

gulp.task("js:vendor", function () {
    var jsConfig = config.js ? config.js : { vendor: {} };
    var bowerOptions = {};
    var uglifySaveLicense = require("uglify-save-license");
    var uglifyOptions = {
        output: {
            comments: uglifySaveLicense,
        },
    };

    var stream = gulp
        .src("./bower.json")
        .pipe($.mainBowerFiles("**/*.js", bowerOptions))
        .on("error", errorHandler("js:vendor", "mainBowerFiles"));

    if (jsConfig.vendor.prepend) {
        stream = $.mergeStream(gulp.src(jsConfig.vendor.prepend), stream);
    }

    if (jsConfig.vendor.append) {
        stream = $.mergeStream(stream, gulp.src(jsConfig.vendor.append));
    }

    return (
        stream
            .pipe($.sourcemaps.init())
            .on("error", errorHandler("js:vendor", "sourcemaps:init"))
            .pipe($.concat("vendor.js"))
            .on("error", errorHandler("js:vendor", "concat"))
            //.pipe($.uglify(uglifyOptions)).on('error', errorHandler('js:vendor', 'uglify'))
            .pipe($.sourcemaps.write("."))
            .on("error", errorHandler("js:vendor", "sourcemaps:write"))
            .pipe(gulp.dest("./dist/assets/js/"))
    );
});

/* Icon tasks */
gulp.task("icons", ["icons:svgsprites", "icons:sprites"]);

gulp.task("icons:svgsprites", function () {
    if (fs.existsSync("./src/icons/")) {
        var svgSpriteOptions = {
            mode: {
                symbol: {
                    dest: "",
                    sprite: "svgsprites.svg",
                    render: {
                        scss: {
                            dest: "../../../../src/scss/generated/svgsprites.scss",
                            template: "./src/scss/templates/svgsprites.scss",
                        },
                    },
                },
            },
        };

        return gulp
            .src("./src/icons/*.svg")
            .pipe($.svgSprite(svgSpriteOptions))
            .pipe(gulp.dest("./dist/assets/img/sprites/"));
    }
});

gulp.task("icons:sprites", function () {
    if (fs.existsSync("./src/sprites/")) {
        var spriteData = gulp.src("./src/sprites/**/*.png").pipe(
            $.spritesmith({
                imgPath: "../img/sprites/sprites.png",
                imgName: "sprites.png",
                retinaImgPath: "../img/sprites/sprites@2x.png",
                retinaImgName: "sprites@2x.png",
                retinaSrcFilter: ["./src/sprites/**/**@2x.png"],
                cssName: "sprites.scss",
                cssTemplate: "./src/scss/templates/sprites.scss",
                padding: 1,
            })
        );

        var imgStream = spriteData.img.pipe(
            gulp.dest("./dist/assets/img/sprites/")
        );

        var cssStream = spriteData.css.pipe(gulp.dest("./src/scss/generated"));

        return $.mergeStream(imgStream, cssStream);
    }
});

/* Browsersync Server */
gulp.task("browsersync", function () {
    browserSync.init({
        server: "./dist",
        notify: false,
        port: 64999,
        ui: false,
        online: false,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false,
        },
    });
});

/* Watcher */
gulp.task("watch", function () {
    global.isWatching = true;

    $.watch("./src/scss/**/*.scss", function () {
        gulp.start("sass");
    });
    $.watch("./src/pug/**/*.pug", function () {
        gulp.start("pug");
    });
    $.watch("./src/locales/**/*.js", function () {
        gulp.start("pug");
    });
    $.watch("./src/js/**/*.js", function () {
        gulp.start("js");
    });
    $.watch("./src/static/**/*", function () {
        gulp.start("copy:static");
    });
});

/* Copy tasks */
gulp.task("copy:static", function () {
    return gulp.src(["./src/static/**/*"]).pipe(gulp.dest("./dist/"));
});

gulp.task("copy:bower", function () {
    return gulp
        .src(["./bower_components/**/*"])
        .pipe(gulp.dest("./dist/bower_components"));
});

gulp.task("deploy", function () {
    return gulp.src(["./dist/**/*"]).pipe(
        ghPages({
            branch: "main",
            push: true,
            remoteUrl: "https://github.com/soorq/ysa-land.git",
        })
    );
});

/* Other tasks */
gulp.task("reload", function () {
    browserSync.reload();
});

gulp.task("clean", function () {
    return $.del(["./dist/**/*", "./tmp"]);
});
