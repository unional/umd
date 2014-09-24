/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/unional/LICENSE)).
 * @version 0.3.8
 * Created by unional on 9/21/14.
 */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(root) {
    "use strict";

    //noinspection JSUnresolvedVariable
    if (typeof global !== "undefined") {
        // node environment use global as root.
        //noinspection JSUnresolvedVariable
        root = global;
    }

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
     * @param factory
     * @param {string|null} browserGlobalIdentifier Identifier for browser global. Pass in falsy value to omit browser global definition.
     * @param require Round trip require function (pre-defined)
     * @param exports Round trip exports object (pre-defined)
     * @param module Round trip module object (pre-defined)
     */
    var umd = function(factory, browserGlobalIdentifier, require, exports, module) {
        if (umd.isRequireJS()) {
            factory(define);
        }
        else if (umd.isNodeJS()) {
            // Node (not CommonJS because module.exports does not conform)
            factory(function(definition) {
                //noinspection JSUnresolvedVariable
                var result = (typeof definition === "object") ? definition : definition(require, exports, module);

                if (typeof result !== "undefined") {
                    //noinspection JSUnresolvedVariable
                    module.exports = result;
                }
            });
        }
        else {
            // browser global.
            factory(umd.createDefine(browserGlobalIdentifier));
        }
    };

    var contexts = {
        "default": newContext({})
    };

    /**
     * Definitions of modules referenced using umd.require().
     * This is used to re-run the definition in order to stub the dependencies.
     */
    var definitions = {};

    /**
     * This counter is used to create unique contexts.
     * @type {number}
     */
    var contextCount = 0;

    /**
     * Create new context.
     * @param config
     */
    function newContext(config) {
        var reloadTargets = [];

        function createDefine(browserGlobalIdentifier) {
            return function browserGlobalDefine(definition) {
                if (browserGlobalIdentifier) {
                    var module = {exports: {}};
                    var result;
                    if (typeof definition === "object") {
                        result = definition;
                    }
                    else {
                        result = definition(require, module.exports, module);
                        var defId = convertToBrowserGlobalIdentifier(browserGlobalIdentifier);
                        definitions[defId] = definition;
                    }

                    var terms = browserGlobalIdentifier.split(/[.\/]/);
                    var id = terms.pop();
                    var base = umd.ns(terms.join("."));
                    base[id] = (typeof result !== 'undefined') ? result : module.exports;
                }
            };
        }

        /**
         * A simple stub for requireJS and commonJS require function.
         * This is use to support universal module definition (umd) for browser globals code.
         * @param {string|string[]} moduleName Name of the module.
         * @param {function} [callback] Function to call after resolving the module.
         * @param {function} [errback] Error back function.
         * @returns {*} The target module if found; otherwise, undefined.
         */
        var require = function require(moduleName, callback, errback) {
            var error;
            if (!moduleName) {
                error = new Error("moduleName can't be empty");
                if (errback) {
                    errback(error);
                    return;
                }
                else {
                    throw error;
                }
            }

            try {
                if (Array.isArray(moduleName)) {
                    var modules = moduleName.map(function(item) {
                        return resolveModule(item);
                    });

                    if (modules && callback) {
                        callback.apply(this, modules);
                    }
                }
                else {
                    var module = resolveModule(moduleName);

                    if (module && callback) {
                        callback(module);
                    }

                    return module;
                }
            }
            catch (error) {
                if (errback) {
                    errback(error);
                }

                throw error;
            }

            function resolveModule(moduleName) {
                if (moduleName.indexOf(".") !== -1) {
                    throw new Error("Module name cannot have '.' because it will not work in amd/node environment.");
                }
                var id = convertToBrowserGlobalIdentifier(moduleName);
                if (reloadTargets.indexOf(id) !== -1) {
                    var definition = definitions[id];
                    if (definition) {
                        createDefine(id)(definition);
                    }
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

                var stubs = config.stubs || {};
                var module = stubs[name] || root[name];
                while (module && names.length) {
                    name = names.shift();
                    module = module[name];
                }

                if (parts.length == 2) {
                    module = module(arg);
                }

                return module;
            }
        };

        require.config = requireConfig;

        return {
            setReloadTargets: function(deps) {
                reloadTargets = deps.map(function(dep) {
                    return convertToBrowserGlobalIdentifier(dep);
                });
            },
            config: config,
            require: require,
            createDefine: createDefine
        };
    }

    /**
     * Creates namespaces to be used for scoping variables and classes so that they are not global.
     * Specifying the last node of a namespace implicitly creates all other nodes.
     * Similar to Ext.ns() without the dependency.
     * @param {...string} namespace
     * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
     * @method namespace
     */
    umd.namespace = function namespace(namespace) {
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
    };

    umd.ns = umd.namespace;

    /**
     * Determine whether the environment is require.js
     * @returns {boolean}
     */
    umd.isRequireJS = function isRequireJS() {
        return typeof define === "function" && define.amd != undefined;
    };
    /**
     * Determine whether the environment is node.js
     * Technically this is also true for CommonJS but I named it as NodeJS because
     * I don't fully support CommonJS yet.
     * @returns {boolean}
     */
    umd.isNodeJS = function isNodeJS() {
        return typeof require === "function" &&
               typeof exports === 'object' &&
               typeof module === 'object';
    };

    /**
     * Determine whether the environment is browser global.
     * @returns {boolean}
     */
    umd.isBrowserGlobal = function isBrowserGlobal() {
        return !umd.isRequireJS() && !umd.isNodeJS();
    };

    function convertToBrowserGlobalIdentifier(dep) {
        return dep.replace(/\./g, '/');
    }

    /**
     * Config require similar to requireJS.
     * @param {object} option Config option.
     * @param {string} [option.context] Context name. If not specified, it modifies the default context.
     * @param {object} [option.map] Map shorthands.
     * @returns {*}
     */
    function requireConfig(option) {
        if (option.context) {
            return contexts[option.context] = contexts[option.context] || newContext(option);
        }
        else {
            contexts.default.updateOption(option);
            return contexts.default.require;
        }
    }

    /**
     * Require dependencies while injects specified stubs.
     * @param {[]} deps Dependencies
     * @param {object} stubs Stubs `{ "moduleA": stubA }`
     * @param {function} callback The callback function.
     * @param {function} [errback] The error back function.
     * @returns {Function|*}
     */
    umd.stubRequire = function(deps, stubs, callback, errback) {
        if (!Array.isArray(deps)) {
            throw new Error("Dependencies must be an array.");
        }

        var require = umd.globalRequire;
        if (typeof require === "undefined" || require === umd.require) {
            // browser global
            contextCount++;
            var stubContext = 'stub' + contextCount;
            var context = contexts[stubContext] = newContext({
                stubs: stubs
            });

            context.setReloadTargets(deps);

            context.require(deps, callback, errback);
        }
        else if (require.defined) {
            // require.js
            contextCount++;
            var map = {};

            for (var key in stubs) {
                if (stubs.hasOwnProperty(key)) {
                    var stubName = 'stub' + key + contextCount;
                    map[key] = stubName;
                    (function(key) {
                        var value = stubs[key];
                        define(stubName, [], function() {
                            return value;
                        });
                    }(key))
                }
            }

            var contextName = "context_" + contextCount;
            var result = require.config({
                context: contextName,
                map: {
                    "*": map
                },
                baseUrl: require.s.contexts._.config.baseUrl,
                paths: require.s.contexts._.config.paths
            });

            var parentDefined = require.s.contexts._.defined;
            for (var m in parentDefined) {
                if (parentDefined.hasOwnProperty(m) && !map[m] && deps.indexOf(m) === -1) {
                    require.s.contexts[contextName].defined[m] = parentDefined[m];
                }
            }

            result(deps, callback, errback);
        }
        else {
            // node
            throw new Error("stubRequire not implemented for node.js yet.");
        }
    };

    // require === func -> node
    /**
     * Reference the global require function.
     * Change this if you want to use a different require function (e.g. umd.require).
     * This is typically used only for testing purpose.
     * @type {require|*}
     */
    umd.globalRequire = (typeof require === "function") ? require : root.require;

    umd.require = contexts.default.require;
    umd.createDefine = contexts.default.createDefine;

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
        root.require = root.require || undefined;
        root.module = root.module || undefined;
        root.exports = root.exports || undefined;
    }
}(this));