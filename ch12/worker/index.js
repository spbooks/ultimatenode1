// worker thread demonstration
import { Worker } from 'worker_threads';
import { diceRun } from './lib/dice.js';

// throw 2 dice 1 billion times
const
  numberOfDice = 2,
  runs = 999_999_999;

// run process every second
const timer = setInterval(() => {
  console.log('  another process');
}, 1000);


// start after 3 seconds
setTimeout(() => {

  // ________________________________________________________
  // throw dice (no worker)
  console.log('\u001b[36;1mNO THREAD CALCULATION STARTED...\u001b[0m');

  performance.mark('nothread:start');
  const stat1 = diceRun(runs, numberOfDice);
  performance.mark('nothread:end');
  console.table( stat1 );

  console.log('\u001b[36;1mNO THREAD CALCULATION COMPLETE\u001b[0m\n');


  // ________________________________________________________
  // throw dice with a worker
  console.log('\u001b[36;1mWORKER THEAD CALCULATION STARTED...\u001b[0m');

  performance.mark('threaded:start');
  const worker = new Worker('./worker.js', { workerData: { runs, numberOfDice } });

  // result returned
  worker.on('message', result => {
    console.table(result);
  });

  // worker error
  worker.on('error', e => {
    console.log(e);
  });

  // worker complete
  worker.on('exit', code => {

    clearInterval(timer);

    console.log('\u001b[36;1mWORKER THEAD CALCULATION COMPLETE\u001b[0m\n');
    console.log(`Worker thread exited with code ${ code }`);

    // output performance statistics
    performance.mark('threaded:end');
    performance.measure('nothread', 'nothread:start', 'nothread:end');
    performance.measure('threaded', 'threaded:start', 'threaded:end');

    performance.getEntriesByType('measure')
      .forEach(m => console.log(`${ m.name }: ${ Math.round(m.duration) }ms`));

  });

}, 3500);
