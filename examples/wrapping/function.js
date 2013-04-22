(function(){

  J.config.notify_url = 'http://localhost:8080/error';

  var namespace = {};

  namespace.sum = function sum(a, b) {
    console.log(b);
    if (!b) {
      b = _undefined; /* this will raise an exception */
    }
    this.result = a + b;
    return this.result;
  };

  console.log(J(namespace.sum)(1, 1));         // 2
  console.log(new J(namespace.sum)(1, 1));     // Object {result: 2}



  J(namespace.sum)('oops!');      // sum constructor : _undefined is not defined
                                  //  - at http://localhost:8080/:68:25

  console.log('I`m here');        /* will not be executed, because exception will be raised */

}).call(this);