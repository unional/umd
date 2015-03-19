/*
 * Copyright(c) 2015, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 3/18/15.
 */

when = require('when');
chai = require('chai');
chai.should();
expect = chai.expect;

//noinspection JSUnresolvedVariable
global.umdTest = {
    test: {
        something: {someProp: "someValue"},
        someFunc: function(value) {
            return value || "defaultValue"
        }
    }
};
