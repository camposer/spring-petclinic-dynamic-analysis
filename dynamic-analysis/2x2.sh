#!/usr/bin/env node

if (process.argv.length !== 4) {
  console.log('./2x2.sh LOG_FILE SIGNATURE_REGEX');
  console.log('LOG_FILE: Log file full path');
  console.log('SIGNATURE_REGEX: Signature regular expression');
  process.exit(-1);
}

const twoByTwo = require('./2x2.js');
const filePath = process.argv[2];
const signatureRegex = process.argv[3];

(async function () {
  const matrix = await twoByTwo.getMatrix(filePath, signatureRegex);
  printMatrix(matrix);
})();

function printMatrix(matrix) {
  console.log(matrix);
}
