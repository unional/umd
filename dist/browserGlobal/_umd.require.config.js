/*
 * Copyright(c) 2014, Unional (https://github.com/unional)
 * @license Licensed under the MIT License (https://github.com/unional/umd/LICENSE)).
 * Created by unional on 9/27/14.
 *
 * Use this file to configure umd config for browser global environment.
 * It is named "_umd.require.config.js" because the "_" will make it run ahead of other files during test.
 */
umd.require.config({
    "paths": {
        "shortName": "myLongNamespaceComponentName",
        "myModule": "MyModule", // Supports different capitalization
        "shortPath": "myLong.longPath",
        "shortName2": "myLong.longPath.module"
    }
});