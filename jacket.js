(function(){

  root = this;

  var __bind = this.__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = [].slice;

  if ( typeof Object.getPrototypeOf !== "function" ) {
    
    if ( typeof ("a")["__proto__"] === "object" ) {
      Object.getPrototypeOf = function(object){
        return object["__proto__"];
      };

    } else {
      Object.getPrototypeOf = function(object){
        // May break if the constructor has been tampered with
        return object.constructor.prototype;
      };
    }
  }

  var globalEval = function globalEval(src) {
    if (root.execScript) {
        root.execScript(src);
    } else {
      root.eval.call(root,src);
    }
  };
  
  var nativeForEach = Object.getPrototypeOf([]).forEach;

  var idCounter = 0;

  if (typeof this._ === "undefined") {

    this._ = {
        
      each: function(obj, iterator, context) {
        if (typeof obj === "object") {
          if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
          } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
              if (iterator.call(context, obj[i], i, obj) === {}) return;
            }
          } else {
            for (var key in obj) {
              if ({}.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
              }
            }
          }
        }

      },

      isArray: function(obj) {
        return toString.call(obj) == "[object Array]";
      },

      has: function(obj, key) {
        return Object.hasOwnProperty.call(obj, key);
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      }

    };

  }

  var _ = this._;

  Jacket = (function() {

    Jacket.callstack = [];

    Jacket.config = {
      log_errors: true, log_stacktrace: true, log_callstack: true,
      use_debugger: false,
      throw_errors: true,
      notify_url: false
    };

    // try print log in console
    Jacket.log = function() {
      try {
        console.log.apply(console, arguments);
      } catch (e) {}
    };

    // try to print error in console
    Jacket.err = function() {
      try {
        console.error.apply(console, arguments);
      } catch (e) {
        this.log.apply(this, arguments);
      }
    };

    // separate stacktrace with "\n - "
    Jacket.trace = function(stack) {
      return (" - " + stack.slice(1).join("\n - ")).replace(/(\-)+\s{2,}/g, "$1 ");
    };

    Jacket.url = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    // handle error, print it`s content to console and notify server about it
    Jacket.handle = function(err, prefix) {

      var msg = err.message;

      if (typeof prefix === 'string')
        msg = prefix + msg;

      // try to print error via console.error or console.log
      if (this.config.log_errors) {
        this.err(msg);
      }
      
      if (this.config.use_debugger) {
        // create a breakpoint in debugger if it is supported
        try { debugger; } catch (e) {}
      }

      // parse error stacktrace with printStackTrace (http://stacktracejs.com)
      var stack = [];
      _.each(printStackTrace({e:err}), function(call) {
        if (call.match(/eval|_fn_wrapper/) === null) {
          stack.push(call);
        }
      });

      // try to print error stacktrace via console.log
      if (this.config.log_stacktrace) {
        this.log(this.trace(stack));
      }
      
      // try to print callstack
      if (this.config.log_callstack) {
        this.log(this.callstack);
      }

      // send exception data to server
      if (this.config.notify_url) {

        // abort if url is not a valid url
        if (!(typeof this.config.notify_url === "string" && (this.config.notify_url.match(Jacket.url) !== null))) {
          this.err("Jacket.config.notify_url (<" + (typeof this.config.notify_url) + "> " + this.config.notify_url + ") must be a correct url string.");

        } else {
          this.notify({
            date: (new Date()).toString(),
            message: msg,
            stacktrace: stack,
            callstack: this.callstack
          });
        }
      }

      if (typeof this.handler === "function") {
        this.handler(err, msg, stack, this.callstack);
      }

      if (this.config.throw_errors) {
        throw err;
      }

    };

    Jacket.sensor = function (censor) {
      
      return (function () {
        var i = 0;

        return function(key, value) {
          
          if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) {
            return '[Circular]';
          }

          if(i >= 100) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

          ++i; // so we know we aren't using the original object anymore

          return value;
        };

      })(censor);

    };

    // send data to server
    Jacket.notify = function(data) {
      
      var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : window.XMLHttpRequest ? new XMLHttpRequest() : void 0;

      if (xhr) {

        xhr.open("POST", this.config.notify_url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        var json;

        try {
          json = JSON.stringify(data, Jacket.sensor(data));
        } catch (e) {
          
          data.callstack = '[Circular]';
          return Jacket.notify(data);

        }

        xhr.send(json);

      }

      return xhr;
    
    };

    Jacket.protected_methods = [];

    Jacket.protect = function() {

      if (typeof arguments[0] === 'object') {
        
        return Jacket.protect.apply(this, arguments[0]);
      
      } else {

        _.each(arguments, function(method) {
          if (typeof method === 'string') {
            Jacket.protected_methods.push(method);
          }
        });

        return Jacket.protected_methods;

      }
      
    };

    Jacket.callback = null;

    function Jacket(fname, obj, protected_methods, callback) {

      if (typeof fname !== 'string') {
        callback = protected_methods; protected_methods = obj; obj = fname; fname = '';
      }

      if (typeof root._ === "undefined") {
        Jacket.err("Jacket needs underscore.js (http://underscorejs.org) to implement it`s functionality.");
      
      } else {
        
        if (typeof protected_methods === "function") {
          callback = protected_methods;
        }

        if (!_.isArray(protected_methods)) {
          protected_methods = [];
        }

        if (_.isArray(Jacket.protected_methods)) {
          _.each(Jacket.protected_methods, function(method) {
            protected_methods.push(method);
          });
        }

        if (typeof callback === "undefined") {
          callback = Jacket.callback;
        }

        obj = new Jacket.Wearer(obj, callback, protected_methods, fname);
        
      }

      if (this instanceof Jacket) {
        return function() {
          return (typeof obj === 'function') ? new obj(arguments) : obj;
        };
      }
      
      return obj;
      
    }

    return Jacket;

  })();


  Jacket.Wearer = (function() {

    Wearer.members = [];

    function Wearer(origin, callback, protected_methods, fname) {

      var key, type = typeof origin,
        _this = this;

      if ( type === 'object' || type === 'function' ) {

        this.origin = origin;

        this.fname = fname.length ? fname : (origin.name || '');

        this.wrap = this.bind(this.wrap, this);

        this.callback = callback;
        this.protect(protected_methods);
      
        if (!this.fname.length) {

          switch (type) {
            
            case 'function':
              this.fname = _.uniqueId('Anonymous'); break;
            
            default:
              this.fname = _.uniqueId('Unnamed'); break;
            
          }

        }

        if (this.origin.name != false) {
          // origin have non-emtpy name => this is class
          this.wrap_class();
        } else {
          this.wrap_object_or_function();
        }

        for (key in _this.origin) {
          if (_.has(_this.origin, key)) {
            _this.wrapper[key] = _this.wrap(key, _this.origin[key]);
          }
        }

      } else {
        Jacket.handle(new Error('Only functions and objects can wear Jacket'));
      }

      console.log(this.wrapper);

      return this.wrapper;

    }

    Wearer.prototype.bind = function (fn, me) {
      return function(){ return fn.apply(me, arguments); };
    };

    Wearer.prototype.wrap_object_or_function = function() {

      var key, _this = this

      if (typeof this.origin === 'function') {

        this.wrapper = this.wrap('constructor', this.origin, true);

        this.wrapper.prototype = this.origin.prototype;

        _.each(Object.getPrototypeOf(this.wrapper.prototype), function(val, key, proto) {
          if (_.has(proto, key)) {
            _this.wrapper.prototype[key] = _this.wrap(key, val);
          }
        });

      } else {

        this.wrapper = {};

        _.each(this.origin, function(val, key, proto) {
          if (_.has(proto, key)) {
            _this.wrapper[key] = _this.wrap(key, val);
          }
        });

      }

    };

    Wearer.prototype.wrap_class = function() {

      var _wrapper = this, id = _.uniqueId(this.fname),
        fn = this.parse_function(this.origin.toString());

      console.log("Wrapp class", id);

      Jacket.Wearer.members[id] = {scope: _wrapper, origin: this.origin};

      this._constructor = this.wrap('constructor', this.origin, true);
      
      globalEval("Jacket.Wearer.members['" + id + "'].wrapper = (function(_super, _wrapper) {\n  \n  _wrapper.extend(" + this.fname + ", _super, _wrapper);\n  \n  " + this.fname + ".name = \"" + this.fname + "\";\n  \n  function " + this.fname + "() {\n\n    _wrapper._constructor.apply(this, arguments);\n\n    var _self = this; _.each(this, function (val, key) {\n      _self[key] = _wrapper.wrap(key, val);\n    });\n\n  }\n\n  return " + this.fname + ";\n\n})(Jacket.Wearer.members['" + id + "'].origin, Jacket.Wearer.members['" + id + "'].scope);\n");      

      //globalEval("Jacket.Wearer.members['" + id + "'].wrapper = (function(_super, _wrapper) {\n  \n  _wrapper.extend(" + this.fname + ", _super, _wrapper);\n  \n  " + this.fname + ".name = \"" + this.fname + "\";\n  \n  function " + this.fname + "(" + (fn[1].join(", ")) + ") {\n\n    " + fn[0] + "\n\n    var _self = this; _.each(this, function (val, key) {\n      _self[key] = _wrapper.wrap(key, val);\n    });\n\n  }\n\n  return " + this.fname + ";\n\n})(Jacket.Wearer.members['" + id + "'].origin, Jacket.Wearer.members['" + id + "'].scope);\n");

      this.wrapper = Wearer.members[id].wrapper;

      this.wrapper.prototype['wrap'] = this.wrap;

      _.each(Object.getPrototypeOf(this.wrapper.prototype), function(val, key, proto) {
        if (_.has(proto, key)) {
          _wrapper.wrapper.prototype[key] = _wrapper.wrap(key, val);
        }
      });

    };

    Wearer.prototype.protect = function(protected_methods) {
      var _this = this;
      this.protected_methods = {"__super__": 1, "constructor": 1};
      _.each(protected_methods, function(prop) {
        _this.protected_methods[prop] = 1;
      });
      return this.protected_methods;
    };
  
    Wearer.prototype.extend = function(child, parent, context) {
      
      for (var key in parent) {
        if (_.has(parent, key)) {
          child[key] = context.wrap(key, parent[key], child);
        }
      }
      
      function ctor() { this.constructor = child; }
      
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      
      return child;

    };

    Wearer.prototype.parse_function = function(fn) {
      
      var matches = fn.replace(/(\n)/g, "{n}").match(/^function[\s]+[\w]*\(([\w\s,_\$]*)?\)[\s]*\{(.*)\}[\s]*$/);
      var result = [];

      if (matches) {
        if (matches[1]) {
          result = matches[1].match(/((?!=^|,)([\w\$_]))+/g);
        }
        result.unshift(matches[2].replace(/\{n\}/g, "\n"));
      }
      if (result.length > 0) {
        result[0] = "try { " + result[0] + (" \n    } catch (e) { \n      Jacket.handle(e, _wrapper.fname + \".constructor : \"); \n    }");
      }
      result = [result[0], result.slice(1) || []];
      
      return result;
    
    };


    Wearer.prototype.wrap = function(prop, value, force) {
      
      var _this = this;

      if (typeof prop === 'function') {
        value = prop;
        prop = _.uniqueId('anonymous');
      }

      console.log('wrap', typeof this.origin, _this.fname + '.' + prop, '[', typeof value, ']');

      if (force || (typeof value === 'function' && !_.has(value, "wrapped") && !_.has(this.protected_methods, prop) )) {
        
        var _fn_wrapper = function() {

          var log = {scope: _this.fname, method: prop, args: arguments, time: new Date().getTime()};

          try {
            
            /* apply origin class method... */
            log.result = value.apply(this, arguments);

            if (typeof _this.callback === "function") {
              _this.callback((_this.fname || _this.origin), prop, arguments, result);
            }

            Jacket.callstack.push(log);

          } catch (e) {
            Jacket.handle(e, _this.fname + "." + prop + " : ");
          }

          return log.result;

        };

        _fn_wrapper.wrapped = true;

        return _fn_wrapper;

      } else {
        return value;
      }

    };

    return Wearer;

  })();

  if (typeof JSON !== "object") {
    this.JSON = {};
  }

  (function () {

    function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? "0" + n : n;
    }

    if (typeof Date.prototype.toJSON !== "function") {

      Date.prototype.toJSON = function (key) {

        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" +
                f(this.getUTCMonth() + 1) + "-" +
                f(this.getUTCDate())      + "T" +
                f(this.getUTCHours())     + ":" +
                f(this.getUTCMinutes())   + ":" +
                f(this.getUTCSeconds())   + "Z"
            : null;
      };

      String.prototype.toJSON =
        Number.prototype.toJSON  =
        Boolean.prototype.toJSON = function (key) {
          return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "\"" : "\\\"",
        "\\": "\\\\"
      },
      rep;


    function quote(string) {

      escapable.lastIndex = 0;
      return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + "\"" : "\"" + string + "\"";
    }


    function str(key, holder) {



      var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];



      if (value && typeof value === "object" && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }

      if (typeof rep === "function") {
        value = rep.call(holder, key, value);
      }

      switch (typeof value) {
        case "string":
          return quote(value);

        case "number":
          return isFinite(value) ? String(value) : "null";

        case "boolean":
        case "null":

          return String(value);

        case "object":

          if (!value) {
            return "null";
          }

          gap += indent;
          partial = [];


          if (Object.prototype.toString.apply(value) === "[object Array]") {

            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || "null";
            }

            v = (partial.length === 0) ? "[]" : (gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]");
            gap = mind;
            return v;
          }

          if (rep && typeof rep === "object") {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              if (typeof rep[i] === "string") {
                k = rep[i];
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ": " : ":") + v);
                }
              }
            }
          } else {

            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ": " : ":") + v);
                }
              }
            }
          }

          v = (partial.length === 0) ? "{}" : ( gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}");
          gap = mind;
          return v;

        }
    }

    if (typeof JSON.stringify !== "function") {
      JSON.stringify = function (value, replacer, space) {

        var i;
        gap = "";
        indent = "";

        if (typeof space === "number") {
          for (i = 0; i < space; i += 1) {
              indent += " ";
          }

        } else if (typeof space === "string") {
          indent = space;
        }

        rep = replacer;
        if (replacer && typeof replacer !== "function" &&
              (typeof replacer !== "object" ||
              typeof replacer.length !== "number")) {
          throw new Error("JSON.stringify");
        }

        return str("", {"": value});
      };
    }

    if (typeof JSON.parse !== "function") {
      JSON.parse = function (text, reviver) {

        var j;

        function walk(holder, key) {

          var k, v, value = holder[key];
          if (value && typeof value === "object") {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }

        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
          text = text.replace(cx, function (a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
         });
        }

        if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {

          j = eval("(" + text + ")");

          return typeof reviver === "function" ? walk({"": j}, "") : j;
        }

        throw new SyntaxError("JSON.parse");
      };
    }

  }());


  if (typeof printStackTrace === "undefined") {
    
    printStackTrace = function printStackTrace(options) {
        var ex = options.e || null;
        var p = new printStackTrace.implementation();
        return p.run(ex);
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = printStackTrace;
    }

    printStackTrace.implementation = function() {
    };

    printStackTrace.implementation.prototype = {

        run: function(ex, mode) {
            ex = ex || this.createException();
            mode = mode || this.mode(ex);
            if (mode === "other") {
                return this.other(arguments.callee);
            } else {
                return this[mode](ex);
            }
        },

        createException: function() {
            try {
                this.undef();
            } catch (e) {
                return e;
            }
        },

        mode: function(e) {
            if (e["arguments"] && e.stack) {
                return "chrome";
            } else if (e.stack && e.sourceURL) {
                return "safari";
            } else if (e.stack && e.number) {
                return "ie";
            } else if (typeof e.message === "string" && typeof window !== "undefined" && window.opera) {
                if (!e.stacktrace) {
                    return "opera9";
                }
                if (e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
                    return "opera9";
                }
                if (!e.stack) {
                    return "opera10a";
                }
                if (e.stacktrace.indexOf("called from line") < 0) {
                    return "opera10b";
                }
                return "opera11";
            } else if (e.stack) {
                return "firefox";
            }
            return "other";
        },

        chrome: function(e) {
            var stack = (e.stack + "\n").replace(/^\S[^\(]+?[\n$]/gm, "").
              replace(/^\s+(at eval )?at\s+/gm, "").
              replace(/^([^\(]+?)([\n$])/gm, "{anonymous}()@$1$2").
              replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, "{anonymous}()@$1").split("\n");
            stack.pop();
            return stack;
        },

        safari: function(e) {
            return e.stack.replace(/\[native code\]\n/m, "")
                .replace(/^(?=\w+Error\:).*$\n/m, "")
                .replace(/^@/gm, "{anonymous}()@")
                .split("\n");
        },

        ie: function(e) {
            var lineRE = /^.*at (\w+) \(([^\)]+)\)$/gm;
            return e.stack.replace(/at Anonymous function /gm, "{anonymous}()@")
                .replace(/^(?=\w+Error\:).*$\n/m, "")
                .replace(lineRE, "$1@$2")
                .split("\n");
        },

        firefox: function(e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, "").replace(/^[\(@]/gm, "{anonymous}()@").split("\n");
        },

        opera11: function(e) {
            var ANON = "{anonymous}", lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split("\n"), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var location = match[4] + ":" + match[1] + ":" + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + "@" + location + " -- " + lines[i + 1].replace(/^\s+/, ""));
                }
            }

            return result;
        },

        opera10b: function(e) {
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split("\n"), result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[1]? (match[1] + "()") : "global code";
                    result.push(fnName + "@" + match[2] + ":" + match[3]);
                }
            }

            return result;
        },

        opera10a: function(e) {
          
            var ANON = "{anonymous}", lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split("\n"), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + "()@" + match[2] + ":" + match[1] + " -- " + lines[i + 1].replace(/^\s+/, ""));
                }
            }

            return result;
        },

        opera9: function(e) {
            var ANON = "{anonymous}", lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split("\n"), result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(ANON + "()@" + match[2] + ":" + match[1] + " -- " + lines[i + 1].replace(/^\s+/, ""));
                }
            }

            return result;
        },

        other: function(curr) {
            var ANON = "{anonymous}", fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
            while (curr && curr["arguments"] && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                args = Array.prototype.slice.call(curr["arguments"] || []);
                stack[stack.length] = fn + "(" + this.stringifyArguments(args) + ")";
                curr = curr.caller;
            }
            return stack;
        },

        stringifyArguments: function(args) {
            var result = [];
            var slice = Array.prototype.slice;
            for (var i = 0; i < args.length; ++i) {
                var arg = args[i];
                if (arg === undefined) {
                    result[i] = "undefined";
                } else if (arg === null) {
                    result[i] = "null";
                } else if (arg.constructor) {
                    if (arg.constructor === Array) {
                        if (arg.length < 3) {
                            result[i] = "[" + this.stringifyArguments(arg) + "]";
                        } else {
                            result[i] = "[" + this.stringifyArguments(slice.call(arg, 0, 1)) + "..." + this.stringifyArguments(slice.call(arg, -1)) + "]";
                        }
                    } else if (arg.constructor === Object) {
                        result[i] = "#object";
                    } else if (arg.constructor === Function) {
                        result[i] = "#function";
                    } else if (arg.constructor === String) {
                        result[i] = "\"" + arg + "\"";
                    } else if (arg.constructor === Number) {
                        result[i] = arg;
                    }
                }
            }
            return result.join(",");
        }

      };

      this.printStackTrace = printStackTrace;

  }

  if (typeof module !== "undefined" && module.exports) {
    Jacket.is_node = true;
    module.exports = Jacket;
  }

  if (typeof define !== void 0) {
    try {
      define(function() {
        return Jacket;
      });
    } catch (_error) {}
  }

  this.Jacket = this.J = Jacket;
  return Jacket;

}).call(this);
