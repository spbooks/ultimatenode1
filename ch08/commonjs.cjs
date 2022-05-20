// CommonJS importing ESM
// THIS WILL FAIL!
const lib = require('./lib/lib.mjs');

console.log( lib.sum(1, 2, 3, 4) );
console.log( lib.mult(1, 2, 3, 4) );
