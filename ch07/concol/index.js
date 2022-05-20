#!/usr/bin/env node

import chalk from 'chalk';

const
  str = process.argv[2] || '',
  foreColor = process.argv[3],
  backColor = process.argv[4];

let concol = chalk;
if (backColor) concol = concol.bgHex( backColor );
if (foreColor) concol = concol.hex( foreColor );

console.log( concol.bold( str ) );
