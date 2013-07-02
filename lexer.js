var states = require('./states').states;
var EventEmitter = require('events').EventEmitter;
var Writable = require('stream').Writable;

//Lexer can emit "token" events and the "alldone" event

var Lexer = function () {

  var lexy = Writable();
  lexy.inputArr = '';
  lexy.pos = 0;
  var cached = false;
  var started = false;
  var finished = false;
  var cachedCallback = function () {
    console.log('something broke!');
  }

  lexy._write = function (chunk, enc, next) {
    lexy.inputArr += chunk.toString();
    if (cached) {
      lexy.next(cachedCallback);
      cached = false;
    }
    if(!started) {
      states.lexStatement(lexy, done);
      started = true;
    }
    next();
  };

  lexy.on('finish', function() {
    finished = true;
  });


  /* ----------------------------------------
   *  PUBLIC METHODS
   * ---------------------------------------- */

  lexy.emitToken = function (type) {
    var token = {
      type: type,
      value: lexy.inputArr.substring(0, lexy.pos)
    };
    if(lexy.pos !== 0) {
      lexy.emit('lexerToken', token);
      lexy.inputArr = lexy.inputArr.substring(lexy.pos);
      lexy.pos = 0;
    }
  };

  lexy.next = function (callback) {
    //setImmediate(function () {
      var rune = lexy.inputArr.charAt(lexy.pos);
      if (rune) {
        lexy.pos++;
        callback(rune);
      } else {
        cached = true;
        cachedCallback = callback;
        if(finished) {
          lexy.emit('alldone');
        }
      }
    //});
  };

  lexy.backUp = function () {
    lexy.pos--;
  };

  lexy.ignore = function () {
    lexy.inputArr = lexy.inputArr.substring(lexy.pos)
    lexy.pos = 0;
  };

  lexy.rewind = function () {
    lexy.pos = 0;
  }

  lexy.peek = function (callback) {
    lexy.next(function (token) {
      lexy.backUp();
      callback(token);
    })
  };

  lexy.acceptMany = function (string, done) {
    lexy.next(function (next) {
      if (next === '' || string.toLowerCase().indexOf(next.toLowerCase()) < 0) {
        lexy.backUp();
        done();
      } else {
        lexy.acceptMany(string, done);
      }
    });
  };

  lexy.acceptUntil = function (string, done) {
    lexy.next(function (next) {
      if (next === '' || string.toLowerCase().indexOf(next.toLowerCase()) >= 0) {
        lexy.backUp();
        done();
      } else {
        lexy.acceptUntil(string, done);
      }
    });

  }

  lexy.ignoreMany = function (string, done) {
    lexy.acceptMany(string, function () {
      lexy.ignore()
      done();
    });
  };

  /* This is the engine. Each state function returns the next state function,
  or undefined if we have run out of file. */

  var done = function (nextState) {
    //break up the recursion chain
    setImmediate(function () {
      nextState(lexy, done);
    });
  }

  return lexy;
};

exports.Lexer = Lexer;