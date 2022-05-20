// countdown timer clock
const
  timerNode = document.getElementById('timer'),
  startClass = 'countdown',
  delayDefault = 5000;

let timer;

// show and start timer
export function startTimer( delay ) {

  if (timer) {
    stopTimer();
    clearTimeout(timer);
  }

  delay = delay || delayDefault;
  timerNode.style.setProperty('--countdown', `${ delay }ms`);
  timerNode.classList.add(startClass);
  setTimeout(stopTimer, delay);

}

// stop and hide timer
export function stopTimer() {
  timerNode.classList.remove(startClass);
}
