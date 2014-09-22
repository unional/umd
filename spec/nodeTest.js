/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/20/14.
 */
var verboseModule = require('./umdVerboseModule');
console.log(verboseModule);

require('../umd');
var assert = require('assert');

assert.equal(verboseModule.value, "umd verbose module value", "Fail to load umdVerboseModule");

var umdTestModule = require('./umdModule');

console.log(umdTestModule);

assert.deepEqual(umdTestModule, { value: "umd module value"}, "Fail to load umdTestModule");
