#!/usr/bin/env node

if (process.argv.length !== 4) {
  console.log('./2x2.sh LOG_FILE SIGNATURE_REGEX');
  console.log('LOG_FILE: Log file full path');
  console.log('SIGNATURE_REGEX: Signature regular expression');
  process.exit(-1);
}

const fs = require('fs');
const readline = require('readline');

const filePath = process.argv[2];
const signatureRegex = process.argv[3];

const regexTail = 'executed in (?<millis>[0-9])ms';
const components = {};

async function processLineByLine() {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    processLine(line);
  }

  printHitsAndAvgMillisPerComponent()
}

function processLine(line) {
  const found = line.match(`(?<signature>${signatureRegex}.+) ${regexTail}`);

  if (!isValidLine(found)) { 
    return;
  }

  const signature = found.groups.signature;
  const millis = found.groups.millis; 

  if (!components[signature]) {
    components[signature] = [];
  }
  components[signature].push(millis)
}

function isValidLine(found) {
  return found && found.groups && (found.groups.signature && found.groups.millis);
}

function printHitsAndAvgMillisPerComponent() {
  for (key in components) {
    const count = components[key].length;
    const sum = components[key].reduce((a, b) => Number(a) + Number(b));
    console.log(`${key} ${count} ${sum / count}`)
  }
}


processLineByLine();
