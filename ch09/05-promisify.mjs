// wait for ms milliseconds
import { promisify } from 'util';


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


// convert callback function to a Promise
const pWait = promisify(wait);


// call wait
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
