#!/usr/bin/env node

var Lexer = require('./lexer').Lexer;
var tokens = require('./tokens').tokens;
var util = require('./tokens').util;
var fs = require('fs');
var heapdump = require('heapdump');

//collections for main css file being parsed
var classes = {},
    ids = {},
    allTokens = [],
    count = 0;

var lexer = Lexer();
var writeStream = fs.createWriteStream('./scratch.txt');

var t = process.hrtime()

lexer.on('lexerToken', function (token) {
  writeStream.write(JSON.stringify(token) + "\n");
  if (process.argv[3] === "-s") {
    console.log(token);
  }
});


lexer.on('finish', function () {
  if (process.argv[3] === "-s") {
    searchtime();
  }
});


lexer.on('alldone', function () {
  t = process.hrtime(t);
  console.log('benchmark took %d seconds and %d nanoseconds', t[0], t[1]);
});
//GO GO GO!!!

var file = process.argv[2] || "sample.css";

var fileStream = fs.createReadStream(file);
fileStream.pipe(lexer);




