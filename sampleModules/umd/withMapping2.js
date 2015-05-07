/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/24/14.
 */
umd(function(define) {
        define(function(require) {
            var func = require('sampleModules/umdv/defineFunction');
            var func2 = require('sampleModules.umd.defineFunction');
            var object3 = require('./returnObject');
            return function() {
                return func() + " " + func2() + " " + object3.value;
            }
        });
    }, "sampleModules.umd.withMapping2", {
        requireJS: {
            "sampleModules.umd.defineFunction": "sampleModules/umd/defineFunction"
        },
        nodeJS: {
            "sampleModules.umd.defineFunction": "../umd/defineFunction"
        },
        browserGlobal: {
            "./returnObject": "sampleModules.umd.returnObject"
        }
    },
    require, exports, module);
