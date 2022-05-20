// emits a 'tick' event every interval
import EventEmitter from 'events';
import { setInterval, clearInterval } from 'timers';

export default class extends EventEmitter {

  constructor(delay) {
    super();
    this.start(delay);
  }

  start(delay) {

    if (!delay || delay == this.delay) return;

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.delay = delay;

    // start timer
    this.interval = setInterval(() => {

      // raise event
      this.emit('tick', {
        delay:  this.delay,
        time:   performance.now()
      });

    }, this.delay);

  }

}
