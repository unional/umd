/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/20/14.
 */
require('../umd');
var assert = require('assert');

var umdTestModule = require('./umdTestModule');
console.log(umdTestModule);

assert.deepEqual(umdTestModule, { value: "umd test module value"}, "Fail to load umdTestModule");
