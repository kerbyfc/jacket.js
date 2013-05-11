console.log(this);window.example_id = "example21";try {
var fn = function () {
  return _undefined;
}
fn();
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example21|", "\n" + window.application.rewrites["example21"] + ( window.logs["example21"].length ? "\n/\* console: \n" + window.logs["example21"] + "\n\n\*/\n" : "" ));