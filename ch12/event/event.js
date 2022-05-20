// create a ticker
import Ticker from './lib/ticker.js';

// trigger a new event every second
const ticker = new Ticker(1000);

// add handler
ticker.on('tick', e => {
  console.log('handler 1 tick!', e);
});

// add handler
ticker.on('tick', e => {
  console.log('handler 2 tick!', e);
});

// add handler
ticker.once('tick', e => {
  console.log('handler 3 tick!', e);
});

// show number of listeners
console.log(`listeners: ${ ticker.listenerCount('tick') }`);
