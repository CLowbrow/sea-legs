#Css lexing for the rest of us

Look here sonny, back in my day we didn't have no fancy regular expressions or tools that generated lexers/parsers from grammar definitions. 

What we **DID** have was a can-do attitude, a spring in our step, and first order functions. And we made due, dammit.

## Ok, but what is this?

This is a (bad) css lexer with some helpers bolted on to the front of it that I will probably use for something useful once I make it good enough.

## Usage

Run:

    ./captain.js filename [[-d]|[-s searchstring]]

with filename being the file you would like to lex. If no filename is specified, captain will lex sample.css. Add -d if you want to see output of all tokens that were lexed.

## Why not save yourself a lot of time and use a regex?

[This, basically.](http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454)

## Credits

Ideas for writing a lexer come from [this excellent presentation](http://rspace.googlecode.com/hg/slide/lex.html).
Ideas for what makes lexing useful outside of a parser/interpreter comes from [pfff](https://github.com/facebook/pfff).