/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/21/14.
 * r.js build config
 */

//noinspection BadExpressionStatementJS
({
    name: "umdTestModule",
    out: "umdTestModule.min.js",
    onBuildRead: function (moduleName, path, contents) {
        "use strict";
        //console.log(moduleName);
        //console.log(path);
        //console.log(contents);
        //var umdIndex = contents.indexOf(/umd\(/);

        var newContents = contents.split("\n").splice(5).join("\n");
        var index = newContents.lastIndexOf("}");
        newContents = newContents.slice(0, index);
        console.log(newContents);
        return newContents;
    }
})