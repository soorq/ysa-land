"use strict";

const NODE_ENV = process.env.NODE_ENV || "development";
const YSA_LOCALE = process.env.YSA_LOCALE || "en";
const webpack = require("webpack");

module.exports = {
    entry: "./src/js/app.js",

    output: {
        path: __dirname,
        filename: "bundle.js",
        publicPath: "/assets/js/",
    },

    module: {
        loaders: [
            { test: /\.json$/, loader: "json" },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader?presets[]=es2015",
            },
        ],
    },

    resolve: {
        modulesDirectories: ["./src/js"],
    },

    devtool: "source-map",

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: false,
                unsafe: true,
            },
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(NODE_ENV),
                YSA_LOCALE: JSON.stringify(YSA_LOCALE),
            },
        }),
    ],
};
