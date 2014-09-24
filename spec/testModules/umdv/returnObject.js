/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/22/14.
 */
(function (define) {
    define(function(require, exports, module) {
        return {
            value: "umdv.returnObject value"
        };
    });
}((function() {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        return define;
    }
    else {
        //noinspection JSUnresolvedVariable
        if (typeof require === 'function') {
            // Node (not CommonJS because module.exports does not conform)
            return function(factory) {
                //noinspection JSUnresolvedVariable
                var result = factory(require, exports, module);
                if (typeof result !== 'undefined') {
                    //noinspection JSUnresolvedVariable
                    module.exports = result;
                }
            }
        }
        else {
            // Browser globals
            return umd.createDefine("testModules.umdv.returnObject");
        }
    }
}())));