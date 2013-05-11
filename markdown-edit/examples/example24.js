console.log(this);window.example_id = "example24";try {
function sum(a, b) {
  if (!b) b = _undefined; /* this will raise an exception */
  this.result = a + b;
  return this.result;
}

J(sum)(1, 1);             // 2
new J(sum)(1, 1);         // Object {result: 2}

J(sum)('oops!');          // sum constructor : _undefined is not defined
                          //  - at http://localhost:8080/:68:25
                              
log('I} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example24|", "\n" + window.application.rewrites["example24"] + ( window.logs["example24"].length ? "\n/\* console: \n" + window.logs["example24"] + "\n\n\*/\n" : "" ));