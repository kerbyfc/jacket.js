console.log(this);window.example_id = "example28";try {
/* create additional handler */
Jacket.handler = function(error_object, extended_error_msg_string, stacktace_array, callstack_array) {
  /* your code */
}
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example28|", "\n" + window.application.rewrites["example28"] + ( window.logs["example28"].length ? "\n/\* console: \n" + window.logs["example28"] + "\n\n\*/\n" : "" ));