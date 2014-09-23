/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/unional/LICENSE)).
 * @version 0.3.2
 * Created by unional on 9/21/14.
 */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(root) {
    //"use strict";
    /**
     * Creates namespaces to be used for scoping variables and classes so that they are not global.
     * Specifying the last node of a namespace implicitly creates all other nodes.
     * Similar to Ext.ns() without the dependency.
     * @param {...string} namespace
     * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
     * @method namespace
     */
    function namespace(namespace) {
        var result;
        for (var i = 0, len = arguments.length; i < len; i++) {
            namespace = arguments[i];
            var components = namespace.split(/[.\/]/);

            var component = components.shift();
            result = root[component] = root[component] || {};

            while (components.length) {
                component = components.shift();
                result = result[component] = result[component] || {};
            }
        }

        return result;
    }

    /**
     * A simple stub for requireJS and commonJS require function.
     * This is use to support universal module definition (umd) for browser globals code.
     * Setup umd.require.config as a map for custom mapping.
     * @param {string} moduleName Name of the module.
     * @param {function} [callback] Function to call after resolving the module.
     * @returns {*} The target module if found; otherwise, undefined.
     */
    var umdRequire = function(moduleName, callback) {
        if (!moduleName) {
            throw new Error("moduleName can't be empty");
        }

        var parts = moduleName.split('!', 2);
        var arg = undefined;
        if (parts.length == 2) {
            moduleName = parts[0];
            if (parts[1]) {
                arg = parts[1];
            }
        }

        var names = moduleName.split(/[.\/]/);
        var name = names.shift();

        // Assume moduleName starts as browser global
        // or a shorthand defined in umd.require.config
        var config = umdRequire.config;
        var module = config[name] || root[name];
        while (module && names.length) {
            name = names.shift();
            module = module[name];
        }

        if (parts.length == 2) {
            module = module(arg);
        }

        if (module && callback) {
            callback(module);
        }

        return module;
    };

    /**
     * Config object similar to require.js paths option.
     * FUTURE: Support . syntax ("bootstrap.modal").
     * @type {{}}
     */
    umdRequire.config = {};

    /**
     * Universal module definition method. Use this method to simplify module definition.
     * To use this method, write your module as follow:
     * <pre><code>
     *     umd(function(define) {
      *         define(function(require, exports, module) {
      *             // Your code here
      *         });
      *    }, "MyCompany.MyProduct.MySection.MyComponentName", require, exports, module);
     * </code></pre>
     * Notice the last three parameters are require, exports and module. Keep them as is.
     * They are used to round tripped back to your code for node.js.
     *
     * For require.js, load this umd module before other modules
     * (at common/main.js where you write require.config({...}))
     * For r.js, you can use onBuildRead to trim out the umd code, just leaving the define call in-place.
     *
     * This is tested for browser global and require.js.
     * It does not work for node.js yet because the module object in this scope is different than in the actual module
     * @param factory
     * @param {string|null} browserGlobalIdentifier Identifier for browser global. Pass in falsy value to omit browser global definition.
     * @param require Round trip require function (pre-defined)
     * @param exports Round trip exports object (pre-defined)
     * @param module Round trip module object (pre-defined)
     */
    var umd = function (factory, browserGlobalIdentifier, require, exports, module) {
        if (typeof define === 'function' && define.amd) {
            factory(define);
        }
        else {
            //noinspection JSUnresolvedVariable
            if (typeof require === "function" &&
                typeof exports === 'object' &&
                typeof module === 'object') {
                // Node (not CommonJS because module.exports does not conform)
                factory(function(definition) {
                    //noinspection JSUnresolvedVariable
                    var result = definition(require, exports, module);
                    if (typeof result !== "undefined") {
                        //noinspection JSUnresolvedVariable
                        module.exports = result;
                    }
                });
            }
            else {
                // browser global.
                factory(function(definition) {
                    var result = definition(umdRequire, exports, module);

                    if (browserGlobalIdentifier) {
                        var terms = browserGlobalIdentifier.split(/[.\/]/);
                        var id = terms.pop();
                        var base = namespace(terms.join("."));
                        base[id] = (typeof result !== 'undefined')? result : module.exports;
                    }
                });
            }
        }
    };

    umd.ns = namespace;
    umd.require = umdRequire;

    //noinspection JSUnresolvedVariable
    if (typeof global !== 'undefined') {
        // Node js
        //noinspection JSUnresolvedVariable
        global.umd = umd;
        module.exports = umd;
    }
    else {
        root.umd = umd;
        // define require, exports, and module so that they won't cause
        // ReferenceError in the module for browser global scenario.
        root.require = root.require || {};
        root.module = root.module || { exports: {} };
        root.exports = root.exports || root.module.exports;
    }
}(this));