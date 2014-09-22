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

## Test

	npm test

## License
MIT