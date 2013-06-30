var states = require('./states').states;
var EventEmitter = require('events').EventEmitter;
var Writable = require('stream').Writable;

//Lexer can emit tokens and the finished event.

var Lexer = function () {

  var lexy = Writable();
  lexy.inputArr = '';
  lexy.pos = 0;

  lexy._write = function (chunk, enc, next) {
    lexy.inputArr += chunk;
    next();
  };

  lexy.emitToken = function (type) {
    var token = {
      type: type,
      value: lexy.inputArr.substring(0, lexy.pos)
    };
    if(lexy.pos !== 0) {
      lexy.emit('lexerToken', token);
      lexy.inputArr = lexy.inputArr.substring(lexy.pos)
      lexy.pos = 0;
    }
  };

  lexy.next = function () {
    var rune = lexy.inputArr.charAt(lexy.pos);
    lexy.pos++;
    return rune;
  };

  lexy.backUp = function () {
    lexy.pos--;
  };

  lexy.ignore = function () {
    lexy.inputArr = lexy.inputArr.substring(lexy.pos)
    lexy.pos = 0;
  };

  lexy.backup = function () {
    lexy.pos -= 1;
  };

  lexy.rewind = function () {
    lexy.pos = 0;
  }

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
    lexy.ignore()
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
    console.log('running');
    var data = string;
    lexy.inputArr = data;
    run();
  };

  return lexy;
};

Lexer.prototype = new EventEmitter();

exports.Lexer = Lexer;