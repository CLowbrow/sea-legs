var tokens = require('./tokens').tokens;

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
    while (true) {
      //TODO: clean this up. Don't need restOfString.
      var nextChar = lexer.inputArr.charAt(lexer.pos);
      if (nextChar === tokens.openBrace) {
        lexer.pos = lexer.start;
        return states.lexSelector;
      } else if (nextChar === tokens.atStart) {
        return states.lexAt;
      } else if (nextChar === tokens.semicolon) {
        lexer.emit('declaration');
        return states.lexSemicolon;
      } else if (nextChar === tokens.closeBrace) {
        lexer.emit('declaration');
        return states.lexCloseBrace;
      } else if (isBlank(nextChar) && lexer.start === lexer.pos){
        lexer.start++;
      } 
      if (nextChar === '') { return undefined; }
      //increment stuff
      lexer.pos++;
    }
  },
  lexOpenBrace: function (lexer) {
    lexer.next();
    lexer.emit('openBrace');
    return states.lexStatement;
  },
  lexCloseBrace: function (lexer) {
    lexer.next();
    lexer.emit('closeBrace');
    return states.lexStatement;
  },
  lexAt: function (lexer) {
    lexer.next();
    lexer.emit('@');
    return states.lexAtRule;
  },
  lexAtRule: function (lexer) {
    while (true) {
      var token = lexer.next();
      
      if (token === ' '){
        lexer.backUp();
        lexer.emit('atRule');
        return states.lexAtBlock;
      } else if (token === '') { 
        return undefined; 
      }
    }
  },
  lexAtBlock: function (lexer) {
    while (true) {
      switch (lexer.next()) {
        case tokens.semicolon:
          lexer.backUp();
          lexer.emit('atBlock');
          return states.lexSemicolon;
        
          case tokens.openBrace:
            lexer.backUp();
            lexer.emit('atBlock');
            return states.lexOpenBrace;
        
        case '':
          return undefined;
      }
    }
  },
  lexSemicolon: function (lexer) {
    lexer.next();
    lexer.emit('semicolon');
    return states.lexStatement;
  },
  lexSelector: function (lexer) {
    while (true) {
      switch (lexer.next()) {
        case tokens.idPrefix:
          lexer.backUp();
          lexer.emit('selector');
          return states.lexId;
          
        case tokens.classPrefix:
          lexer.backUp();
          lexer.emit('selector');
          return states.lexClass;
          
        case tokens.openBrace:
          lexer.backUp();
          lexer.emit('selector');
          return states.lexOpenBrace;

        case tokens.comma:
          lexer.backUp();
          lexer.emit('selector');
          return states.lexComma;
        
        case tokens.descendant:
          lexer.backUp();
          lexer.emit('selector');
          return states.lexDescendant;
          
        case '':
          return undefined;
      }
    }
  },
  lexId: function (lexer) {
    lexer.next();
    while (true) {
      var token = lexer.next();
      if(!inSet(token.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz01234567890-_')){
        lexer.backUp();
        lexer.emit('idName');
        return states.lexSelector;
      }
      if (token === '') { return undefined; }
    }
  },
  lexClass: function (lexer) {
    lexer.next();
    while (true) {
      var token = lexer.next();
      if(!inSet(token.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz01234567890-_')){
        lexer.backUp();
        lexer.emit('className');
        return states.lexSelector;
      }
      if (token === '') { return undefined; }
    }
  },
  lexComma: function (lexer) {
    lexer.next();
    lexer.emit('comma');
    return states.lexSelector;
  },
  lexDescendant: function (lexer) {
    while (true) {
      var token = lexer.next();
      //look ahead
      if (token === tokens.openBrace || token === tokens.comma) {
        lexer.pos = ++lexer.start;
        return states.lexOpenBrace;
      } else if (!isBlank(token)) {
        lexer.backUp();
        lexer.emit('descendent');
        return states.lexSelector;
      } 
      if (token === '') { return undefined; }
    }
  }
};

exports.states = states;