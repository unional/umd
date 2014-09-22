/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by hwong on 9/20/14.
 */
define(function(require) {
    "use strict";
    require('umd');
    describe("umd.require", function() {
        "use strict";
        umd.test = {
            something: {someProp: "someValue"},
            someFunc: function(value) {
                return value || "defaultValue"
            }
        };

        it("should dereference with . notation", function() {
            var actual = umd.require("umd.test");
            expect(actual).toEqual(umd.test);

            actual = umd.require("umd.test.someFunc");
            expect(actual).toEqual(umd.test.someFunc);
        });

        it("should dereference with / notation", function() {
            var actual = umd.require("umd/test/something");
            expect(actual).toEqual(umd.test.something);
        });

        it("should return undefined if for invalid reference", function() {
            var actual = umd.require("SomethingNotExist");
            expect(actual).toBeUndefined();

            actual = umd.require("umd.test.NotExist");
            expect(actual).toBeUndefined();
        });

        it("should work with shorthand references", function() {
            umd.require.config = {
                theThing: umd.test.something
            };

            var actual = umd.require("theThing");
            expect(actual).toEqual(umd.test.something);

            actual = umd.require("theThing.someProp");
            expect(actual).toEqual(umd.test.something.someProp);
        });

        it("should throw error if param is empty", function() {
            expect(umd.require).toThrow();
        });

        it("should invoke the reference with ! syntax", function() {
            var actual = umd.require("umd.test.someFunc!");
            expect(actual).toEqual("defaultValue");

            actual = umd.require("umd.test.someFunc!MyValue");
            expect(actual).toEqual("MyValue");
        });

        it("should invoke callback with the resolved module", function(done) {
            umd.require("umd.test.something", function(actual) {
                expect(actual).toEqual(umd.test.something);
                done();
            });
        });
    });

    describe("umd.ns", function() {
       it("should return undefined if param is empty.", function() {
            var actual = umd.ns();
           expect(actual).toBeUndefined();
        });

        it("should create single level namespace.", function() {
            var actual = umd.ns("TestNamespace");
            expect(TestNamespace).toBeDefined();
            expect(TestNamespace).toEqual(actual);
        });

        it("should create nested namespace.", function() {
            var actual = umd.ns("TestNS.Blah.Doh");

            expect(TestNS.Blah.Doh).toBeDefined();
            expect(TestNS.Blah.Doh === actual).toBeTruthy();
        });

        it("should create nested namespace with / notation.", function() {
            var actual = umd.ns("TestN2/Ball/boo");

            //noinspection JSUnresolvedVariable
            expect(TestN2.Ball.boo).toBeDefined();
            //noinspection JSUnresolvedVariable
            expect(TestN2.Ball.boo === actual).toBeTruthy();
        });

        it("should create multiple namespaces.", function() {
            var actual = umd.ns("TestA.B", "TestB.C", "TestC.D.E");
            expect(TestA.B).toBeDefined();
            expect(TestB.C).toBeDefined();
            expect(TestC.D.E).toBeDefined();
            expect(TestC.D.E === actual).toBeTruthy();
        });
    });
});