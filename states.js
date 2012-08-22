var tokens = require('./tokens').tokens;

//Some helper functions
//These should go somewhere else

var isBlank = function (token) {
  if (token.match(/\s/) || token.match(/\n/)){
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
  parseStatement: function (lexer) {
    while (true) {
      var nextChar = lexer.inputArr.charAt(lexer.pos);
      var restOfString = lexer.inputArr.substring(lexer.pos);
      if (isPrefix(tokens.openBrace, restOfString)) {
        lexer.pos = lexer.start;
        return states.parseSelector;
      } else if (isPrefix(tokens.atStart, restOfString)) {
        return states.parseAt;
      } else if (isPrefix(tokens.semicolon, restOfString)) {
        lexer.emit('declaration');
        return states.parseSemicolon;
      } else if (isPrefix(tokens.closeBrace, restOfString)) {
        lexer.emit('declaration');
        return states.parseCloseBrace;
      } else if (isBlank(nextChar) && lexer.start === lexer.pos){
        lexer.start++;
      } 
      if (nextChar === '') { return undefined; }
      //increment stuff
      lexer.pos++;
    }
  },
  parseOpenBrace: function (lexer) {
    lexer.pos++;
    lexer.emit('openBrace');
    return states.parseStatement;
  },
  parseCloseBrace: function (lexer) {
    lexer.pos++;
    lexer.emit('closeBrace');
    return states.parseStatement;
  },
  parseAt: function (lexer) {
    lexer.pos++;
    lexer.emit('@');
    return states.parseAtRule;
  },
  parseAtRule: function (lexer) {
    while (true) {
      var token = lexer.inputArr.charAt(lexer.pos);
      
      if (token === ' '){
        lexer.emit('atRule');
        return states.parseAtBlock;
      }
      
      if (token === '') { return undefined; }
      lexer.pos++;
    }
  },
  parseAtBlock: function (lexer) {
    while (true) {
      var token = lexer.inputArr.charAt(lexer.pos);
      
      if (token === '{'){
        lexer.emit('atBlock');
        return states.parseOpenBrace;
      } else if (token === ';'){
        lexer.emit('atBlock');
        return states.parseSemicolon;
      }
      
      if (token === '') { return undefined; }
      lexer.pos++;
    }
  },
  parseSemicolon: function (lexer) {
    lexer.pos++;
    lexer.emit('semicolon');
    return states.parseStatement;
  },
  parseSelector: function (lexer) {
    while (true) {
      var token = lexer.inputArr.charAt(lexer.pos);
      if(token === tokens.idPrefix){
        lexer.emit('selector');
        lexer.pos++;
        return states.parseId;
      } else if (token === tokens.classPrefix) {
        lexer.emit('selector');
        lexer.pos++;
        return states.parseClass;
      } else if (token === tokens.openBrace){
        lexer.emit('selector');
        return states.parseOpenBrace;
      } else if (token === tokens.comma){
        lexer.emit('selector');
        return states.parseComma;
      } else if (token === ' ' && lexer.start === lexer.pos) {
        //lexer.start++;
      }
      
      if (token === '') { return undefined; }
      lexer.pos++;
    }
  },
  parseId: function (lexer) {
    while (true) {
      var token = lexer.inputArr.charAt(lexer.pos);
      if(!inSet(token.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz01234567890-_')){
        lexer.emit('idName');
        return states.parseSelector;
      }
      if (token === '') { return undefined; }
      lexer.pos++;
    }
  },
  parseClass: function (lexer) {
    while (true) {
      var token = lexer.inputArr.charAt(lexer.pos);
      if(!inSet(token.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz01234567890-_')){
        lexer.emit('className');
        return states.parseSelector;
      }
      if (token === '') { return undefined; }
      lexer.pos++;
    }
  },
  parseComma: function (lexer) {
    lexer.pos++;
    lexer.emit('comma');
    return states.parseSelector;
  }
};

exports.states = states;