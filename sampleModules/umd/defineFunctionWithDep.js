/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/21/14.
 */
umd(function(define) {
    define(function(require) {
        var func = require('sampleModules/umd/defineFunction');
        var func2 = require('sampleModules.umdv.defineFunction');

        return function() {
            return "Wrapping (sampleModule/umd/defineFunction): " + func() + "\n"
                + "Wrapping (sampleModule.umdv.defineFunction): " + func2();
        }
    });
}, "sampleModules.umd.defineFunctionWithDep", require, exports, module);
