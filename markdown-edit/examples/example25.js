console.log(this);window.example_id = "example25";try {
var anonymous = function(msg) {
  if (!arguments.length) arguments = _undefined;
  log(msg);
}

J(anonymous)();
// anonymous4.constructor : _undefined is not defined
//  - at anonymous (http://localhost:8080/:77:46)
//  - at wrapper (http://localhost:8080/jacket.js:470:50)
//  - at http://localhost:8080/:80:21
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example25|", "\n" + window.application.rewrites["example25"] + ( window.logs["example25"].length ? "\n/\* console: \n" + window.logs["example25"] + "\n\n\*/\n" : "" ));