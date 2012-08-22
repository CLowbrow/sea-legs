var EventEmitter = require('events').EventEmitter;
var Lexer = require('./lexer').Lexer;

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};

var classes = [],
    ids = [];

var emitter = new EventEmitter();
emitter.on('lexerToken', function (token) {
  console.log(token);
  
  if (token.type === "className") {
    classes.push(token.value);
  }
  if (token.type === "idName") {
   ids.push(token.value);
  }
});

emitter.on('finished', function () {
  console.log('\n\n');
  
  console.log('CLASSES');
  console.log(classes.getUnique().sort());
  console.log('\n');
  console.log('IDS');
  console.log(ids.getUnique().sort());
});
var lexer = new Lexer(emitter);
lexer.begin('sample.css');

