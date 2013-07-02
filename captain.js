#!/usr/bin/env node

var Lexer = require('./lexer').Lexer;
var tokens = require('./tokens').tokens;
var util = require('./tokens').util;
var fs = require('fs');

//collections for main css file being parsed
var classes = {},
    ids = {},
    allTokens = [],
    count = 0;

var searchLexer = new Lexer(),
    searchTokens = [],
    matches = 0;

//TODO: Make this better somehow
var searchtime = function () {
  count++;
  if (count === 2) {

    var matches = util.searchForTokenSequence(searchTokens, allTokens);

    console.log(matches.length + ' MATCHES FOUND');
    console.log('\n----------------------\n');
  }
};

var lexer = Lexer();

lexer.on('lexerToken', function (token) {
  allTokens.push(token);
  //if (process.argv[3] === "-s") {
    console.log(token);
  //}
});

lexer.on('finish', function () {
  if (process.argv[3] === "-s") {
    searchtime();
  }
});

//GO GO GO!!!

var file = process.argv[2] || "sample.css";

var fileStream = fs.createReadStream(file);
fileStream.pipe(lexer);



