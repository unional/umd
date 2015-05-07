// Karma configuration
// Generated on Tue Sep 23 2014 22:59:06 GMT-0700 (PDT)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            "src/umd.js",
            "sampleModules/umd/_umd.require.config.js",
            "sampleModules/umd/defineFunction.js",
            "sampleModules/umd/defineObject.js",
            "sampleModules/umd/exportsObject.js",
            "sampleModules/umd/moduleExportsObject.js",
            "sampleModules/umd/returnObject.js",
            "sampleModules/umdv/defineFunction.js",
            "sampleModules/umdv/defineObject.js",
            "sampleModules/umdv/exportsObject.js",
            "sampleModules/umdv/moduleExportsObject.js",
            "sampleModules/umdv/returnObject.js",
            "sampleModules/umd/defineFunctionWithDep.js",
            "sampleModules/umdv/defineFunctionWithDep.js",
            "sampleModules/umd/withMapping.js",
            "sampleModules/umd/withMapping2.js",
            "sampleModules/umd/mappedModule.js",
            "sampleModules/umd/withSecret.js",
            "sampleModules/umd/withPath.js",
            "sampleModules/umd/simplePlugin.js",
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
