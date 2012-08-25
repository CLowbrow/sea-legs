var states = require('./states').states;
var EventEmitter = require('events').EventEmitter;

//Lexer can emit tokens and the finished event.

var Lexer = function () {
  
  var lexy = this;
  lexy.inputArr = '';
  lexy.start = 0;
  lexy.pos = 0;
  lexy.width = 0;
  
  
  lexy.emitToken = function (type) {
    var token = {
      type: type,
      value: lexy.inputArr.substring(lexy.start, lexy.pos)
    };
    if(lexy.start !== lexy.pos) {
      lexy.emit('lexerToken', token);
      lexy.start = lexy.pos;
    }
  };
  
  //TODO: add accept, acceptmany, and peek.
  
  lexy.next = function () {
    var rune = lexy.inputArr.charAt(lexy.pos);
    lexy.pos++;
    return rune;
  };
  
  lexy.backUp = function () {
    lexy.pos--;
  };
  
  lexy.ignore = function () {
    lexy.start = lexy.pos;
  };
  
  lexy.backup = function () {
    lexy.pos -= 1;
  };
  
  lexy.peek = function () {
    return lexy.inputArr.charAt(lexy.pos);
  };
  
  lexy.acceptMany = function (string) {
    var next = lexy.next();
    while (next !== '') {
      if (string.toLowerCase().indexOf(next.toLowerCase()) < 0) {
        lexy.backup();
        break;
      }
      next = lexy.next();
    }
    if(next === '') {
      lexy.backup();
    }
  };
  
  lexy.acceptUntil = function (string) {
    var next = lexy.next();
    while (next !== '') {
      if (string.toLowerCase().indexOf(next.toLowerCase()) >= 0) {
        lexy.backup();
        break;
      }
      next = lexy.next();
    }
    if(next === '') {
      lexy.backup();
    }
  };
  
  lexy.ignoreMany = function (string) {
    lexy.acceptMany(string);
    lexy.start = lexy.pos;
  };
  
  /* This is the engine. Each state function returns the next state function, 
  or undefined if we have run out of file. */ 


  var run = function () {
    var state = states.lexStatement;
    while (state) {
      state = state(lexy);
    }
    //we are done parsing. tell the consumer.
    lexy.emit('finished');
  };
  
  lexy.begin = function (string) {
    //Strip Comments. I am CHEATING here because comments suck.
    var data = string.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
    lexy.inputArr = data;
    run();
  };
  
};

Lexer.prototype = new EventEmitter();

exports.Lexer = Lexer;