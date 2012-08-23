var fs = require('fs');
var states = require('./states').states;

var Lexer = function (emitter) {
  
  var lexy = this;
  lexy.inputArr = '';
  lexy.start = 0;
  lexy.pos = 0;
  lexy.width = 0;
  
  lexy.emit = function (type) {
    var token = {
      type: type,
      value: lexy.inputArr.substring(lexy.start, lexy.pos)
    };
    if(lexy.start !== lexy.pos) {
      emitter.emit('lexerToken', token);
      lexy.start = lexy.pos;
    }
  };
  
  lexy.next = function () {
    var rune = lexy.inputArr.charAt(lexy.pos);
    lexy.pos++;
    return rune;
  };
  
  lexy.backUp = function () {
    lexy.pos--;
  }
  
  lexy.ignore = function () {
    lexy.start = lexy.pos;
  };
  
  lexy.backup = function () {
    lexy.pos -= 1;
  };
  
  /* This is the engine. Each state function returns the next state function, 
  or undefined if we have run out of file. */ 


  var run = function () {
    var state = states.lexStatement;
    while (state) {
      state = state(lexy);
    }
    
    //we are done parsing. tell the consumer.
    emitter.emit('finished');
  };
  
  lexy.begin = function (file) {
    fs.readFile(file, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      //Strip Comments. I am CHEATING here because comments suck.
      data = data.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
      lexy.inputArr = data;
      run();
    });
  };
  
};

exports.Lexer = Lexer;