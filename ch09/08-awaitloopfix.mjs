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

const ms = [100, 200, 300];
let totalWait = 0;

for (let i = 0; i < ms.length; i++) {

  console.log( ms[i] );
  const w = await pWait( ms[i] );
  console.log(`waited ${ w }ms`);
  totalWait += w;

}

console.log(`total wait time: ${ totalWait }ms`);
