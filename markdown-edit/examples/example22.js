console.log(this);window.example_id = "example22";try {
var handler = function(err) { /* notify your server about this error */ }
var fn = function () {
  try {
    return _undefined;
  } catch (e) {
    handler(e);
  }
}
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example22|", "\n" + window.application.rewrites["example22"] + ( window.logs["example22"].length ? "\n/\* console: \n" + window.logs["example22"] + "\n\n\*/\n" : "" ));