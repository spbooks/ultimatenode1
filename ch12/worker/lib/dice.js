// dice throwing
export function diceRun(runs = 1, dice = 2, sides = 6) {

  const stat = [];

  while (runs > 0) {

    let sum = 0;
    for (let d = dice; d > 0; d--) {
      sum += Math.floor( Math.random() * sides ) + 1;
    }

    stat[sum] = (stat[sum] || 0) + 1;

    runs--;
  }

  return stat;

}
