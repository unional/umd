/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/27/14.
 */
umd(function(define) {
    define(function(require /*, exports, module */) {
        function ready(name, callback) {
            callback("processed " + name);
        }

        ready.load = function(name, req, onLoad, config) {
            if (config.isBuild) {
                onLoad();
            }
            else {
                ready(name, onLoad);
            }
        }

        return ready;
    });
}, "sampleModules.umd.simplePlugin", require, exports, module);
