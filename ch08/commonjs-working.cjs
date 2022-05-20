// CommonJS importing ESM
// THIS WILL WORK!
(async () => {

  const lib = await import('./lib/lib.mjs');

  console.log( lib.sum(1, 2, 3, 4) );
  console.log( lib.mult(1, 2, 3, 4) );

})();
