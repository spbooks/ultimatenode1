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


// run in series (top-level await)
try {

  const p1 = await pWait(100);
  console.log(`waited ${ p1 }ms`);

  const p2 = await pWait(p1 + 100);
  console.log(`waited ${ p2 }ms`);

  const p3 = await pWait(p2 + 100);
  console.log(`waited ${ p3 }ms`);

}
catch(err) {
  console.log(err);
}


// run in series (async IIFE)
(async () => {

  try {

    const p1 = await pWait(100);
    console.log(`waited ${ p1 }ms`);

    const p2 = await pWait(p1 + 100);
    console.log(`waited ${ p2 }ms`);

    const p3 = await pWait(p2 + 100);
    console.log(`waited ${ p3 }ms`);

  }
  catch(err) {
    console.log(err);
  }

})();
