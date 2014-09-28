/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/24/14.
 */
umd(function(define) {
        define(function(require) {
            var func = require('sampleModules/umd/defineFunction');
            var func2 = require('sampleModules.umdv.defineFunction');
            var object3 = require('./exportsObject');
            return function() {
                return func() + " " + func2() + " " + object3.value;
            }
        });
    }, "sampleModules.umd.withMapping", {
        requireJS: {
            "sampleModules.umdv.defineFunction": "sampleModules/umdv/defineFunction"
        },
        nodeJS: {
            "sampleModules.umdv.defineFunction": "../umdv/defineFunction"
        },
        browserGlobal: {
            "./exportsObject": "sampleModules.umd.exportsObject"
        }
    },
    require, exports, module);
