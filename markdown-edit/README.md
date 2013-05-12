Jacket.js
=========

  **Let's dress up your code with <i>Jackets</i>**

1. [Conception](#1-conception)
 <br/>1.1 [Pros & cons](#11-pros--cons)
2. [Jacket](#2-jacket)
 <br/>2.1. [Constructor](#21-constructor)
 <br/>2.2. [Options](#22-options)
3. [Usage examples](#3-usage-examples)
 <br/>3.1. [Functions](#31-functions)
 <br/>3.2. [Singletons](#32-singletons)
 <br/>3.3. [Coffescript classes](#33-coffeescript-classes)
 <br/>3.4. [Backbone extensions](#34-backbone-extensions)
4. [Error handling](#4-error-handling)
 <br/>4.1. [Out of the box](#41-out-of-the-box)
 <br/>4.2. [Configuring](#42-configuring)
 <br/>4.3. [Writing own handler](#43-writing-own-handler)
5. [Additional features](#5-additional-features)
 <br/>5.1. [Callbacks](#51-callbacks)
 <br/>5.2. [Methods' protection](#52-methods-protection)

#### 1. Conception

Ask yourself: 
"How much i need of getting stack trace when an error occurs on client side?". 
I want it badly, especially in production.
<br/>If you think too, I suppose that jacket - is what you need.

However, you can handle stack trace only by "try & catch" construction,
because window.onerror handler does not provide that.

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
  
    1. Easy error handling without manual try/catch construction embedding.
    <br/>2. More readable stacktraces and error messages help to find errors faster.
    <br/>3. Send stacktrace, callstack, event log, exception message and another helpful data to server.
    <br/>3. Global and specific callbacks provide an opportunity to implement "hooks" technique.
    <br/>4. Perfectly approaches to event-driven architecture.
    <br/>5. Prevention of script execution stopping, if it needed.
  
  </td>
  <td valign="top">
  
    1. You should change your code (a little) if it exists
  
  </td>
  </tr></tbody>
</table>

#### 2. Jacket

##### 2.1. Constructor

In most situations you'll use Jacket.constructor function without new keyword. Using it with new keyword will instantiate wrapped function.

First case - wrap function, then instantiate it.
```javascript
var fn = function(){};
fn = Jacket( fn );
new fn();
```

Second case - wrap and instantiate it instantly.
```javascript
new Jacket( function(a){console.log(a)} )( 'hi!' );
```

```CoffeeScript
Jacket( name, target, extention, methods, callback )
```

<table width="100%">
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">name</td>
      <td valign="top">String</td>
      <td valign="top">false</td>
      <td valign="top">name of the new class, that should be created</td>
    </tr>
    <tr>
      <td valign="top">target</td>
      <td valign="top">Object<br/>Function</td>
      <td valign="top">true</td>
      <td valign="top">object, what should be wrapped</td>
    </tr>
    <tr>
      <td valign="top">extention</td>
      <td valign="top">Object</td>
      <td valign="top">false</td>
      <td valign="top">object, witch properties will extend target </td>
    </tr>
    <tr>
      <td valign="top">methods</td>
      <td valign="top">Array<br/>RegExp</td>
      <td valign="top">false</td>
      <td valign="top">array of method names, witch would be wrapped, or RegExp pattern</td>
    </tr>
    <tr>
      <td valign="top">callback</td>
      <td valign="top">Function</td>
      <td valign="top">false</td>
      <td valign="top">post-hook, that should be applyed after method call, before returning of its results</td>
    </tr>
  </tbody>
</table>

##### 2.2. Options
All Jacket options are storing in the Jacket.config object. 

<table width="100%">
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">log_errors</td>
      <td valign="top">Boolean</td>
      <td valign="top">true</td>
      <td valign="top">name of the new class, that should be created</td>
    </tr>
    <tr>
      <td valign="top">log_stacktrace</td>
      <td valign="top">Boolean</td>
      <td valign="top">true</td>
      <td valign="top"></td>
    </tr>
    <tr>
      <td valign="top">log_callstack</td>
      <td valign="top">Boolean</td>
      <td valign="top">false</td>
      <td valign="top"></td>
    </tr>
    <tr>
      <td valign="top">use_debugger</td>
      <td valign="top">Boolean</td>
      <td valign="top">false</td>
      <td valign="top"></td>
    </tr>
    <tr>
      <td valign="top">throw_errors</td>
      <td valign="top">Boolean</td>
      <td valign="top">true</td>
      <td valign="top"></td>
    </tr>
    <tr>
      <td valign="top">notify_url</td>
      <td valign="top">String<br/>Boolean</td>
      <td valign="top">false</td>
      <td valign="top"></td>
    </tr>
    <tr>
      <td valign="top">events_count</td>
      <td valign="top">Integer</td>
      <td valign="top">100</td>
      <td valign="top"></td>
    </tr>    
  </tbody>
</table>

<br/>Jacket has <i>setup</i> method, that helps to set option values.
```javascript
console.log( Jacket.config );
```


#### 3. Usage examples

Suppose you have a function, that throws an exception:
```javascript
var j = function () {
  return _undefined;
}
```
using [CoffeeScript](http://coffeescript.org):
```CoffeeScript
j = J -> 
  _undefined
```

To get stack trace you might handle error by this way: 

```javascript
var handler = function(err) { /* handle, notify your server about this error */ }
var fn = function () {
  try {
    return _undefined;
  } catch (e) {
    handler(e);
  }
}
```

However, in this case you have a one function call, that supposed to be handled. 
In case you need to handle and notify your server about all exceptions, 
raised by you client side application, you must have an easy way of code' wrapping.  
#### Jacket.js makes it real!

```javascript
var j = Jacket(function () { /* use J instead of Jacket for convenience */
  return _undefined;
});
```


Run
```javascript
j();
```
 
#### Which type of objects can we wrap?
Jacket.js is able to wrap classes, functions and objects. 
After exception handling, it will be thrown on and the script 
execution will be stopped by default. 

##### 3.1. Functions
Let's begin with anonymous functions
```javascript
var anonymous = function(msg) {
  if (!arguments.length) arguments = _undefined;
  console.log(msg);
}
var j = J(anonymous);
console.log(
  j.wrapped, 
  j !== anonymous,
  j()
);
```

Named functions are considered as classes 
and have protected name property, 
that Jacket uses to extend
exception message explanation.
```javascript
function sum(a, b) {
  if (typeof a + typeof b !== 'numbernumber') {
    throw new Error('Invalid arguments');  
  }
  this.result = a + b;
  return this.result;
}

console.log(
  ' - sum constructor: ', J(sum)(1, 1),            
  '\n - sum instance:',  new J(sum)(1, 1)
)

J(sum)('oops!'); // will throw an error         
                                        
console.log('continue...');    // will not be executed 
                               // if J.config.throw_errors is positive

```


As you can see, error message was modified and anonymous function was presented as "anonymous4". 
We can name it! Function will lost its anonymity. How? New function will be created. Yaap...


#### 3.2. Singletons
Imagine that one of your class must be instantiated once, and you want to know if it happens.
Then you can pass Error object to Jacket, and it will do the rest of work.
```javascript
var SingletonConstructor;

(function() {
  
  var instance;
  var crash = new Error('SingletonConstructor was called more than one time');
  
  SingletonConstructor = function() {
    
    if (typeof instance !== 'undefined') {
      J.handle(crash); // throw an error if instance has been already created
      ++instance.callcount;
      return instance;
    }
    
    this.callcount = 1;
    return instance = this;
  
  };
  
})();

new J(SingletonConstructor)(); // will create an instance
console.log( new J(SingletonConstructor)() );
```

##### 3.3. CoffeeScript classes
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

new J(_Class)().defInConst();

console.log('\n - compare theese outputs - \n');

new J(_Class)('call defInConst inside constructor');
```


##### 3.4. Backbone extensions

#### 4. Error handling

##### 4.1. Out of the box
What functionality does it provide in case of error handling?
 - It launches browser' debugger if <i>Jacket.config.use_debugger</i> is positive
 - It outputs error message, stacktrace and callstack to console *
 - It pushes these data to specified url if <i>Jacket.config.notify_url</i> is valid url string
 - It calls your own handler, passing all needed information about an error
 - It can prevent script execution stopping
\* depends on <i>Jacket.config.log_errors</i>, <i>Jacket.config.log_stacktrace</i> and <i>Jacket.config.log_callstack</i> respectively

##### 4.2. Configuring

##### 4.3. Writing own handler
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


#### 5. Additional features


##### 5.1. Callbacks

You can specify a global callback function, 
that should be runned before each return statement of class' methods. 
This callback gets execution scope, class name, method name, 
method arguments and its result as arguments

##### 5.2. Method's protection


```javascript
J(function my(a){return a+1;}, function(scope, name, method, args, result) {
  /* it's usefull to implement Backbone.Events for example */
  console.log(arguments);
})(1);
/* WILL OUTPUT TO CONSOLE */
['[Object object]', 'my', 'constructor', [1], 2]
```
