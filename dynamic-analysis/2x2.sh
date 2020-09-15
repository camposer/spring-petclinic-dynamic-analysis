#!/usr/bin/env node

if (process.argv.length !== 4) {
  console.log('./2x2.sh LOG_FILE SIGNATURE_REGEX');
  console.log('LOG_FILE: Log file full path');
  console.log('SIGNATURE_REGEX: Signature regular expression');
  process.exit(-1);
}

const matrix = require('./2x2.js');
const filePath = process.argv[2];
const signatureRegex = process.argv[3];

(async function () {
  const highHitsHighMillis = await matrix.getHighHitsHighMillis(filePath, signatureRegex);
  printHighHitsHighMillis(highHitsHighMillis);
})();

function printHighHitsHighMillis(highHitsHighMillis) {
  console.log(highHitsHighMillis);
}
