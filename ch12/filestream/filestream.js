#!/usr/bin/env node
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';
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

// compression Transform
class Compress extends Transform {

  constructor(opts) {
    super(opts);
    this.chunks = 0;
    this.lengthOrig = 0;
    this.lengthNew = 0;
  }

  _transform(chunk, encoding, callback) {

    const
      data = chunk.toString(),                  // buffer to string
      content = data
        .replace(/\n\s+/g, '\n')                // trim leading space from lines
        .replace(/\/\/.*?\n/g, '')              // remove inline // comments
        .replace(/\s+/g, ' ')                   // remove whitespace
        .replace(/\/\*.*?\*\//g, '')            // remove /* comments */
        .replace(/<!--.*?-->/g, '')             // remove <!-- comments -->
        .replace(/\s*([<>(){}}[\]])\s*/g, '$1') // remove space around brackets
        .trim();

    this.chunks++;
    this.lengthOrig += data.length;
    this.lengthNew += content.length;

    this.push( content );
    callback();

  }

}

// process stream
const
  readStream = createReadStream(input),
  writeStream = createWriteStream(output),
  compress = new Compress();

console.log(`processing ${ input }`);

readStream.pipe(compress).pipe(writeStream).on('finish', () => {

  console.log(`file size  ${ compress.lengthOrig }`);
  console.log(`output     ${ output }`);
  console.log(`chunks     ${ compress.chunks }`);
  console.log(`file size  ${ compress.lengthNew } - saved ${ Math.round((compress.lengthOrig - compress.lengthNew) / compress.lengthOrig * 100) }%`);

});
