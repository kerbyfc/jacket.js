console.log(this);window.example_id = "example26";try {
var named = J('NamedFunction', anonymous);

/* NOW NAMED IS */
function NamedFunction(msg) {
    
    try { 
      
      // directly our code
      if (!arguments.length) arguments = _undefined;
      log(msg);
         
    } catch (e) { 
      // to help us find bugs faster
      e.message = ( _wrapper.origin.name + " constructor : " + e.message); Jacket.handle(e);  
    }
 
    // oh-ho-how... Can we wrap functions} catch (e) {console.error(e.message);}
window.application.md = window.application.md.replace("|example26|", "\n" + window.application.rewrites["example26"] + ( window.logs["example26"].length ? "\n/\* console: \n" + window.logs["example26"] + "\n\n\*/\n" : "" ));