console.log(this);window.example_id = "example27";try {
var _Class = (function _Class() {
  function _Class(wishes) {
    this.defInConst = function() {
      return _undefined; 
    }
    if (wishes)
      this.defInConst(); 
  }
  return _Class;
}).call(window);

log(_Class.defInConst); // undefined

new J(_Class)().defInConst()
// _Class.defInConst : _undefined is not defined
//  - at _Class.wrapper [as defInConst] (http://localhost:8080/jacket.js:478:50)
//  - at http://localhost:8080/:95:25 

new J(_Class)('call defInConst inside constructor')
// _Class constructor : _undefined is not defined
//  - at http://localhost:8080/jacket.js:281:48
//  - at http://localhost:8080/:96:22 
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example27|", "\n" + window.application.rewrites["example27"] + ( window.logs["example27"].length ? "\n/\* console: \n" + window.logs["example27"] + "\n\n\*/\n" : "" ));