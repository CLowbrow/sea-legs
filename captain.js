#!/usr/bin/env node

var EventEmitter = require('events').EventEmitter;
var Lexer = require('./lexer').Lexer;
var fs = require('fs');

//collections for main css file being parsed
var classes = {},
    ids = {},
    allTokens = [];


var emitter = new EventEmitter();
emitter.on('lexerToken', function (token) {
  allTokens.push(token);
  
  if (token.type === "className") {
    if(classes.hasOwnProperty(token.value)) {
      classes[token.value]++;
    } else {
      classes[token.value] = 1;
    }
  }
  if (token.type === "idName") {
    if(ids.hasOwnProperty(token.value)) {
      ids[token.value]++;
    } else {
      ids[token.value] = 1;
    }
  }
});

emitter.on('finished', function () {
  if (process.argv[3] === "-d") {
    console.log('ALL');
    console.log(allTokens);
    console.log('\n');
  }
  
  console.log('CLASSES');
  console.log(classes);
  console.log('\n');
  console.log('IDS');
  console.log(ids);
});

//GO GO GO!!!
var lexer = new Lexer(emitter);
var file = process.argv[2] || "sample.css";
fs.readFile(file, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  lexer.begin(data);
});
