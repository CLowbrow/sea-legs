var Lexer = require('../lexer').Lexer;
var test = require('tap').test;
var util = require('../tokens').util;

var sameTokens = function (a, b) {
  var match = util.searchForTokenSequence(a, b);
  return(match.length === 1 && a.length === b.length);
};

var isMatch = function (string, tokens, func) {
  var lexer = new Lexer(),
      lexedTokens = [];
  
  lexer.on('lexerToken', function (token) {
    lexedTokens.push(token);
  });

  lexer.on('finished', function () {
    func(sameTokens(tokens, lexedTokens));
  });
  
  lexer.begin(string);
};

test("match two classnames", function (t) {
  var testString = ".one .two",
      expectedResult = [ 
        { type: 'className', value: '.one' },
        { type: 'descendant', value: ' ' },
        { type: 'className', value: '.two' } 
      ];
  
  isMatch(testString, expectedResult, function (match) {
    t.ok(match, testString);
    t.end();
  });
  
});

test("deny two classnames", function (t) {
  var testString = ".one .three",
      expectedResult = [ 
        { type: 'className', value: '.one' },
        { type: 'descendant', value: ' ' },
        { type: 'className', value: '.two' } 
      ];
  
  isMatch(testString, expectedResult, function (match) {
    t.notOk(match, testString);
    t.end();
  });
  
});

test("match a list of selectors separated by commas", function (t) {
  var testString = ".selector-one #what, .selector-two #what, .selector-three #what",
      expectedResult = [ { type: 'className', value: '.selector-one' },
        { type: 'descendant', value: ' ' },
        { type: 'idName', value: '#what' },
        { type: 'comma', value: ',' },
        { type: 'className', value: '.selector-two' },
        { type: 'descendant', value: ' ' },
        { type: 'idName', value: '#what' },
        { type: 'comma', value: ',' },
        { type: 'className', value: '.selector-three' },
        { type: 'descendant', value: ' ' },
        { type: 'idName', value: '#what' } 
      ];
  
  isMatch(testString, expectedResult, function (match) {
    t.ok(match, testString);
    t.end();
  });
  
});

test("match an import statement", function (t) {
  var testString = '@import url("foo.css") print;',
      expectedResult = [ 
        { type: '@', value: '@' },
        { type: 'atRule', value: 'import' },
        { type: 'atBlock', value: 'url("foo.css") print' },
        { type: 'semicolon', value: ';' } 
      ];
  
  isMatch(testString, expectedResult, function (match) {
    t.ok(match, testString);
    t.end();
  });
  
});

test("match a selector with an attribute", function (t) {
  var testString = '*[langl="en"]',
      expectedResult = [ { type: 'selector', value: '*' },
        { type: 'openBracket', value: '[' },
        { type: 'attribute', value: 'langl' },
        { type: 'attributeComparison', value: '=' },
        { type: 'attributeValue', value: '"en"' },
        { type: 'closeBracket', value: ']' } 
      ];
  
  isMatch(testString, expectedResult, function (match) {
    t.ok(match, testString);
    t.end();
  });
  
});

test("match selectors nested in a media query", function (t) {
  var testString = '@media screen{ #whatever { } .classname { } }',
      expectedResult = [ { type: '@', value: '@' },
          { type: 'atRule', value: 'media' },
          { type: 'atBlock', value: 'screen' },
          { type: 'openBrace', value: '{' },
          { type: 'idName', value: '#whatever' },
          { type: 'openBrace', value: '{' },
          { type: 'closeBrace', value: '}' },
          { type: 'className', value: '.classname' },
          { type: 'openBrace', value: '{' },
          { type: 'closeBrace', value: '}' },
          { type: 'closeBrace', value: '}' } 
      ];
  
  isMatch(testString, expectedResult, function (match) {
    t.ok(match, testString);
    t.end();
  });
  
});
