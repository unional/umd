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

        it("should config new context", function() {

        });
    });

    describe("umd.stubRequire()", function() {
        it("should stub according to stub input", function(done) {
            var actual = umd.require("theThing");
            expect(actual).toBeUndefined();

            var stubRequire = umd.stubRequire({
                theThing: umd.test.something,
                theProp: umd.test.something.someProp
            });

            stubRequire(['theThing', 'theProp'], function(thing, prop) {
                expect(thing).toEqual(umd.test.something);
                expect(prop).toEqual(umd.test.something.someProp);
                done();
            });
        });

        it("should stub according to stub input in browser global environment", function(done) {
            var actual = umd.require("theThing");
            expect(actual).toBeUndefined();

            // Temporary use umd.require instead of requireJS's require to mimic browser global environment.
            var requireJSRequire = umd.globalRequire;
            umd.globalRequire = umd.require;

            var stubRequire = umd.stubRequire({
                theThing: umd.test.something,
                theProp: umd.test.something.someProp
            });

            stubRequire(['theThing', 'theProp'], function(thing, prop) {
                umd.globalRequire = requireJSRequire;
                expect(thing).toEqual(umd.test.something);
                expect(prop).toEqual(umd.test.something.someProp);
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

    describe("umd", function() {
        it("should allow environment still be determined as amd", function() {
            if (typeof define === "function" && define.amd) {
                expect(
                    typeof require === "function" &&
                    typeof exports === "object" &&
                    typeof module === "object").toBe(false);
            }
        });
    })
});