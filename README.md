# write-umd - Write Universal Module Definition modules with ease

A small libarary that help you to write umd modules. The umd pattern follows the node.js we to write code instead of the require.js. Meaning you write code like this:

	define(function(require, exports, module) {  // this line is included in boilerplate
		var module1 = require('someModule');
	});	// this line is included in boilerplace
	
instead of this:

	define(['someModule'], function(module1) {
		// ...
	});

I believe the node.js way is easier to write because you typically add dependent modules dynamically while you are writing your code. Require.js format either assume that you know what dependencies you need from the beginning, or it is harder to add dependencies later on.

## Installation

	npm install write-umd

## Usage

The easiest way is to use the included live template for phpStorm/webStorm to create the boilerplate for you.

### Node.js
At the beginning of your application, require the `write-umd` module before loading other modules written using `write-umd`. Since it does not have any dependency, you can safely require it first before anything else.

	require('write-umd');
	// require other modules
	
It will export umd as a global object, so you don't need to create any variable for it. Optionally, you can still get the instance by `var umd = require('write-umd')`, but it is not really necesary.

### Require.js
You need to load the `write-umd` module before loading other modules that uses it.

### r.js
You can add the `onBuildRead` method from the `r.js/build.js` file to your `build.js`. It will strip out the umd(...) code and make the module work just like any amd module. 

## Test

	npm test

## License
MIT