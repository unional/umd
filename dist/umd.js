/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/unional/LICENSE)).
 * @version 0.4.2
 * Created by unional on 9/21/14.
 */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(root) {
    "use strict";

    /**
     *
     * @type {{nodeJS: {}, requireJS: {}, browser: {}}}
     */
    var x = {nodeJS: {}, requireJS: {}, browser: {}};

    //noinspection JSUnresolvedVariable
    if (typeof global !== "undefined") {
        // node environment use global as root.
        //noinspection JSUnresolvedVariable
        root = global;
    }

    function wrapRequire(require, mapping) {
        return function(moduleName) {
            return require(mapping[moduleName] || moduleName);
        };
    }

    function wrapDefine(define, require, mapping) {
        return function() {
            if (arguments.length > 0 && typeof arguments[0] === "function") {
                var definitionMethod = arguments[0];
                var params = getParamNames(definitionMethod);
                if (params.length > 0 && params[0] === "require") {
                    var currentContext = require.s.contexts._;

                    // wrap the makeRequire method to inject the wrapped require method.
                    var makeRequire = currentContext.makeRequire;
                    currentContext.makeRequire = function() {
                        var localRequire = makeRequire.apply(currentContext, arguments);
                        return wrapRequire(localRequire, mapping);
                    };

                    // Wrap the definition method so that I can restore the makeRequire method
                    // once the define() has everything setup.
                    // requireJS looks at the params length to determine whether it is
                    // function (require) or function (require, exports, module)
                    // If params only have 'require', it will only load 'require' using deps.
                    // Therefore I mimic it here so that requireJS will invoke the same logic.
                    arguments[0] = params.length === 1 ?
                                   function(require) {
                                       currentContext.makeRequire = makeRequire;
                                       return definitionMethod.apply(currentContext, arguments)
                                   } :
                                   function(require, exports, module) {
                                       currentContext.makeRequire = makeRequire;
                                       return definitionMethod.apply(currentContext, arguments)
                                   };
                }
            }
            define.apply(this, arguments);
        }
    }

    var getParamNames = (function() {
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var ARGUMENT_NAMES = /([^\s,]+)/g;
        return function getParamNames(func) {
            var fnStr = func.toString().replace(STRIP_COMMENTS, '');
            var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
            if (result === null) {
                result = [];
            }
            return result
        };
    }());

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
     * @param {{nodeJS: {}, requireJS: {}, browserGlobal: {}}} [mappings] Optional mapping if the require identifiers
     * are different in different environments.
     */
    var umd = function(factory, browserGlobalIdentifier, require, exports, module, mappings) {
        if (umd.isRequireJS()) {
            var localDefine = (mappings && mappings.requireJS) ?
                              wrapDefine(define, require, mappings.requireJS) : define;
            factory(localDefine);
        }
        else if (umd.isNodeJS()) {
            // Node (not CommonJS because module.exports does not conform)
            factory(function(definition) {
                var localRequire = (mappings && mappings.nodeJS) ? wrapRequire(require, mappings.nodeJS) : require;

                var result = (typeof definition === "object") ? definition : definition(localRequire, exports, module);

                if (typeof result !== "undefined") {
                    module.exports = result;
                }
            });
        }
        else {
            // browser global.
            if (mappings && mappings.browserGlobal) {
                factory(umd.createDefine(browserGlobalIdentifier, mappings.browserGlobal));
            }
            else {
                factory(umd.createDefine(browserGlobalIdentifier));
            }
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
        var modules = {};

        function createDefine(browserGlobalIdentifier, mapping) {
            return function browserGlobalDefine(definition) {
                var module = {exports: {}};
                var result;
                if (typeof definition === "object") {
                    result = definition;
                }
                else {
                    if (mapping) {
                        require = wrapRequire(require, mapping);
                    }
                    result = definition(require, module.exports, module);
                    result = (typeof result !== 'undefined') ? result : module.exports;
                }

                if (browserGlobalIdentifier) {
                    var defId = convertToBrowserGlobalIdentifier(browserGlobalIdentifier);
                    definitions[defId] = definition;

                    if (reloadTargets.indexOf(defId) === -1) {
                        var terms = browserGlobalIdentifier.split(/[.\/]/);
                        var id = terms.pop();
                        var base = umd.ns(terms.join("."));
                        base[id] = result;
                    }

                    modules[defId] = result;
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

            var module;
            try {
                if (Array.isArray(moduleName)) {
                    var results = moduleName.map(function(item) {
                        return resolveModule(item);
                    });

                    if (results && callback) {
                        callback.apply(this, results);
                    }
                }
                else {
                    module = resolveModule(moduleName);

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
                var id = convertToBrowserGlobalIdentifier(moduleName);
                var stubs = config.stubs || {};
                if (stubs[id]) {
                    return stubs[id];
                }

                if (reloadTargets.indexOf(id) !== -1) {

                    var definition = definitions[id];
                    if (definition) {
                        createDefine(id)(definition);
                    }
                }

                if (modules[id]) {
                    return modules[id];
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

                var module = root[name];
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