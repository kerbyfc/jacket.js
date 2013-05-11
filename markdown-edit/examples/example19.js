console.log(this);window.example_id = "example19";try { 
bad();
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example19|", "\n" + window.application.rewrites["example19"] + ( window.logs["example19"].length ? "\n/\* console: \n" + window.logs["example19"] + "\n\n\*/\n" : "" ));