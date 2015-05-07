/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/25/14.
 */
umd((function() {
    return function(define) {
        define(function(require) {
            var secret = Math.random();
            return function() {
                return secret;
            };
        });
    };
}()), "sampleModules.umd.withSecret", require, exports, module);
