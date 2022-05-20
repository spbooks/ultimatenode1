// worker thread
import { workerData, parentPort } from 'worker_threads';
import { diceRun } from './lib/dice.js';

// start calculation
const stat = diceRun( workerData.runs, workerData.numberOfDice );

// post message to parent script
parentPort.postMessage( stat );
