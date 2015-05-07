/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/21/14.
 */

(function(e){e(["require","sampleModules/umdv/defineFunction","sampleModules/umd/defineFunction"],function(e){var t=e("sampleModules/umdv/defineFunction"),n=e("sampleModules/umd/defineFunction");return function(){return t()+" "+n()}})})(function(){return typeof define=="function"&&define.amd?define:typeof require=="function"&&typeof exports=="object"&&typeof module=="object"?function(e){var t=e(require,exports,module);typeof t!="undefined"&&(module.exports=t)}:umd.createDefine("sampleModules.umdv.defineFunctionWithDep")}());