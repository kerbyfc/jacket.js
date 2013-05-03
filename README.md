Jacket.js
=========

  **Let's dress up your code with Jackets**

1. [Conception](#1-conception)
 <br/>1.1 [Pros & cons](#11-pros--cons)
2. [Basic Usage](#2-basic-usage)
 <br/>2.1. [Functions](#21-functions)
 <br/>2.2. [Singletons](#22-singletons)
 <br/>2.3. [Coffescript classes](#23-coffeescript-classes)
 <br/>2.4. [Backbone extensions](#24-backbone-extensions)
3. [Error handling](#3-error-handling)
 <br/>3.1. [Out of the box](#31-out-of-the-box)
 <br/>3.2. [Configuring](#32-configuring)
 <br/>3.3. [Writing own handler](#33-writing-own-handler)
4. [Additional features](#4-additional-features)
 <br/>4.1. [Callbacks](#41-callbacks)
 <br/>4.2. [Methods' protection](#42-methods-protection)

#### 1. Conception

Ask yourself: 
"How much i need of getting stack 
trace when an error occurs on client side?". 
I want it badly, especially in production.
<br/>If you think too, I suppose that jacket - 
is what you need.

However, you can handle stack 
trace only by "try & catch" construction,
because window.onerror handler 
does not provide that.

* And what you might to do in this case? 
* How to rid yourself from this boring work?
* How to speed up searching of code mistakes?
* Is there any way of easy code' wrapping?

Actual questions, aren't they?

##### 1.1. Pros & cons

<table width="100%">
  <thead><tr><th>pros</th><th>cons</th></tr></thead>
  <tbody><tr>
  <td>
  
    1. Easy error handling without manual 
    try/catch construction embedding.
    <br/>2. More readable stacktraces 
    and error messages help to find errors faster.
    <br/>3. Send stacktrace, callstack, 
    event log, exception message and 
    another helpful data to server.
    <br/>3. Global and specific callbacks 
    provide an opportunity to 
    implement "hooks" technique.
    <br/>4. Perfectly approaches 
    to event-driven architecture.
    <br/>5. Prevention of script 
    execution stopping, if it needed.
  
  </td>
  <td valign="top">
  
    1. You should change your 
    code (a little) if it exists
  
  </td>
  </tr></tbody>
</table>

#### 2. Basic Usage

Suppose you have a "bad" 
function, that throws 
an exception:
```javascript
window.bad = function(){ return _undefined; };
```

And when you call it, 
the script execution stops:
```javascript
bad();
log('here');
/* console: 
   _undefined is not defined 
*/
```

To get stack trace you might 
handle error by this way: 
```javascript
window.handler = function(e) { 
  console.log('catched: ' + e.message) 
  /* get e.stack */
}
bad = function () {
  try {
    return _undefined;
  } catch (e) {
    handler(e);
  }
}
```

By this way you can prevent of script 
execution stopping and post error
information to your server if you need
```javascript
bad();
log('here');
/* console: 
   catched: _undefined is not defined 
   here 
*/
```

However, in this case 
you have a one function 
call, that supposed to be handled. 
In case you need to handle 
and notify your server 
about all exceptions, 
raised by you client side 
application, you must 
have an easy way 
of code' wrapping.  
##### Jacket.js makes it real!

```javascript
window.fn = Jacket(function () { // use "J" instead of "Jacket" for convenience
  return _undefined;
});
```

using Coffeescript
```coffeescript
window.fn = J -> 
 _undefined
```

Call it
```javascript
fn();
console.log("I'm alive!");
/* console: 
   Anonymous183.constructor : _undefined is not defined 
   I'm alive! 
*/
```
 
##### Which type of objects can we wrap?
Jacket.js is able to wrap 
classes, functions and objects. 
After exception handling, 
it will be thrown on and the script 
execution will be stopped by default. 

##### 2.1. Functions
```javascript
function sum(a, b) {
  if ( typeof(a) + typeof(b) !== 'numbernumber') {
    throw Error('invalid arguments');
  }
  this.result = a + b; 
  return this.result;
}
```

You can call it, or instantiate it
```javascript
console.log(
  J(sum)(1,2),
  new J(sum)(1,2)
);
/* console: 
   3 {"result":3} 
*/
```

This call will raise an exception
```javascript
J(sum)('oops!'); 
/* console: 
   sum.constructor : invalid arguments 
*/
```


Lets play with anonymous functions
```javascript
var anonymous = function(msg) {
  if (!arguments.length) arguments = _undefined;
  console.log(msg);
}

J(anonymous)();
// anonymous4.constructor : _undefined is not defined
//  - at anonymous (http://localhost:8080/:77:46)
//  - at wrapper (http://localhost:8080/jacket.js:470:50)
//  - at http://localhost:8080/:80:21
/* console: 
   Anonymous187.constructor : _undefined is not defined 
*/
```

As you can see, error message was modified and anonymous function was presented as "anonymous4". 
We can name it! Function will lost its anonymity. How? New function will be created. Yaap...


#### 2.2. Singletons

```javascript
var named = J('NamedFunction', anonymous);

/* NOW NAMED IS */
function NamedFunction(msg) {
    
    try { 
      
      // directly our code
      if (!arguments.length) arguments = _undefined;
      console.log(msg);
         
    } catch (e) { 
      // to help us find bugs faster
      e.message = ( _wrapper.origin.name + " constructor : " + e.message); Jacket.handle(e);  
    }
 
    // oh-ho-how... Can we wrap functions/* console: 
   Unexpected end of input 
*/
``` own methods, created in constructor? That's it. 
    var _self = this; _.each(this, function (val, key) {
      _self[key] = _wrapper.wrap(key, val);
    });

}

named();
// NamedFunction constructor : _undefined is not defined
//  - at http://localhost:8080/:84:9
```

##### 2.3. CoffeeScript classes
Classes represent a more complex structure than functions. 
They usually have suite of prototype's methods, instance methods and sometimes static methods. 
All methods of class are supposed to be wrapped. 
Instance methods, which were created in constructor supposed to be wrapped after constructor's code execution. 
If there are callings of these methods inside the constructor and one of them contains mistakes, 
exception should be catched inside constructor.

```javascript
var _Class = (function _Class() {
  function _Class(wishes) {
    this.defInConst = function() {
      return _undefined; 
    }
    if (wishes)
      this.defInConst(); 
  }
  return _Class;
}).call(window);

console.log(_Class.defInConst); // undefined

new J(_Class)().defInConst()
// _Class.defInConst : _undefined is not defined
//  - at _Class.wrapper [as defInConst] (http://localhost:8080/jacket.js:478:50)
//  - at http://localhost:8080/:95:25 

new J(_Class)('call defInConst inside constructor')
// _Class constructor : _undefined is not defined
//  - at http://localhost:8080/jacket.js:281:48
//  - at http://localhost:8080/:96:22 
/* console: 
   undefined 
   _Class.defInConst : _undefined is not defined 
   _Class.constructor : _undefined is not defined 
*/
```


##### 2.4. Backbone extensions

#### 3. Error handling

##### 3.1. Out of the box
What functionality does it provide in case of error handling?
 - It launches browser' debugger if <i>Jacket.config.use_debugger</i> is positive
 - It outputs error message, stacktrace and callstack to console *
 - It pushes these data to specified url if <i>Jacket.config.notify_url</i> is valid url string
 - It calls your own handler, passing all needed information about an error
 - It can prevent script execution stopping
\* depends on <i>Jacket.config.log_errors</i>, <i>Jacket.config.log_stacktrace</i> and <i>Jacket.config.log_callstack</i> respectively

##### 3.2. Configuring

##### 3.3. Writing own handler
```javascript
/* create additional handler */
Jacket.handler = function(error_object, extended_error_msg_string, stacktace_array, callstack_array) {
  /* your code */
}
```




##### What functionality does it give? TODO

1. Handling exceptions, raised in function or in public methods of function instance (class)
2. Notify your server about exceptions
3. Calling a specific callback on each wrapped function call


#### 4. Additional features


##### 4.1. Callbacks

You can specify a global callback function, 
that should be runned before each return statement of class' methods. 
This callback gets execution scope, class name, method name, 
method arguments and its result as arguments

##### 4.2. Method's protection


```javascript
J(function my(a){return a+1;}, function(scope, name, method, args, result) {
  /* it's usefull to implement Backbone.Events for example */
  console.log(arguments);
})(1);
/* WILL OUTPUT TO CONSOLE */
['[Object object]', 'my', 'constructor', [1], 2]
/* console: 
   {"0":"my","1":"constructor","2":Object} 
*/
```
