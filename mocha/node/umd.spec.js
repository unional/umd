/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by hwong on 9/20/14.
 */
require('../../umd');
var Should = require('should');

//noinspection JSUnresolvedVariable
global.umdTest = {
    test: {
        something: {someProp: "someValue"},
        someFunc: function(value) {
            return value || "defaultValue"
        }
    }
};

describe("umd.require()", function() {
    it("should dereference with . notation", function() {
        var actual = umd.require("umdTest.test");
        umdTest.test.should.equal(actual);

        actual = umd.require("umdTest.test.someFunc");
        umdTest.test.someFunc.should.equal(actual);
    });

    it("should dereference with / notation", function() {
        var actual = umd.require("umdTest/test/something");
        actual.should.equal(umdTest.test.something);
    });

    it("should return undefined if for invalid reference", function() {
        var actual = umd.require("SomethingNotExist");
        Should(actual).equal(undefined);

        actual = umd.require("umdTest.test.NotExist");
        Should(actual).equal(undefined);
    });

    it("should throw error if param is empty", function() {
        umd.require.bind(null, null).should.throw();
    });

    it("should invoke the reference with ! syntax", function() {
        var actual = umd.require("umdTest.test.someFunc!");
        actual.should.equal("defaultValue");

        actual = umd.require("umdTest.test.someFunc!MyValue");
        actual.should.equal("MyValue");
    });

    it("should invoke callback with the resolved module", function(done) {
        umd.require("umdTest.test.something", function(actual) {
            actual.should.equal(umdTest.test.something);
            done();
        });
    });
});

describe("umd.stubRequire()", function() {
    it("should throw error if deps is not array", function() {
        umd.stubRequire.bind(this, {}).should.throw();
    });

    it("should stub according to stub input", function(done) {
        var actual = umd.require("theThing");
        Should(actual).equal(undefined);

        umd.stubRequire(
            ['theThing', 'theProp'],
            {
                theThing: umdTest.test.something,
                theProp: umdTest.test.something.someProp
            },
            function(thing, prop) {
                thing.should.equal(umdTest.test.something);
                prop.should.equal(umdTest.test.something.someProp);
                done();
            });
    });
});

describe("umd.ns()", function() {
    it("should return undefined if param is empty.", function() {
        var actual = umd.ns();
        Should(actual).equal(undefined);
    });

    it("should create single level namespace.", function() {
        var actual = umd.ns("TestNamespace");
        Should(actual).not.equal(undefined);
        actual.should.equal(TestNamespace);
    });

    it("should create nested namespace.", function() {
        var actual = umd.ns("TestNS.Blah.Doh");
        Should(TestNS.Blah.Doh).not.equal(undefined);
        actual.should.equal(TestNS.Blah.Doh);
    });

    it("should create nested namespace with / notation.", function() {
        var actual = umd.ns("TestN2/Ball/boo");
        //noinspection JSUnresolvedVariable
        Should(TestN2.Ball.boo).not.equal(undefined);

        //noinspection JSUnresolvedVariable
        Should(actual).equal(TestN2.Ball.boo);
    });

    it("should create multiple namespaces.", function() {
        var actual = umd.ns("TestA.B", "TestB.C", "TestC.D.E");
        Should(TestA.B).not.equal(undefined);
        Should(TestB.C).not.equal(undefined);
        Should(TestC.D.E).not.equal(undefined);
        Should(actual).equal(TestC.D.E);
    });
});

describe("umd.namespace()", function() {
    it("should return undefined if param is empty.", function() {
        var actual = umd.namespace();
        Should(actual).equal(undefined);
    });

    it("should create single level namespace.", function() {
        var actual = umd.namespace("TestNamespace");
        TestNamespace.should.be.ok;
        actual.should.equal(TestNamespace);
    });

    it("should create nested namespace.", function() {
        var actual = umd.namespace("TestNS.Blah.Doh");

        TestNS.Blah.Doh.should.be.ok;
        actual.should.equal(TestNS.Blah.Doh);
    });

    it("should create nested namespace with / notation.", function() {
        var actual = umd.namespace("TestN2/Ball/boo");

        //noinspection JSUnresolvedVariable
        TestN2.Ball.boo.should.be.ok;
        //noinspection JSUnresolvedVariable
        actual.should.equal(TestN2.Ball.boo);
    });

    it("should create multiple namespaces.", function() {
        var actual = umd.namespace("TestA.B", "TestB.C", "TestC.D.E");
        TestA.B.should.be.ok;
        TestB.C.should.be.ok;
        TestC.D.E.should.be.ok;
        actual.should.equal(TestC.D.E);
    });
});

describe("umd", function() {
    it("should allow environment still be determined as node", function() {
        (typeof require === "function" &&
         typeof exports === "object" &&
         typeof module === "object").should.be.true;

        (typeof define === "function" && define.amd).should.be.false;
    });
});