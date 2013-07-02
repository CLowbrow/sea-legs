var tokens = require('./tokens').nullTokens;

//Some helper functions
//These should go somewhere else

var isBlank = function (token) {
  if (token.match(/\s/) || token.match(/\n/) || token.match(/\t/)){
    return true;
  } else {
    return false;
  }
};

var isPrefix = function (needle, haystack) {
  if (haystack.indexOf(needle) === 0){
    return true;
  } else {
    return false;
  }
};

var inSet = function (needle, haystack) {
  if (haystack.indexOf(needle) >= 0){
    return true;
  } else {
    return false;
  }
};

var states = {
  lexStatement: function (lexer, done) {
    function decide (lexer, done) {
      lexer.next(function (next) {
        switch (next) {
          case tokens.openBrace:
            lexer.rewind();
            done(states.lexSelector);
            return;

          case tokens.atStart:
            lexer.backUp();
            done(states.lexAt);
            return;

          case tokens.semicolon:
            lexer.backUp();
            lexer.emitToken('declaration');
            done(states.lexSemicolon);
            return;

          case tokens.closeBrace:
            lexer.backUp();
            lexer.emitToken('declaration');
            done(states.lexCloseBrace);
            return;
        }
        decide(lexer, done);
      });
    }

    lexer.ignoreMany(' \n', function () {
      decide(lexer, done);
    });
  },
  lexOpenBrace: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('openBrace');
      done(states.lexStatement);
    });
  },
  lexCloseBrace: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('closeBrace');
      done(states.lexStatement);
    });
  },
  lexAt: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('@');
      done(states.lexAtRule);
    });
  },
  lexAtRule: function (lexer, done) {
    lexer.acceptUntil(' ', function () {
      lexer.emitToken('atRule');
      done(states.lexAtBlock);
    });
  },
  lexAtBlock: function (lexer, done) {
    function decide(lexer, done) {
      lexer.next(function (token) {
        switch (token) {
          case tokens.semicolon:
            lexer.backUp();
            lexer.emitToken('atBlock');
            return done(states.lexSemicolon);

          case tokens.openBrace:
            lexer.backUp();
            lexer.emitToken('atBlock');
            return done(states.lexOpenBrace);
        }
        decide(lexer, done);
      });
    }
    lexer.ignoreMany(' \n', function () {
      decide(lexer, done);
    });
  },
  lexSemicolon: function (lexer, done) {
    lexer.next(function (token) {
      lexer.emitToken('semicolon');
      done(states.lexStatement);
    });
  },
  lexSelector: function (lexer, done) {
    lexer.acceptMany('abcdefghijklmnopqrstuvxyz=~:*|1234567890-_()', function () {
      lexer.emitToken('selector');
      lexer.peek(function (token) {
        switch (token) {
          case tokens.idPrefix:
            return done(states.lexId);

          case tokens.classPrefix:
            return done(states.lexClass);

          case tokens.openBrace:
            return done(states.lexOpenBrace);

          case tokens.openBracket:
            return done(states.lexOpenBracket);

          case tokens.comma:
            return done(states.lexComma);

          case tokens.descendant:
            return done(states.lexDescendant);

          case tokens.sibling:
            return done(states.lexSiblingOperator);

          case tokens.child:
            return done(states.lexChildOperator);

          case '\n':
            return done(states.lexDescendant);

          case '':
            return done(false, true);
        }
      });
    });
  },
  lexId: function (lexer, done) {
    lexer.next(function () {
      lexer.acceptMany('abcdefghijklmnopqrstuvwxyz01234567890-_', function () {
        lexer.emitToken('idName');
      });
    done(states.lexSelector);
  });
  },
  lexClass: function (lexer, done) {
    lexer.next(function () {
      lexer.acceptMany('abcdefghijklmnopqrstuvwxyz01234567890-_', function () {
        lexer.emitToken('className');
        done(states.lexSelector);
      });
    });
  },
  lexComma: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('comma');
      done(states.lexStatement);
    });
  },
  lexDescendant: function (lexer, done) {
    lexer.next(function (token) {
      if (token === tokens.openBrace) {
        lexer.backUp();
        lexer.ignore();
        return done(states.lexOpenBrace);
      } else if (token === tokens.comma) {
        lexer.backUp();
        lexer.ignore();
        return done(states.lexComma);
      } else if (token === tokens.sibling) {
        lexer.backUp();
        lexer.ignore();
        return done(states.lexSiblingOperator);
      } else if (token === tokens.child) {
        lexer.backUp();
        lexer.ignore();
        return done(states.lexChildOperator);
      } else if (!isBlank(token)) {
        lexer.backUp();
        lexer.emitToken('descendant');
        return done(states.lexSelector);
      }
      states.lexDescendant(lexer, done);
    });
  },
  lexChildOperator: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('childOperator');
      done(states.lexStatement);
    });
  },
  lexSiblingOperator: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('siblingOperator');
      done(states.lexStatement);
    });
  },
  lexOpenBracket: function (lexer, done) {
    lexer.next(function () {
      lexer.emitToken('openBracket');
      done(states.lexAttribute);
    });
  },
  lexCloseBracket: function (lexer, done) {
    lexer.next(function (token) {
      lexer.emitToken('closeBracket');
      done(states.lexStatement);
    });
  },
  lexAttribute: function (lexer, done) {
    lexer.acceptUntil('=~^$*|] ', function () {
      lexer.peek(function (token) {
        if(token === tokens.closeBracket) {
          lexer.emitToken('attribute');
          done(states.lexCloseBracket);
        } else {
          lexer.emitToken('attribute');
          done(states.lexAttributeComparison);
        }
      })
    });

  },
  lexAttributeComparison: function (lexer, done) {
    lexer.ignoreMany(' \n', function () {
      //one or two characters
      lexer.next(function (token) {
        if(token !== '=') {
          lexer.next(function () {
            lexer.emitToken('attributeComparison');
            done(states.lexAttributeValue);
          })
        } else {
          lexer.emitToken('attributeComparison');
          done(states.lexAttributeValue);
        }
      })
      if (lexer.next() !== '=') {
        lexer.next();
      }
    });
  },
  lexAttributeValue: function (lexer, done) {
    lexer.ignoreMany(' \n', function () {
      lexer.acceptUntil(tokens.closeBracket, function () {
        lexer.emitToken('attributeValue');
        done(states.lexCloseBracket);
      });
    });
  },
  initial: this.lexStatement

};

exports.states = states;