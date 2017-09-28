var path = require('path');
var webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');

var ModuleUtils = require("./webpack/ModuleUtils");

var sourcePath = path.join(__dirname, 'src/main/resources/assets');
var modulePath = path.join(__dirname, 'node_modules');
var targetPath = path.join(__dirname, 'build/resources/main/assets');

const moduleLocator = ModuleUtils.getModuleLocator(sourcePath);

/**
 * Union of manifest files for multiple configurations
 * */
const manifestPluginCache = {};

var mainConfig = {
    output: {
        path: path.join(targetPath), //path to where webpack will build your stuff
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js'
    },
    resolve: {
        extensions: ['*', '.js'],
        modules: [sourcePath, modulePath]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader:'babel-loader?cacheDirectory',
                include: sourcePath
            },
            // {
            //     test: /\.css$/,
            //     use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
            // },
            {test: /\.(png|woff|woff2|eot|ttf|svg)/, use: ['url-loader?limit=100000']}
        ]
    },

    entry: moduleLocator.getPageEntries(),

    plugins: [

        new webpack.ProvidePlugin({
            fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
        }),

        new ManifestPlugin({
            fileName: "javascript-manifest.json",
            cache: manifestPluginCache
        }),

        // /* This plugin separate css from js and create same file with css type */
        // new ExtractTextPlugin('css/page-commons.[contenthash].css'),

        new webpack.optimize.CommonsChunkPlugin({
            name: "js/page-commons",
            fileName: "js/page-commons.[chunkhash].js",
            minChunks: 2
        }),


        // new webpack.DefinePlugin({
        //     // A common mistake is not stringifying the "production" string.
        //     'process.env.NODE_ENV': JSON.stringify('production')
        // }),
        // /*Minimize all JavaScript and css output of chunks*/
        // new webpack.optimize.UglifyJsPlugin({
        //     beautify: false,
        //     sourceMap: false,
        //     minimize: true,
        //     compress: {
        //         warnings: false
        //     },
        //     output: {
        //         screw_ie8: true
        //     },
        //     comments: false
        // }),
        //
        // new webpack.LoaderOptionsPlugin({
        //     minimize: true,
        //     debug: false
        // })
    ]
};

module.exports = [mainConfig];