define(["require","sampleModules/umd/defineFunction","sampleModules.umdv.defineFunction","./exportsObject"],function(e){var t=e("sampleModules/umd/defineFunction"),n=e("sampleModules.umdv.defineFunction"),r=e("./exportsObject");return function(){return t()+" "+n()+" "+r.value}});