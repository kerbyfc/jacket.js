console.log(this);window.example_id = "example29";try {
J(function my(a){return a+1;}, function(scope, name, method, args, result) {
  /* it's usefull to implement Backbone.Events for example */
  log(arguments);
})(1);
/* WILL OUTPUT TO CONSOLE */
['[Object object]', 'my', 'constructor', [1], 2]
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example29|", "\n" + window.application.rewrites["example29"] + ( window.logs["example29"].length ? "\n/\* console: \n" + window.logs["example29"] + "\n\n\*/\n" : "" ));