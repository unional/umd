/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/22/14.
 * umdConfig is config file for umd.require.config.
 * Each share library can define their own "shorthand" so they can reference some module
 * differently.
 * Most of the time this should be avoided so that consumer of the library don't need to
 * add the addition config to their environment (if they use browser global namespace)
 *
 * usage:
 * umd.require.config.shortHand = module;
 *
 * example:
 * // Notice it is jquery, not jQuery (which is a property exists in window (i.e. window.jQuery === window.$))
 * umd.require.config.jquery = $;
 * // In many case knockout is referenced as require('knockout') instead of window.ko
 * umd.require.config.knockout = ko;
 */
