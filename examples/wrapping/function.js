example("function",

function() {
  var namespace = {};

  namespace.sum = function sum(a, b) {
    if (b == null) {
      b = _undefined; /* this will raise an exception */
    }
    this.result = a + b;
    return this.result;
  };

  log( J(namespace.sum)(1, 1));         // 2
  log(new J(namespace.sum)(1, 1));     // Object {result: 2}

  J(namespace.sum)('oops!');      // sum constructor : _undefined is not defined
                                  //  - at http://localhost:8080/:68:25
  log('I`m here');        /* will not be executed, because exception will be raised */

});

