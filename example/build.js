/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/21/14.
 * r.js build config
 */

//noinspection BadExpressionStatementJS
({
    appDir: "../node_modules/sampleModules",
    baseUrl: ".",
    dir: "out",
    onBuildRead: function (moduleName, path, contents) {
        "use strict";
        var umdIndex = regexIndexOf.call(contents, /umd\s?\(/);
        if (umdIndex === -1) {
            return contents;
        }
        var defineIndex = regexIndexOf.call(contents, /define\s?\(/);
        var firstBracketIndex = contents.indexOf("{", defineIndex);
        var endBracketIndex = firstBracketIndex;
        var bracketCount = 1;
        for (var i = firstBracketIndex; i < contents.length; i++) {
            if (contents[i] == '{') {
                bracketCount++;
            }
            else if (contents[i] == '}') {
                bracketCount--;
            }

            if (bracketCount === 0) {
                endBracketIndex = i;
                break;
            }
        }
        return contents.slice(defineIndex, endBracketIndex);

        function regexIndexOf(regex, startpos) {
            var indexOf = this.substring(startpos || 0).search(regex);
            return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
        }
    }
})