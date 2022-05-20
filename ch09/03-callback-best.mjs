// wait for ms milliseconds
function wait(ms, callback) {

  ms = parseFloat(ms);

  // invalid ms value?
  if (!ms || ms < 1 || ms > 3000) {

    const err = new RangeError('Invalid ms value');
    setImmediate( callback, err, ms );
    return;

  }

  // wait ms before callback
  setTimeout( callback, ms, null, ms );

}


// call wait
wait(0, (err, ms) => {

  if (err) console.log(err);
  else console.log(`waited ${ ms }ms`);

});
