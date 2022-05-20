// encode and decodes numeric database IDs to shorter names
const
  decodeChars = '2346789acdefghkmnpqrtvwxy', // valid URL path characters
  base = decodeChars.length,
  numOffset = base ** 2,
  numMult = 7,
  encodeMap = {},
  decodeMap = {};

// create maps
decodeChars.split('').map((d, i) => {
  const e = i.toString(base);
  encodeMap[e] = d;
  decodeMap[d] = e;
});

// encode a number to a GUID string
export function encode(num) {

  return charConvert( (num * numMult + numOffset).toString(base), encodeMap );

}


// decode a GUID string to a number
export function decode(code) {

  const codeConv = charConvert( code.toLowerCase(), decodeMap );
  if (code.length !== codeConv.length) return null;

  const codeNum = parseInt(codeConv, base);
  if (isNaN(codeNum)) return null;

  const num = ( codeNum - numOffset ) / numMult;
  return num === Math.floor(num) ? num : null;

}


// clean a string to alphanumerics only
export function clean(str, length = 10) {

  return str
    .trim()
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, length);

}


// convert between character sets
function charConvert(str, charSet) {

  return str
    .split('')
    .reverse()
    .map(c => charSet[c] || '')
    .join('');

}
