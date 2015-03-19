// Karma configuration
// Generated on Tue Sep 23 2014 22:59:06 GMT-0700 (PDT)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai'],

        // list of files / patterns to load in the browser
        files: [
            "umd.js",
            "umd/createContext.js",
            "node_modules/sampleModules/umd/_umd.require.config.js",
            "node_modules/sampleModules/umd/defineFunction.js",
            "node_modules/sampleModules/umd/defineObject.js",
            "node_modules/sampleModules/umd/exportsObject.js",
            "node_modules/sampleModules/umd/moduleExportsObject.js",
            "node_modules/sampleModules/umd/returnObject.js",
            "node_modules/sampleModules/umdv/defineFunction.js",
            "node_modules/sampleModules/umdv/defineObject.js",
            "node_modules/sampleModules/umdv/exportsObject.js",
            "node_modules/sampleModules/umdv/moduleExportsObject.js",
            "node_modules/sampleModules/umdv/returnObject.js",
            "node_modules/sampleModules/umd/defineFunctionWithDep.js",
            "node_modules/sampleModules/umdv/defineFunctionWithDep.js",
            "node_modules/sampleModules/umd/withMapping.js",
            "node_modules/sampleModules/umd/withMapping2.js",
            "node_modules/sampleModules/umd/mappedModule.js",
            "node_modules/sampleModules/umd/withSecret.js",
            "node_modules/sampleModules/umd/withPath.js",
            "node_modules/sampleModules/umd/simplePlugin.js",
            "spec/lib/when.js",
            "spec/bg/*.js",
            "spec/node/umd/*.spec.js"
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "umd.js": ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 4984,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
