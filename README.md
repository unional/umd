# Write Universal Module Definition modules with ease
Umd is a small library that enables you to write umd modules easily. It supports:

* AMD (requireJS)
* Node.js
* Browser Global with namespace support.

The easiest way to use it is writing your module like this:

	umd(function(define) {
		define(function(require, exports, module) {
			// your code here
		});
	}, "Namespace.Enabled.BrowserGlobalPath.Of.YourModule", require, exports, module);

You can also write your module in the traditional umd style and use some of the helper functions from `umd` to make it easier.

In the package, you will find live templates (for phpStorm and webStorm), and r.js build config, etc.

## Why would you use this module?
### Create modules that work in all environments
duh...

### Write tests once that work in all enviornments
Write your tests in umd and they will work in all enviornments.
`write-umd` also supports stubbing dependencies through `umd.stubRequire` which also works in requireJS and browser global environment (NodeJS will be supported in the future)

### Convert from browser global to amd/commonJS
You can use `write-umd` to incrementally convert your application/library to use amd or commonJS. What you need to do is load `write-umd` and convert each file one at a time. When you changed your whole application to umd, you can switch over to amd (requireJS) or commonJS (node-browserify).

## Installation

	npm install write-umd		

## Usage
The easiest way is to use the included live template for phpStorm/webStorm to create the boilerplate for you.

If none of your modules (including the external modules) use the `umd(...)` way to define module (i.e., using the more traditional umd `(function(define) {...}((function() {...}())))`), you don't need to follow the section below for specific usage. Just `require(...)` the module you want and they will just work.

But of course, normally shoul can just `require('write-umd')` and don't have to worry about it.

### Node.js
At the beginning of your application, require the `write-umd` module before loading other modules written using `write-umd`. Since it does not have any dependency, you can safely require it first before anything else.

	require('write-umd');
	// require other modules
	
It will export umd as a global object, so you don't need to create any variable for it. Optionally, you can still get the instance by `var umd = require('write-umd')`, but it is not really necesary.

### Require.js
You need to load the `write-umd` module before loading other modules that uses it.

### r.js
You can add the `onBuildRead` method from the `sample/build.js` file to your `build.js`. It will strip out the umd(...) code and make the module work just like any amd module. 

## Test
There are 5 set of tests in the package:

* Browser Global
* AMD (requireJS)
* AMD without umd as dependency
* Node
* Node without umd as dependency

You can run AMD test by:

	npm test

## Sample
Sample includes an r.js build config that is used to verify build result.

## AMD vs Node
I come from AMD but eventually find Node/commonJS way to write module is more natural to me. I'm referring to:

AMD

	define(['dep1', 'dep2'], function(dep1, dep2) {...} );

Node/CommonJS

	var dep1 = require('dep1'), dep2 = require('dep2');	
I believe the node.js way is easier to write because you typically add dependent modules dynamically while you are writing your code. Require.js format either assume that you know what dependencies you need from the beginning, or it is harder to add dependencies later on.

## License
MIT
