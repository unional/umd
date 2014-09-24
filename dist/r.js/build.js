/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/21/14.
 * r.js build config
 */

//noinspection BadExpressionStatementJS
({
    onBuildRead: function (moduleName, path, contents) {
        // Add this snippet to your onBuildRead method to strip out the umd code.

        //TODO: Support "umd ("
        var umdIndex = contents.indexOf("umd(");
        if (umdIndex === -1) {
            return contents;
        }

        //TODO: Support multiple umd(...) blocks
        //TODO: Support "define ("
        var defineIndex = contents.indexOf("define(");
        var bracketIndex = contents.lastIndexOf("}");
        return contents.slice(defineIndex, bracketIndex);
    }
})