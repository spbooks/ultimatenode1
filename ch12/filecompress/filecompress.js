#!/usr/bin/env node
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { getFileInfo } from './lib/fileinfo.js';

// check files
let
  input = path.resolve(process.argv[2] || ''),
  output = path.resolve(process.argv[3] || ''),
  [ inputInfo, outputInfo ] = await Promise.all([ getFileInfo(input), getFileInfo(output) ]),
  error = [];

// use input file name when output is a directory
if (outputInfo.isDir && outputInfo.canWrite && inputInfo.isFile) {
  output = path.resolve(output, path.basename(input));
}

// check for errors
if (!inputInfo.isFile || !inputInfo.canRead) error.push(`cannot read input file ${ input }`);
if (input === output) error.push('input and output files cannot be the same');

if (error.length) {

  console.log('Usage: ./filecompress.js [input file] [output file|dir]');
  console.error('\n  ' + error.join('\n  '));
  process.exit(1);

}

// read file
console.log(`processing ${ input }`);
let content;

try {
  content = await readFile(input, { encoding: 'utf8' });
}
catch (e) {
  console.log(e);
  process.exit(1);
}

let lengthOrig = content.length;
console.log(`file size  ${ lengthOrig }`);

// compress content
content = content
  .replace(/\n\s+/g, '\n')                // trim leading space from lines
  .replace(/\/\/.*?\n/g, '')              // remove inline // comments
  .replace(/\s+/g, ' ')                   // remove whitespace
  .replace(/\/\*.*?\*\//g, '')            // remove /* comments */
  .replace(/<!--.*?-->/g, '')             // remove <!-- comments -->
  .replace(/\s*([<>(){}}[\]])\s*/g, '$1') // remove space around brackets
  .trim();

let lengthNew = content.length;

// write file
console.log(`outputting ${output}`);
console.log(`file size  ${ lengthNew } - saved ${ Math.round((lengthOrig - lengthNew) / lengthOrig * 100) }%`);

try {
  content = await writeFile(output, content);
}
catch (e) {
  console.log(e);
  process.exit(1);
}
