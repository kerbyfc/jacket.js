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

    Jacket.is_node = (typeof module !== "undefined" && module.exports)

    Jacket.callstack = [];

    Jacket.config = {
      log_errors: true, log_stacktrace: true, log_callstack: false,
      use_debugger: false,
      throw_errors: true,
      notify_url: false,
      events_count: 100
    };

    Jacket.startTime = (new Date).getTime()

    Jacket.wearers = {}

    Jacket.events = []

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
        if (call.match(/eval|_fn_wrapper|(jacket[\.\w]*.js)/) === null) {
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
      if (this.config.notify_url && !this.is_node) {

        // abort if url is not a valid url
        if (!(typeof this.config.notify_url === "string" && (this.config.notify_url.match(Jacket.url) !== null))) {
          this.err("Jacket.config.notify_url (<" + (typeof this.config.notify_url) + "> " + this.config.notify_url + ") must be a correct url string.");

        } else {
          this.notify({
            date: (new Date()).toString(),
            moment: this.moment(),
            events: this.events,
            message: msg,
            stacktrace: stack,
            callstack: this.callstack,
            browser : this.navigator.userAgent
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
          if (i >= 200)
            return '[Unknown]';
          ++i;
          return value;
        };
      })(censor);
    };

    Jacket.moment = function() {
      return ((new Date()).getTime() - this.startTime) / 1000;
    };

    Jacket.logEvent = function (elem, event) {
      if (elem.addEventListener) {
        elem.addEventListener(event, Jacket.pushEvent, false);
      } else {
        elem.attachEvent("on" + event, function() {
          return(Jacket.pushEvent.call(elem, window.event));   
        });
      }
    };

    Jacket.getNodePath = function(node) {
      var info = node.nodeName
      if (node.id) {
        info += "#" + node.id;
      }
      if (node.className) {
        info += "." + node.className;
      }
      return info;
    };

    Jacket.pushEvent = function(event) {
      Jacket.events.unshift({
        type: event.type,
        node: Jacket.getNodePath( event.target ),
        moment: Jacket.moment(),
        time: (new Date())
      });
    };

    // send data to server
    Jacket.notify = function(data) {
      
      var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : window.XMLHttpRequest ? new XMLHttpRequest() : void 0;

      if (xhr) {

        xhr.open("POST", this.config.notify_url, true);
        xhr.setRequestHeader( "Content-type", "applcation/json" );

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

    Jacket.construct = function(constructor, args) {
      var construct = function() {
        return constructor.apply(this, args);
      }
      construct.prototype = constructor.prototype;
      return new construct();
    }

    Jacket.callback = null;

    function Jacket(fname, obj, extentions, methods, callback) {

      if (typeof root._ === "undefined") {
        Jacket.err("Jacket needs underscore.js (http://underscorejs.org) to implement it`s functionality.");
      
      } else {

        if (typeof fname !== 'string') {
          callback = methods; methods = extentions; extentions = obj, obj = fname; fname = '';
        }

        if (typeof extentions !== 'object') {
          methods = extentions;
          extentions = false;
        }
        
        if (typeof callback !== "function" && typeof methods === 'function') {
          callback = methods;
          methods = [];
        }

        if (_.isArray(Jacket.methods)) {
          _.each(Jacket.protected_methods, function(method) {
            methods.push(method);
          });
        }

        if (typeof callback === "undefined") {
          callback = Jacket.callback;
        }

        obj = new Jacket.Wearer(obj, extentions, callback, methods, fname);
        
      }

      if (this instanceof Jacket) {
        return function() {
          return (typeof obj === 'function') ? Jacket.construct(obj, arguments) : obj;
        };
      } else {
        return obj;  
      }
      
    }

    return Jacket;

  })();

  Jacket.logEvent(window, "load");
  Jacket.logEvent(document.body, "click");

  Jacket.Wearer = (function() {

    Wearer.members = [];

    function Wearer(origin, extentions, callback, protected_methods, fname) {

      var key, type = typeof origin,
        _this = this;

      if ( type === 'object' || type === 'function' ) {

        this.origin = origin;
        this.extentions = extentions;

        this.fname = (typeof fname === 'string' && fname.length) ? fname : (origin.name || '');

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
          // this.wrap_class();
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

      var _wrapper = this, id = _.uniqueId(this.fname);
        // fn = this.parse_function(this.origin.toString());

      this._constructor = this.wrap('constructor', this.origin, true);

      if (this.extentions && _.has(this.extentions, 'constructor')) {
        var __super__ = this._constructor.prototype;
        this._constructor = this.wrap('constructor', this.extentions.constructor, true);  
        this._constructor.__super__ = __super__;
      }

      Jacket.wearers[id] = {scope: _wrapper, origin: this.origin};

      this.cname = this.fname.substring(this.fname.lastIndexOf('.') + 1);

      _class = "Jacket.wearers['" + id + "'].wrapper = " + ( this.fname !== this.cname ? this.fname + ' = ' : '') + "(function(_super, jacket) {\n\n  jacket.extend(" + this.cname + ", _super, jacket);\n  \n  " + this.cname + ".name = \"" + this.cname + "\";\n  \n  function " + this.cname + "() {\n\n    " + ( this.extentions ?  "this.__super__ = jacket._constructor.__super__;" : "") +  "jacket.do_wraps(jacket.extentions, this);\n    result = jacket._constructor.apply(this, Array.prototype.slice.call(arguments));\n\n    var _self = this; _.each(this, function (val, key) {\n      _self[key] = jacket.wrap(key, val);\n    });\n\n    return result;\n  }\n\n  return " + this.cname + ";\n\n})(Jacket.wearers['" + id + "'].origin, Jacket.wearers['" + id + "'].scope);\n";
      
      globalEval(_class);      

      this.wrapper = Jacket.wearers[id].wrapper;

      _.each(Object.getPrototypeOf(this.wrapper.prototype), function(val, key, proto) {
        if (_.has(proto, key)) {
          _wrapper.wrapper.prototype[key] = _wrapper.wrap(key, val);
        }
      });

    };

    Wearer.prototype.do_wraps = function(origin, target) {
      var _this = this;
      for (key in origin) {
          if (_.has(origin, key)) {
            target[key] = _this.wrap( key, origin[key] );
          }
        }
    }

    Wearer.prototype.protect = function(protected_methods) {
      var _this = this;
      this.protected_methods = {"__super__": 1, "constructor": 1};
      _.each(protected_methods, function(prop) {
        _this.protected_methods[prop] = 1;
      });
      return this.protected_methods;
    };
  
    Wearer.prototype.extend = function(child, parent, context) {
      
      if (!context) {
        context = Jacket.Wearer.prototype;
      }
      
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

    // Wearer.prototype.parse_function = function(fn) {
      
    //   var matches = fn.replace(/(\n)/g, "{n}").match(/^function[\s]+[\w]*\(([\w\s,_\$]*)?\)[\s]*\{(.*)\}[\s]*$/);
    //   var result = [];

    //   if (matches) {
    //     if (matches[1]) {
    //       result = matches[1].match(/((?!=^|,)([\w\$_]))+/g);
    //     }
    //     result.unshift(matches[2].replace(/\{n\}/g, "\n"));
    //   }
    //   if (result.length > 0) {
    //     result[0] = "try { " + result[0] + (" \n    } catch (e) { \n      Jacket.handle(e, _wrapper.fname + \".constructor : \"); \n    }");
    //   }
    //   result = [result[0], result.slice(1) || []];
      
    //   return result;
    
    // };


    Wearer.prototype.wrap = function(prop, value, force) {
      
      var _this = this;

      if (typeof prop === 'function') {
        value = prop;
        prop = _.uniqueId('anonymous');
      }

      // console.log('wrap', typeof this.origin, _this.fname + '.' + prop, '[', typeof value, ']');

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

  if (typeof printStackTrace === "undefined") {
    
    printStackTrace = function printStackTrace(options) {
        var ex = options.e || null;
        var p = new printStackTrace.implementation();
        return p.run(ex);
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = printStackTrace;
    }

    printStackTrace.implementation = function() {};

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

  if (Jacket.is_node) {
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