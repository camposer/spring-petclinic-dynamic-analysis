#!/usr/bin/env node

if (process.argv.length !== 4) {
  console.log('./2x2.sh LOG_FILE SIGNATURE_REGEX');
  console.log('LOG_FILE: Log file full path');
  console.log('SIGNATURE_REGEX: Signature regular expression');
  console.log('Legend:');
  console.log('q1: Add tests');
  console.log('q2: Modernise later');
  console.log('q3: Discard');
  console.log('q4: Investigate more');
  process.exit(-1);
}

const fs = require('fs');
const readline = require('readline');
const twoByTwo = require('./2x2.js');

const filePath = process.argv[2];
const signatureRegex = process.argv[3];

(async function () {
  const logLines = getLogLines(filePath);
  const matrix = await twoByTwo.getMatrix(logLines, signatureRegex);
  printMatrix(matrix);
})();

function getLogLines(filePath) {
  const fileStream = fs.createReadStream(filePath);
  return readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
  });
}

function printMatrix(matrix) {
  console.log(matrix);
}
