/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/21/14.
 * r.js build config
 */

//noinspection BadExpressionStatementJS
({
    appDir: "../sampleModules",
    baseUrl: ".",
    dir: "out",
    onBuildRead: function (moduleName, path, contents) {
        "use strict";
        var umdIndex = contents.indexOf("umd(");
        if (umdIndex === -1) {
            return contents;
        }

        var defineIndex = contents.indexOf("define(");
        var bracketIndex = contents.lastIndexOf("}");
        //console.log("DefineIndex: "+ defineIndex);
        //console.log("BracketIndex: " + bracketIndex);
        return contents.slice(defineIndex, bracketIndex);
    }
})