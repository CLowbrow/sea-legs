//these are special tokens that are also null-tokens
var nullTokens = {
  openBrace: '{',
  closeBrace: '}',
  atStart: '@',
  semicolon: ';',
  idPrefix: '#',
  classPrefix: '.',
  pseudoclassPrefix: ':',
  comma: ',',
  child: '>',
  openBracket: '[',
  closeBracket: ']',
  descendant: ' ',
  sibling: '+',
  quote: '"',
  nameSpace: '|',
};

var util = {
  // returns true if tokens are syntactically identical
  compareTokens: function (a, b) { 
    return !((a.type !== b.type) || (!nullTokens.hasOwnProperty(a.type) && a.value !== b.value));
  },
  //returns array of positions where needle was found
  //TODO: is what this returning useful?
  searchForTokenSequence: function (needle, haystack) {
    var searchTokensLength = needle.length,
        match = true,
        positions = [],
        token1, token2;

    for (var i=0; i <= haystack.length - searchTokensLength; i++) {
      match = true;
      for(var j = 0; j < searchTokensLength; j++) {
        
        token1 = haystack[i+j];
        token2 = needle[j];
        
        if (!util.compareTokens(token1, token2)) {
          match = false;
          break;
        }
      }
      if (match) {
        positions.push(i);
      }
    }
    return positions;
  }
};

exports.nullTokens = nullTokens;
exports.util = util;


