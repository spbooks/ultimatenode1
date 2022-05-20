// CommonJS lib.cjs
const PI = 3.1415926;

// add values
function sum(...args) {
  log('sum', args);
  return args.reduce((num, tot) => tot + num);
}

// multiply values
function mult(...args) {
  log('mult', args);
  return args.reduce((num, tot) => tot * num);
}

// private logging function
function log(...msg) {
  console.log(...msg);
}

module.exports = { PI, sum, mult };
