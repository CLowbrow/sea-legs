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

var lexer = new Lexer();

lexer.on('lexerToken', function (token) {
  allTokens.push(token);
  console.log(token);
});

lexer.on('finished', function () {
  console.log('\n\nfinished');
  if (process.argv[3] === "-s") {
    searchtime();
  }
});

//GO GO GO!!!

var file = process.argv[2] || "sample.css";
fs.readFile(file, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  lexer.begin(data);
});

if (process.argv[3] === "-s") {
  
  searchLexer.on('lexerToken', function (token) {
    searchTokens.push(token);
  });
  searchLexer.on('finished', function () {
    console.log('SEARCH STRING LEXED AS \n');
    console.log(searchTokens);
    console.log('\n----------------------\n');
    searchtime();
  });
  searchLexer.begin(process.argv[4]);
}

