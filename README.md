Jacket.js
=========

  ***dress up your classes, function and object to Jackets***

How much we need the callstack when an error occurs at the front? I want it badly... I want avoid of missing notifications about front-end exceptions in production!
I dont want to wrap each method of my classes in try/catch to handle stacktrace, I want to wrap whole class and rid myself from this boring work.
That's why the Jacket was appeared.

Suppose you have a function, that throws an exception:
```javascript
(function() {
  /* application namespace */
  var fn = function () {
    return _undefined + true;
  }
  fn();
}).call(window);
```

to get exception stacktrace you might to handle it with specified handler: 
```javascript
var handler = function(err) {
  /* notify your server about this error */
}
var fn = function () {
  try {
    return _undefined + true;
  } catch (e) {
    handler(e);
  }
}
```

in this case you have a one function call, that supposed to be handled. In case you need to notify your server about all exceptions, raised by you application, you must have an easy way of code' wrapping. 
    
    
##### Jacket.js makes it real!

```javascript
/* create additional handler */
Jacket.handler = function(error_object, extended_error_msg_string, stacktace_array, callstack_array) {
  
}
/* just dress it up :) */
var fn = Jacket(function () {
  return _undefined + true;
});
/* then I'll use J instead of Jacket for convenience */
```
 
#### What functionality does it provide in case of error handling?
 - It launches browser' debugger if <i>Jacket.config.use_debugger</i> is positive
 - It outputs error message, stacktrace and callstack to console *
 - It pushes these data to specified url if <i>Jacket.config.notify_url</i> is valid url string
 - It calls your own handler, passing all needed information about an error
 - It can prevent script execution stopping
 
\* depends on <i>Jacket.config.log_errors</i>, <i>Jacket.config.log_stacktrace</i> and <i>Jacket.config.log_callstack</i> respectively

#### Which type of objects can we wrap?
Jacket.js is able to wrap classes, functions and objects. After exception handling, it will be thrown on and the script execution will be stopped by default. Setup negative <i>Jacket.config.throw_errors</i> value to avoid script execution stopping. You'll see "I`m here" in your console.

##### Function's wrapping
```javascript
namespace.sum = function sum(a, b) {
  if (b == null) b = _undefined /* this will raise an exception */
  this.result = a + b;
  return this.result;

}

J(namespace.sum)(1, 1)         // 2
new J(namespace.sum)(1, 1)     // Object {result: 2}

J(namespace.sum)('oops!')      // sum constructor: _undefined is not defined
                               //  - at http://localhost:8080/:68:25
                               
console.log('I`m here');       /* will not be executed, because exception will be raised */    
```
Lets play with anonymous functions
```javascript
var anonymous = function(msg) {
  if (!arguments.length) arguments = _undefined
  console.log(msg);
}

J(anonymous)()   // .anonymous4 error: _undefined is not defined
                 //  - at anonymous (http://localhost:8080/:75:46)
                 //  - at wrapper (http://localhost:8080/jacket.js:452:50)
                 //  - at http://localhost:8080/:78:21
                 // Object {
                 //   0: Object {
                 //       args: Arguments[0]
                 //       method: "anonymous4"
                 //       scope: ""
                 //       time: 1366372456227
                 //     }
                 // }
                 //



```









#### -------------------------------------------------------
#### What functionality does it give?

##### 1. Handling exceptions, raised in function or in public methods of function instance (class)
 
   


2. Notify your server about exceptions
3. Calling a specific callback on each wrapped function call
4. ... (I have no time, I'll continue later)
5. 
Lets write an error handler for illustrative purposes. 
```javascript
J.handler = function(err, msg, trace, stack) {
  
}
```
