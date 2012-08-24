#!/usr/bin/env node

var EventEmitter = require('events').EventEmitter;
var Lexer = require('./lexer').Lexer;
var tokens = require('./tokens').tokens;
var fs = require('fs');

//collections for main css file being parsed
var classes = {},
    ids = {},
    allTokens = [],
    count = 0;

//TODO: perhaps worst named variables ever
var semitter = new EventEmitter();
var slexer = new Lexer(semitter);
var searchTokens = [];
var matches = 0;


//TODO: This function is horrible. Get it out of here
var searchtime = function () {
  count++;
  if (count === 2) {
    
    var searchLength = searchTokens.length;
    var match = true;
    var token1, token2;

    for (var i=0; i < allTokens.length - searchTokens.length; i++) {
      match = true;
      for(var j = 0; j < searchTokens.length; j++) {
        token1 = allTokens[i+j];
        token2 = searchTokens[j];
        
        
        if(token1.type !== token2.type) {
          match = false;
          break;
        }
        
        if(!tokens.hasOwnProperty(token1.type) && token1.value !== token2.value) {
          match = false;
          break;
        }
        
      }
      if (match) {
        matches++;
      }
      
    }
    console.log('matches: ' + matches);
  }
};


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
  
  if (process.argv[3] !== "-s") {
    console.log('CLASSES');
    console.log(classes);
    console.log('\n');
    console.log('IDS');
    console.log(ids);
  } else {
    searchtime();
  }
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

if (process.argv[3] === "-s") {
  semitter.on('lexerToken', function (token) {
    searchTokens.push(token);
  });
  semitter.on('finished', function () {
    console.log(searchTokens);
    console.log('\n');
    searchtime();
  });
  slexer.begin(process.argv[4]);
}

