console.log(this);window.example_id = "example20";try {
try { bad(); } catch (e) { log(e.message); }
log('here');
} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example20|", "\n" + window.application.rewrites["example20"] + ( window.logs["example20"].length ? "\n/\* console: \n" + window.logs["example20"] + "\n\n\*/\n" : "" ));