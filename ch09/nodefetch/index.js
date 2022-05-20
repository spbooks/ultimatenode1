#!/usr/bin/env node

// fetches three random questions from the Open Trivia Database: https://opentdb.com/

import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

const
  quizAPI   = 'https://opentdb.com/api.php?type=multiple&amount=1&category=',
  category  = [9, 18, 30],
  outfile   = './questions.json';

// fetch question in all categories (multiple asynchronous Promises)
const qRes = await Promise.allSettled(

  category.map( c => fetch(quizAPI + c) )

);

// convert JSON to object (multiple asynchronous Promises)
const qObj = await Promise.allSettled(

  qRes
    .filter( q => q && q.status == 'fulfilled' && q.value )
    .map( q => q.value.json() )

);

// get first result and filter failures
const qData = qObj
  .filter ( q => q && q.status == 'fulfilled' && q.value && q.value.results && q.value.results[0] )
  .map( q => q.value.results[0] );

console.log(`fetched ${ qData.length } valid quiz questions:`);

try {

  await writeFile(outfile, JSON.stringify(qData, null, 2));
  console.log(`${ outfile } saved`);

}
catch(err) {

  console.log(`${ outfile } not saved:\n`, err);

}
