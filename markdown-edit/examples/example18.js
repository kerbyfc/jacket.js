console.log(this);window.example_id = "example18";try {
window.bad = function(){ return _undefined; };
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example18|", "\n" + window.application.rewrites["example18"] + ( window.logs["example18"].length ? "\n/\* console: \n" + window.logs["example18"] + "\n\n\*/\n" : "" ));