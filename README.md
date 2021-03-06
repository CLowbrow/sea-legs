#Css lexing for the rest of us

Look here sonny, back in my day we didn't have no fancy regular expressions or tools that generated lexers/parsers from grammar definitions. 

What we **DID** have was a can-do attitude, a spring in our step, and first order functions. And we made due, dammit.

## Ok, but what is this?

This is a (bad) css lexer with some search functionality bolted on the front of it

## Getting stuff out in node

Lexer.js provides a Lexer constructor. The lexer object inherits from EventEmitter


```js
var Lexer = require('sealegs').Lexer;
    
//instantiate lexer
var lexy = new Lexer();
    
// Lexer emits 2 kinds of events:

//'lexerToken' events are emitted when lexer has lexes another token and it's ready.
lexy.on('lexerToken', function (token) {
  //do something with your token.
});

// The 'finished' event is emitted when the lexer runs out of string to lex or encounters and error. 
// (Unfortunately, no error events yet)
lexy.on('finished', function () {
  // All done
});
    
//To get the lexer rolling, simply call 
lexy.begin('.one .two');
```

## Command Line Usage

Run captain.js on a file to get all tokens in stdout:

    ./captain.js sample.css
    
Run captain.js with the search flag like this:

    ./captain.js sample.css -s ".one .two"

you will get an output of how many times this selector was found in the code (possibly as a subset of another selector)

## Why not save yourself a lot of time and use a regex?

[This, basically.](http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454)

## Credits

Ideas for writing a lexer come from [this excellent presentation](http://rspace.googlecode.com/hg/slide/lex.html).
Ideas for what makes lexing useful outside of a parser/interpreter come from [pfff](https://github.com/facebook/pfff).