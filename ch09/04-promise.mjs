// wait for ms milliseconds
function pWait(ms) {

  ms = parseFloat(ms);

  return new Promise((resolve, reject) => {

    if (!ms || ms < 1 || ms > 3000) {
      reject( new RangeError('Invalid ms value') );
    }
    else {
      setTimeout( resolve, ms, ms );
    }

  });

}


pWait(100)
  .then(ms => {
    console.log(`waited ${ ms }ms`);
    return pWait(ms + 100);
  })
  .then(ms => {
    console.log(`waited ${ ms }ms`);
    return pWait(ms + 100);
  })
  .then(ms => {
    console.log(`waited ${ ms }ms`);
  })
  .catch(err => {
    console.log( err );
  });
