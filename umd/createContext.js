/*
 * Copyright(c) 2015, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 3/18/15.
 */
umd(function(define) {
    define(function(require /*, exports, module */) {
        if (umd.isBrowserGlobal()) {
            umd.createContext = createBgContext();
        }
        else if (umd.isCommonJS()) {
            umd.createContext = createCommonJSContext();
        }
        else if (umd.isAmd()) {
            umd.createContext = createAmdContext();
        }

        function createAmdContext() {
            return function(deps, stubs, callback, errback) {
                if (typeof arguments[1] === "function") {
                    errback = arguments[2];
                    callback = arguments[1];
                    stubs = undefined;
                }

                if (!Array.isArray(deps)) {
                    throw new Error("Dependencies must be an array.");
                }

                var map = {};
                var hasStubs = false;
                for (key in stubs) {
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
                    for (key in deps) {
                        if (deps.hasOwnProperty(key))
                            require.undef(deps[key]);
                    }

                    require(deps, callback, errback);
                }

                return {
                    then: function(cb, eb) {

                    }
                }
            };
        }

        function createBgContext() {
            return function(deps, stubs, fn) {

            };
        }

        function createCommonJSContext() {
            return function(deps, stubs, fn) {

            };
        }

        return umd.createContext;
    });
}, "umd.createContext", require, exports, module);

