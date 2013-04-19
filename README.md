[Jacket.js](http://jacketjs.org "Project home")
=========

  ***dress up your classes, function and object to Jackets***

How much we need the callstack when an error occurs at the front? I want it badly... I want avoid of missing notifications about front-end exceptions in production!
I dont want to wrap each method of my classes in try/catch to handle stacktrace, I want to wrap whole class and rid myself from this boring work.
That's why the Jacket was appeared.

Suppose you have a function, that throws an exception:
```javascript
(function() {
  // application namespace
  var namespace = {
    fn: function () {
      return _undefined + true;
    }
  }
  namespace.fn();
}).call(window);
```

to get exception stacktrace you might to handle it with specified handler: 
```javascript
namespace.handler = function(err) {
  if (typeof console !== 'undefined' && console.log)
    console.log(err.stack); // you may just want to notify your server about this error    
}
namespace.fn = function () {
  try {
    return _undefined + true;
  } catch (e) {
    namespace.handler(e); 
  }
}
```

in this case you have a one function call, that supposed to be handled. In case you need to notify your server about all exceptions, raised by you application, you must have an easy way of code' wrapping. 
    
    
##### Jacket.js makes it real!

```javascript
Jacket.handler = function(error_object, extended_error_msg_string, stacktace_array, callstack_array) {
  // your own handler implementation
}
// just pass function to Jacket/J
namespace.fn = J(function () {
  return _undefined + true;
});
```

#### How does it work?

Jacket.js wraps all function of passed object. For example it may wrap
 - single function
 - singleton
 - class constructor, it' static methods, own methods (and also defined in class constructor!) and prototype methods
 - Object' methods
 


 - It handles exceptions
 - It launches browser' debugger (optional)
 - It outputs error message, callstack and stacktrace to console (optional)
 - It pushes these data to specified url (optional)
 - It calls your own handler, passing all needed information about an error (optional)


#### What functionality does it give?

##### 1. Handling exceptions, raised in function or in public methods of function instance (class)
 
   


2. Notify your server about exceptions
3. Calling a specific callback on each wrapped function call
4. ... (I have no time, I'll continue later)
