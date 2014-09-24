///*
// * Copyright(c) 2014, Unional (https://github.com/unional)
// * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
// * Created by unional on 9/20/14.
// */
//var verboseModule = require('../sampleModules/umdv/returnObject');
//console.log(verboseModule);
//
//require('../umd');
//var assert = require('assert');
//
//assert.equal(verboseModule.value, "umdv.returnObject value", "Fail to load sampleModules.umdv.returnObject");
//
//var umdTestModule = require('../sampleModules/umd/returnObject');
//
//console.log(umdTestModule);
//
//assert.deepEqual(umdTestModule, {value: "umd.returnObject value"}, "Fail to load sampleModules.umd.returnObject");
//
//var thing = {someProp: "thing's value"};
//
//umd.stubRequire(['theThing'], {
//    "theThing": thing
//}, function(actual) {
//    assert.deepEqual(actual, thing);
//});