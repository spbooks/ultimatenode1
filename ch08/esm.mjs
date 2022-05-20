// ESM importing CommonJS
// THIS WILL WORK!
import * as lib from './lib/lib.cjs';

console.log( lib.sum(1, 2, 3, 4) );
console.log( lib.mult(1, 2, 3, 4) );
