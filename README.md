# Universal Module Definition library
`unional-umd` is a small library that enables you to write true umd modules.  The code you wrote will work as-is in all **three** environments:
* AMD (requireJS)
* CommonJS (NodeJS)
* Legacy Browser global where you load your script manually through script tags.
 
`unional-umd` has some advantage over the well known [umd pattern](https://github.com/umdjs/umd):
* You don't have to choose which pattern you need to use to write your code. It will just work as-is
* Your can reference code in brower global environment just like you are in AMD or CommonJS (i.e. `require("Your/namespace/module")`)

The easiest way to use it is writing your module like this:

	umd(function(define) {
		define(function(require, exports, module) {
			// your code here
		});
	}, "Namespace.enabled.browserGlobalPath.of.yourModule", require, exports, module);

You can also write your module in the traditional umd style and use some of the helper functions from `umd` to make it easier.

In the package, you will find live templates (for phpStorm and webStorm), and r.js build config, etc.


## Write tests once that work in all enviornments
Write your tests in umd and they will work in all enviornments.
`unional-umd` also supports stubbing dependencies through `umd.stubRequire` or `umd.createContext` which also works in requireJS and browser global environment (NodeJS will be supported in the future)

## Convert from browser global to amd/commonJS
You can use `unional-umd` to incrementally convert your application/library to use amd or commonJS. What you need to do is load `unional-umd` and convert each file one at a time. When you changed your whole application to umd, you can switch over to amd (requireJS) or commonJS (node-browserify).

# Installation

	npm install unional-umd
	bower install unional-umd

## For Node.js
At the beginning of your application, require the `unional-umd` module before loading other modules written using `write-umd`. Since it does not have any dependency, you can safely require it first before anything else.

	require('unional-umd');
	// require other modules
	
It will export umd as a global object, so you don't need to create any variable for it. Optionally, you can still get the instance by `var umd = require('unional-umd')`, but it is not really necesary.

## For Require.js
You need to load the `unional-umd` module before loading other modules that uses it.

## For r.js
The code you write would work as is.  You can additional do the following to remove the `umd(...)` wrapping code and mke it look just like other AMD modules:
* Add the `onBuildRead` method from the `sample/build.js` file to your `build.js`.

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
