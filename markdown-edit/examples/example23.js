console.log(this);window.example_id = "example23";try {
/* just dress it up :) */
var fn = Jacket(function () {
  return _undefined;
});
/* then I'll use J instead of Jacket for convenience */
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example23|", "\n" + window.application.rewrites["example23"] + ( window.logs["example23"].length ? "\n/\* console: \n" + window.logs["example23"] + "\n\n\*/\n" : "" ));