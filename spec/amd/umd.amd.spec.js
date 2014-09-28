/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by hwong on 9/20/14.
 */
define(function(require) {
    "use strict";
    require('umd');
    var when = require('when');

    //noinspection JSUnresolvedVariable
    window.umdTest = {
        test: {
            something: {someProp: "someValue"},
            someFunc: function(value) {
                return value || "defaultValue"
            }
        }
    };

    describe("require() umd modules", function() {
        it("should get returnObject", function() {
            var actual = require('sampleModules/umd/returnObject');
            actual.should.eql({value: "umd.returnObject value"});

            actual = require('sampleModules/umdv/returnObject');
            actual.should.eql({value: "umdv.returnObject value"});
        });

        it("should get defineObject", function() {
            var actual = require('sampleModules/umd/defineObject');
            actual.should.eql({value: "umd.defineObject value"});

            actual = require('sampleModules/umdv/defineObject');
            actual.should.eql({value: "umdv.defineObject value"});
        });

        it("should get exportsObject", function() {
            var actual = require('sampleModules/umd/exportsObject');
            actual.should.eql({value: "umd.exportsObject value"});

            actual = require('sampleModules/umdv/exportsObject');
            actual.should.eql({value: "umdv.exportsObject value"});
        });

        it("should get moduleExportsObject", function() {
            var actual = require('sampleModules/umd/moduleExportsObject');
            actual.should.eql({value: "umd.moduleExportsObject value"});

            actual = require('sampleModules/umdv/moduleExportsObject');
            actual.should.eql({value: "umdv.moduleExportsObject value"});
        });

        it("should get defineFunction", function() {
            var actual = require('sampleModules/umd/defineFunction');
            actual().should.equal("Invoking umd.defineFunction");

            actual = require('sampleModules/umdv/defineFunction');
            actual().should.equal("Invoking umdv.defineFunction");
        });

        it("should get defineFunctionWithDep", function() {
            var actual = require('sampleModules/umd/defineFunctionWithDep');
            actual().should.equal("Invoking umd.defineFunction Invoking umdv.defineFunction");

            actual = require('sampleModules/umdv/defineFunctionWithDep');
            actual().should.equal("Invoking umdv.defineFunction Invoking umd.defineFunction");
        });
    });

    describe("umd.require([], func)", function() {
        it("should invoke callback with the resolved module", function(done) {
            require(["sampleModules/umd/defineObject"], function(actual) {
                actual.should.exist;
                actual.value.should.equal("umd.defineObject value");
                done();
            });
        });
    });

    describe("umd.require() plugin syntax", function() {

        it("should ignore ! syntax if the module does not implement plugin api.", function() {
            var actual = umd.require("umdTest/test/someFunc!");
            actual.should.equal(umdTest.test.someFunc);
        });

        it("should invoke the reference with ! syntax", function() {
            var actual = require("sampleModules/umd/simplePlugin!test");
            actual.should.equal("processed test");
        });

        it("should invoke callback with ! syntax", function() {
            require(["sampleModules/umd/simplePlugin!test"], function(actual) {
                actual.should.equal("processed test");
            });
        });
    });

    describe("umd.require() global reference", function() {

        it("should dereference with / notation", function() {
            var actual = umd.require("umdTest/test/something");
            actual.should.equal(umdTest.test.something);
        });

        it("should return undefined if for invalid reference", function() {
            var actual = umd.require("SomethingNotExist");
            expect(actual).to.be.undefined;

            actual = umd.require("umdTest/test/NotExist");
            expect(actual).to.be.undefined;
        });
    });

    describe("umd.require() with mapping", function() {
        it("should resolve all references correctly", function() {
            var actual = require('sampleModules/umd/withMapping');
            actual().should.equal("Invoking umd.defineFunction Invoking umdv.defineFunction umd.exportsObject value");
        });

        it("should resolve all references correctly twice", function() {
            var actual = require('sampleModules/umd/withMapping2');
            actual().should.equal("Invoking umdv.defineFunction Invoking umd.defineFunction umd.returnObject value");
        });
    });

    describe("umd.stubRequire()", function() {
        it("should throw error if deps is not array", function() {
            umd.stubRequire.bind(this, {}).should.throw();
        });

        it("should stub according to stub input", function(done) {
            var actual = umd.require("theThing");
            expect(actual).equal(undefined);

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

        it("should not affect original require calls (before stub finishes)", function(done) {
            var original = require('sampleModules/umd/returnObject');
            original.should.eql({value: "umd.returnObject value"});

            umd.stubRequire(['sampleModules/umd/returnObject'], {
                'sampleModules/umd/returnObject': {value: "fake"}
            }, function(actual) {
                actual.should.eql({value: "fake"});

                original = require('sampleModules/umd/returnObject');
                original.should.eql({value: "umd.returnObject value"});
                done();
            });
        });

        it("should not affect original require calls (after stub finishes)", function(done) {
            var original = require('sampleModules/umd/returnObject');
            original.should.eql({value: "umd.returnObject value"});

            var d = when.defer();
            umd.stubRequire(['sampleModules/umd/returnObject'], {
                'sampleModules/umd/returnObject': {value: "fake"}
            }, function(actual) {
                actual.should.eql({value: "fake"});
                d.resolve();
            });

            d.promise.done(function() {
                original = require('sampleModules/umd/returnObject');
                original.should.eql({value: "umd.returnObject value"});
                done();
            });
        });

        it("should not affect original require calls  with dependencies (before stub finishes)", function(done) {
            var original = require('sampleModules/umd/defineFunctionWithDep');
            original.should.be.ok;

            umd.stubRequire(['sampleModules/umd/defineFunctionWithDep'], {
                'sampleModules/umd/defineFunction': function() {
                    return "fake"
                }
            }, function(actual) {
                actual.should.be.ok;

                actual().should.equal("fake Invoking umdv.defineFunction");
                done();
            });
        });

        it("should not affect original require calls  with dependencies (after stub finishes)", function(done) {
            var original = require('sampleModules/umd/defineFunctionWithDep');
            original.should.be.ok;

            var d = when.defer();
            umd.stubRequire(['sampleModules/umd/defineFunctionWithDep'], {
                'sampleModules/umd/defineFunction': function() {
                    return "fake"
                }
            }, function(actual) {
                actual.should.be.ok;

                actual().should.equal("fake Invoking umdv.defineFunction");
                d.resolve();
            });

            d.promise.done(function() {
                original = require('sampleModules/umd/defineFunctionWithDep');
                original().should.equal("Invoking umd.defineFunction Invoking umdv.defineFunction");
                done();
            });
        });

        it("should reload dependencies if stubs is empty", function(done) {
            var original = require('sampleModules/umd/withSecret');
            umd.stubRequire(['sampleModules/umd/withSecret'], {}, function(actual) {
                actual().should.not.equal(original());
                done();
            });
        });

        it("should reload dependencies if stubs is null", function(done) {
            var original = require('sampleModules/umd/withSecret');

            umd.stubRequire(['sampleModules/umd/withSecret'], null, function(actual) {
                actual().should.not.equal(original());
                done();
            });
        });

        it("should reload dependencies if stubs is undefined", function(done) {
            var original = require('sampleModules/umd/withSecret');

            umd.stubRequire(['sampleModules/umd/withSecret'], undefined, function(actual) {
                actual().should.not.equal(original());
                done();
            });
        });

        it("should reload dependencies if stubs is omitted.", function(done) {
            var original = require('sampleModules/umd/withSecret');

            umd.stubRequire(['sampleModules/umd/withSecret'], function(actual) {
                actual().should.not.equal(original());
                done();
            });
        });
    });

    describe("umd.ns()", function() {
        it("should return undefined if param is empty.", function() {
            var actual = umd.ns();
            expect(actual).to.be.undefined;
        });

        it("should create single level namespace.", function() {
            var actual = umd.ns("TestNamespace");
            expect(actual).to.exist;
            actual.should.equal(TestNamespace);
        });

        it("should create nested namespace.", function() {
            var actual = umd.ns("TestNS.Blah.Doh");
            expect(TestNS.Blah.Doh).to.exist
            actual.should.equal(TestNS.Blah.Doh);
        });

        it("should create nested namespace with / notation.", function() {
            var actual = umd.ns("TestN2/Ball/boo");
            //noinspection JSUnresolvedVariable
            expect(TestN2.Ball.boo).to.exist;

            //noinspection JSUnresolvedVariable
            expect(actual).equal(TestN2.Ball.boo);
        });

        it("should create multiple namespaces.", function() {
            var actual = umd.ns("TestA.B", "TestB.C", "TestC.D.E");
            expect(TestA.B).to.exist;
            expect(TestB.C).to.exist;
            expect(TestC.D.E).to.exist;
            expect(actual).equal(TestC.D.E);
        });
    });

    describe("umd.namespace()", function() {
        it("should return undefined if param is empty.", function() {
            var actual = umd.namespace();
            expect(actual).equal(undefined);
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
        it("should allow environment still be determined as amd", function() {
            (typeof define === "function" && define.amd).should.be.ok;

            (typeof require === "function" &&
             typeof exports === "object" &&
             typeof module === "object").should.be.false;
        });
    });
});