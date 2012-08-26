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
    //TODO: this function is really weird because it backtracks all over the place.
    lexer.ignoreMany(' \n');
    
    //get the first thing
    var next = lexer.peek();
    
    while (next !== '') {
      switch (lexer.peek()) {
        case tokens.openBrace:
          lexer.pos = lexer.start;
          return states.lexSelector;
        
        case tokens.atStart:
          return states.lexAt;
        
        case tokens.semicolon:
          lexer.emitToken('declaration');
          return states.lexSemicolon;
        
        case tokens.closeBrace:
          lexer.emitToken('declaration');
          return states.lexCloseBrace;
      }
      //increment stuff
      next = lexer.next();
    }
    lexer.pos = lexer.start;
    return states.lexSelector;
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
    lexer.acceptUntil(' ');
    lexer.emitToken('atRule');
    return states.lexAtBlock;
  },
  lexAtBlock: function (lexer) {
    lexer.ignoreMany(' \n');
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
    lexer.acceptMany('abcdefghijklmnopqrstuvxyz=~:*|1234567890-_()');
    lexer.emitToken('selector');
    switch (lexer.peek()) {
      case tokens.idPrefix:
        return states.lexId;
          
      case tokens.classPrefix:
        return states.lexClass;
          
      case tokens.openBrace:
        return states.lexOpenBrace;
      
      case tokens.openBracket:
        return states.lexOpenBracket;

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
    lexer.acceptMany('abcdefghijklmnopqrstuvwxyz01234567890-_');
    lexer.emitToken('idName');
    return states.lexSelector;
  },
  lexClass: function (lexer) {
    lexer.next();
    lexer.acceptMany('abcdefghijklmnopqrstuvwxyz01234567890-_');
    lexer.emitToken('className');
    return states.lexSelector;
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
  },
  lexOpenBracket: function (lexer) {
    lexer.next();
    lexer.emitToken('openBracket');
    return states.lexAttribute;
  },
  lexCloseBracket: function (lexer) {
    lexer.next();
    lexer.emitToken('closeBracket');
    return states.lexStatement;
  },
  lexAttribute: function (lexer) {
    lexer.acceptUntil('=~^$*|] ');
    if(lexer.peek() === tokens.closeBracket) {
      lexer.emitToken('attribute');
      return states.lexCloseBracket;
    } else {
      lexer.emitToken('attribute');
      return states.lexAttributeComparison;
    }
  },
  lexAttributeComparison: function (lexer) {
    lexer.ignoreMany(' \n');
    //one or two characters
    if (lexer.next() !== '=') {
      lexer.next();
    }
    lexer.emitToken('attributeComparison');
    return states.lexAttributeValue;
  },
  lexAttributeValue: function (lexer) {
    lexer.ignoreMany(' \n');
    lexer.acceptUntil(tokens.closeBracket);
    lexer.emitToken('attributeValue');
    return states.lexCloseBracket;
  }
  
};

exports.states = states;