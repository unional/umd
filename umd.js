/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/unional/LICENSE)).
 * @version 0.4.7
 * Created by unional on 9/21/14.
 */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function(root) {
    "use strict";

    var contexts = {};

    /**
     * This counter is used to create unique contexts.
     * @type {number}
     */
    var contextCount = 0;

    /**
     * Global definitions of modules referenced using umd.require().
     * This is used to re-run the definition in order to stub the dependencies.
     */
    var definitions = {};

    // region # getParamNames helper function
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;

    /**
     * Gets parameter names of the specified function
     * @param func
     * @returns {string[]}
     */
    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null) {
            result = [];
        }
        return result
    }

    // endregion

    //noinspection JSUnresolvedVariable
    if (typeof global !== "undefined") {
        // node environment use global as root.
        //noinspection JSUnresolvedVariable
        root = global;
    }

    function resolveModuleName(moduleName, paths) {
        for (var path in paths) {
            if (paths.hasOwnProperty(path)) {
                var pathIndex = moduleName.indexOf(path);
                if (pathIndex === 0) {
                    moduleName = moduleName.replace(path, paths[path]);
                }
            }
        }
        return moduleName;
    }

    function convertToBrowserGlobalIdentifier(moduleName, paths) {
        return resolveModuleName(moduleName, paths).replace(/[\.\/]/g, '.')
    }

    function wrapRequire(require, paths) {
        return function(moduleName) {
            return require(resolveModuleName(moduleName, paths));
        };
    }

    function wrapDefine(define, require, paths) {
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
                        return wrapRequire(localRequire, paths);
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

    function deepMerge(target, source) {
        var result = {};
        var key;

        if (target && typeof target === 'object') {
            for (key in target) {
                if (target.hasOwnProperty(key)) {
                    result[key] = target[key];
                }
            }
        }

        for (key in source) {
            if (source.hasOwnProperty(key)) {
                var value = source[key];
                if (typeof value !== 'object' || !value) {
                    result[key] = value;
                }
                else {
                    if (!target[key]) {
                        result[key] = value;
                    }
                    else {
                        result[key] = deepMerge(target[key], value);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Require dependencies while injects specified stubs.
     * @param {[]} deps Dependencies
     * @param {object} stubs Stubs `{ "moduleA": stubA }`. Can be null, undefined, or empty object.
     * In that case the deps will still be reloaded.
     * @param {function} callback The callback function.
     * @param {function} [errback] The error back function.
     * @returns {Function|*}
     */
    function stubRequire(deps, stubs, callback, errback) {
        if (!Array.isArray(deps)) {
            throw new Error("Dependencies must be an array.");
        }

        var require = umd.globalRequire;
        if (typeof require === "undefined" || require === umd.require) {
            // browser global
            contextCount++;
            var stubContext = 'stub' + contextCount;

            var paths = contexts.default.config.paths;
            var normalizedStubs = {};
            for (var key in stubs) {
                if (stubs.hasOwnProperty(key)) {
                    normalizedStubs[convertToBrowserGlobalIdentifier(key, paths)] = stubs[key];
                }
            }

            var context = contexts[stubContext] = new Context({
                stubs: normalizedStubs,
                paths: paths
            });

            // Optimize to skip module referencing if they are already referenced before.
            context.modules = deepMerge(contexts.default.modules);

            context.setReloadTargets(deps.map(function(dep) {
                return convertToBrowserGlobalIdentifier(dep, paths);
            }));

            context.require(deps, callback, errback);
        }
        else if (require.defined) {
            // require.js
            var map = {};
            var hasStubs = false;
            for (var key in stubs) {
                if (stubs.hasOwnProperty(key)) {
                    hasStubs = true;
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

            if (hasStubs) {
                contextCount++;
                var contextName = "context_" + contextCount;
                var _config = require.s.contexts._.config;
                var config = {
                    context: contextName,
                    baseUrl: _config.baseUrl,
                    paths: _config.paths,
                    pkgs: _config.pkgs,
                    shim: _config.shim
                };

                if (hasStubs) {
                    config.map = {
                        "*": map
                    };
                }

                var result = require.config(config);

                var parentDefined = require.s.contexts._.defined;
                for (var m in parentDefined) {
                    if (parentDefined.hasOwnProperty(m) && !map[m] && deps.indexOf(m) === -1) {
                        require.s.contexts[contextName].defined[m] = parentDefined[m];
                    }
                }

                result(deps, callback, errback);
            }
            else {
                // There are no stubs. Remove cache and reload the modules in deps.
                for (var dep in deps) {
                    require.undef(deps[dep]);
                }

                require(deps, callback, errback);
            }
        }
        else {
            // node
            throw new Error("stubRequire not implemented for node.js yet.");
        }
    }

    function Context(config) {
        this.reloadTargets = [];
        this.modules = {};
        this.config = deepMerge({paths: {}}, config);

        var self = this;

        function resolveChain(moduleNames, results) {
            if (moduleNames.length === 0) {
                return;
            }

            var moduleName = moduleNames.shift();
            self.resolveModule(moduleName, function(result) {
                results.push(result);
                resolveChain(moduleNames, results);
            });
        }

        /**
         * A simple stub for requireJS and commonJS require function.
         * This is use to support universal module definition (umd) for browser globals code.
         * @param {string|string[]} moduleName Name of the module.
         * @param {function} [callback] Function to call after resolving the module.
         * @param {function} [errback] Error back function.
         * @returns {*} The target module if found; otherwise, undefined.
         */
        this.require = function require(moduleName, callback, errback) {
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

                    var results = [];
                    resolveChain(moduleName, results);

                    if (results && callback) {
                        callback.apply(this, results);
                    }
                }
                else {
                    return self.resolveModule(moduleName, callback, errback);
                }
            }
            catch (error) {
                if (errback) {
                    errback(error);
                }

                throw error;
            }
        };
        /**
         * Config require similar to requireJS.
         * @param {object} option Config option.
         * @param {string} [option.context] Context name. If not specified, it modifies the default context.
         * @param {object} [option.paths] Mapping for module name. ".": "sampleModules/umd", "func": "sampleModules/umd/defineFunction"
         * see _umd.require.config.js for detail.
         * @returns {*}
         */
        this.require.config = function requireConfig(option) {
            option = option || {};
            var context = contexts.default;
            if (option.context) {
                context = contexts[option.context];
                if (!context) {
                    context = contexts[option.context] = new Context(option);
                }
                else {
                    context.updateConfig(option);
                }
            }
            else {
                context.updateConfig(option);
            }

            return context.require;
        };
        this.createDefine = function createDefine(browserGlobalIdentifier, paths) {
            return function browserGlobalDefine(definition) {
                var module = {exports: {}};
                var result;
                if (typeof definition === "object") {
                    result = definition;
                }
                else {
                    var localRequire = (paths) ? wrapRequire(self.require, paths) : self.require;
                    result = definition(localRequire, module.exports, module);
                    result = (typeof result !== 'undefined') ? result : module.exports;
                }

                if (browserGlobalIdentifier) {
                    definitions[browserGlobalIdentifier] = definition;

                    if (self.reloadTargets.indexOf(browserGlobalIdentifier) === -1) {
                        var terms = browserGlobalIdentifier.split(/[.\/]/);
                        var id = terms.pop();
                        var base = umd.ns(terms.join("."));
                        base[id] = result;
                    }

                    self.modules[browserGlobalIdentifier] = result;
                }
            };
        };

    }

    Context.prototype.updateConfig = function updateConfig(config) {
        this.config = deepMerge(this.config, config);
    };

    Context.prototype.setReloadTargets = function setReloadTargets(deps) {
        this.reloadTargets = deps;
    };

    Context.prototype.resolveModule = function resolveModule(moduleName, callback, errback) {
        var stubs = this.config.stubs || {};
        var mapping = this.config.mapping || {};
        var paths = this.config.paths || {};

        var id = convertToBrowserGlobalIdentifier(moduleName, paths);

        if (stubs[id]) {
            if (callback) {
                callback(stubs[id]);
            }
            return stubs[id];
        }

        if (this.reloadTargets.indexOf(id) !== -1) {

            var definition = definitions[id];
            if (definition) {
                this.createDefine(id)(definition);
            }
        }

        if (this.modules[id]) {
            if (callback) {
                callback(this.modules[id]);
            }
            return this.modules[id];
        }

        moduleName = mapping[moduleName] || moduleName;

        var parts = moduleName.split('!', 2);
        var arg = undefined;
        if (parts.length == 2) {
            moduleName = parts[0];
            if (parts[1]) {
                arg = parts[1];
            }
        }

        var names = moduleName.split("/");
        var name = names.shift();

        if (paths[name]) {
            var subNames = paths[name].split("/");
            names = subNames.concat(names);
            name = names.shift();
        }

        var module = root[name];
        while (module && names.length) {
            name = names.shift();
            module = module[name];
        }

        if (parts.length == 2 && module && typeof module.load === "function") {
            // invoke callback when module is loaded.
            var onLoad = callback || function(value) {  module = value; };
            onLoad.error = errback || function() {};

            module.load(arg, this.require, onLoad, this.config);
        }

        if (callback) {
            callback(module);
        }

        return module;
    };

    contexts.default = new Context();

    // ********** PUBLIC API ************

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
     * @param {{nodeJS: {}, requireJS: {}, browserGlobal: {}}} [paths] Optional config paths fo the require identifiers
     * are different in different environments.
     */
    var umd = function(factory, browserGlobalIdentifier, require, exports, module, paths) {
        if (umd.isRequireJS()) {
            var localDefine = (paths && paths.requireJS) ?
                              wrapDefine(define, require, paths.requireJS) : define;
            factory(localDefine);
        }
        else if (umd.isNodeJS()) {
            // Node (not CommonJS because module.exports does not conform)
            factory(function(definition) {
                var localRequire = (paths && paths.nodeJS) ? wrapRequire(require, paths.nodeJS) : require;

                var result = (typeof definition === "object") ? definition : definition(localRequire, exports, module);

                if (typeof result !== "undefined") {
                    module.exports = result;
                }
            });
        }
        else {
            // browser global.
            if (paths && paths.browserGlobal) {
                factory(umd.createDefine(browserGlobalIdentifier, paths.browserGlobal));
            }
            else {
                factory(umd.createDefine(browserGlobalIdentifier));
            }
        }
    };

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

    umd.stubRequire = stubRequire;
    // require === func meaning it is node environment
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