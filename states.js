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
  lexStatement: function (lexer) {
    lexer.ignoreMany(' \n');
    while (true) {
      var nextChar = lexer.inputArr.charAt(lexer.pos);
      if (nextChar === tokens.openBrace) {
        lexer.pos = lexer.start;
        return states.lexSelector;
      } else if (nextChar === tokens.atStart) {
        return states.lexAt;
      } else if (nextChar === tokens.semicolon) {
        lexer.emitToken('declaration');
        return states.lexSemicolon;
      } else if (nextChar === tokens.closeBrace) {
        lexer.emitToken('declaration');
        return states.lexCloseBrace;
      } 
      if (nextChar === '') { 
        return undefined; 
      }
      //increment stuff
      lexer.pos++;
    }
  },
  lexOpenBrace: function (lexer) {
    lexer.next();
    lexer.emitToken('openBrace');
    return states.lexStatement;
  },
  lexCloseBrace: function (lexer) {
    lexer.next();
    lexer.emitToken('closeBrace');
    return states.lexStatement;
  },
  lexAt: function (lexer) {
    lexer.next();
    lexer.emitToken('@');
    return states.lexAtRule;
  },
  lexAtRule: function (lexer) {
    while (true) {
      var token = lexer.next();
      
      if (token === ' '){
        lexer.backUp();
        lexer.emitToken('atRule');
        return states.lexAtBlock;
      } else if (token === '') {
        lexer.emitToken('atRule');
        return undefined; 
      }
    }
  },
  lexAtBlock: function (lexer) {
    while (true) {
      switch (lexer.next()) {
        case tokens.semicolon:
          lexer.backUp();
          lexer.emitToken('atBlock');
          return states.lexSemicolon;
        
          case tokens.openBrace:
            lexer.backUp();
            lexer.emitToken('atBlock');
            return states.lexOpenBrace;
        
        case '':
          return undefined;
      }
    }
  },
  lexSemicolon: function (lexer) {
    lexer.next();
    lexer.emitToken('semicolon');
    return states.lexStatement;
  },
  lexSelector: function (lexer) {
    lexer.acceptMany('abcdefghijklmnopqrstuv[]=~:*|1234567890');
    lexer.emitToken('selector');
    switch (lexer.peek()) {
      case tokens.idPrefix:
        return states.lexId;
          
      case tokens.classPrefix:
        return states.lexClass;
          
      case tokens.openBrace:
        return states.lexOpenBrace;

      case tokens.comma:
        return states.lexComma;
        
      case tokens.descendant:
        return states.lexDescendant;
        
      case tokens.sibling:
        return states.lexSiblingOperator;
          
      case tokens.child:
        return states.lexChildOperator;
        
      case '\n':
        return states.lexDescendant;
          
      case '':
        return undefined;
    }
  },
  lexId: function (lexer) {
    lexer.next();
    while (true) {
      var token = lexer.next();
      if(!inSet(token.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz01234567890-_')){
        lexer.backUp();
        lexer.emitToken('idName');
        return states.lexSelector;
      }
      if (token === '') {
        lexer.emitToken('idName');
        return undefined; 
      }
    }
  },
  lexClass: function (lexer) {
    lexer.next();
    while (true) {
      var token = lexer.next();
      if(!inSet(token.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz01234567890-_')){
        lexer.backUp();
        lexer.emitToken('className');
        return states.lexSelector;
      }
      if (token === '') { 
        lexer.emitToken('className');
        return undefined; 
      }
    }
  },
  lexComma: function (lexer) {
    lexer.next();
    lexer.emitToken('comma');
    return states.lexStatement;
  },
  lexDescendant: function (lexer) {
    while (true) {
      var token = lexer.next();
      //look ahead
      //TODO: this is too complicated. lexDescendant should not have to invalidate itself.
      if (token === tokens.openBrace) {
        lexer.pos = ++lexer.start;
        return states.lexOpenBrace;
      } else if (token === tokens.comma) {
        lexer.pos = ++lexer.start;
        return states.lexComma;
      } else if (token === tokens.sibling) {
        lexer.pos = ++lexer.start;
        return states.lexSiblingOperator;
      } else if (token === tokens.child) {
        lexer.pos = ++lexer.start;
        return states.lexChildOperator;
      } else if (!isBlank(token)) {
        lexer.backUp();
        lexer.emitToken('descendant');
        return states.lexSelector;
      } 
      if (token === '') { return undefined; }
    }
  },
  lexChildOperator: function (lexer) {
    lexer.next();
    lexer.emitToken('childOperator');
    return states.lexStatement;
  },
  lexSiblingOperator: function (lexer) {
    lexer.next();
    lexer.emitToken('siblingOperator');
    return states.lexStatement;
  }
};

exports.states = states;