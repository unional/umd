/*
 * Copyright(c) 2015, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 3/18/15.
 */
umd(function(define) {
    define(function(require) {
        describe("umd.createContext", function() {
            it("should be defined", function() {
                expect(umd.createContext).should.be.ok;
            });
            it.only("should returns a promise/A+ thenable object", function() {
                var actual = umd.createContext([], function() { return 123; });
                (typeof actual.then).should.be.equal("function");
                return actual.then(function(result) {
                    console.log("first then");
                    result.should.equal(123);
                    return "b";
                }).then(function(result) {
                    console.log("result: " + result);
                    console.log("second then");
                    //done();
                });
            });
        });
    });
}, require, exports, module);