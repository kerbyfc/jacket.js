(function(){

  root = this;

  // Основной класс
  Jacket = (function() {

    /*
      определяем окружение
      чтобы не дергать некоторые куски функционала при использовании на бэкенде
    */
    Jacket.is_node = (typeof module !== "undefined" && module.exports);

    /*
      Массив, хранящий информацию о вызовах обёрнутых функций
    */
    Jacket.callstack = [];

    /*
      Настройки Jacket'а, в основном флаги
      Jacket не надо сильно настраивать
      Гибкость в свободе действий, а не в куче настроек... или я не прав? :)
    */
    Jacket.config = {

      /*
        Вывод инфомрации об ошибках в консоль через сonsole.error или console.log (ie9+)
      */
      log_errors: true,

      /*
        Вывод трассировки стека в консоль
      */
      log_stacktrace: true,

      /*
        Вывод стека вызовов в консоль
      */
      log_callstack: false,

      /*
        Пробовать запускать отладчик браузера при возникновении ошибки
        Поддерживается только "модными" браузерами
      */
      use_debugger: false,
      
      /*
        Прокидывать исключения дальше после их обработки
      */
      throw_errors: true,

      /*
        url-адрес, на который будут уходить POST запросы
        со всей полезной инфой в формате JSON
        url к errbit'у (к примеру)
      */
      notify_url: false,

      /*
        кол-во последних запоминаемых событий пользователя
      */
      events_count: 100
    };

    /*
      Фиксация веремени начала исполнения
      Да, именно сдесь!
    */
    Jacket.startTime = new Date().getTime();

    /*
      Пул ссылок на оригинальные объекты классов
    */
    Jacket.wearers = {};

    /*
      История "тыков" пользователя
      Отправляется на аудит вместе с информацией об ошибке и трассировкой
    */
    Jacket.events = [];

    /*
      Заглушки для старых и странных браузеров (ie)
    */
    Jacket.log = function() {
      try {
        console.log.apply(console, arguments);
      } catch (e) {}
    };

    Jacket.err = function() {
      try {
        console.error.apply(console, arguments);
      } catch (e) {
        this.log.apply(this, arguments);
      }
    };

    /*
      Хуманизируем вывод трэйса
      делаем отступы, маркируем
    */
    Jacket.trace = function(stack) {
      return (" - " + stack.slice(1).join("\n - ")).replace(/(\-)+\s{2,}/g, "$1 ");
    };

    /*
      Храним url паттерн
    */
    Jacket.url_pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    /*
      Основная функция обработки ошибок принимает на себя все удары судьбы
    */
    Jacket.handle = function(err, prefix) {

      /*
        Cохраним в отдельную переменную
        Только объекты передаются по ссылке
        Можно дополнять текст сообщения в собсвтвенном обработчике (Jacket.handler)
        если менять err.message, но не msg
      */
      var msg = err.message;

      /*
        Можем дополнить описание ошибки
        передав 2 параметр
        по умолчанию используется Jacket'ом
      */
      if (typeof prefix === 'string')
        msg = prefix + msg;

      /*
        Узреваем ошибки в консоле
      */
      if (this.config.log_errors) {
        this.err(msg);
      }
      
      /*
        не у всех браузеров есть дебагер
        я использую исключительно в режиме отладки
      */
      if (this.config.use_debugger) {
        try {
          debugger;
        } catch (e) {}
      }

      /*
        Не показываем строки трейса, касающиеся Jacket'а
        Это излишки информации, забивающие логи
      */
      var stack = [];
      _.each(printStackTrace({e:err}), function(call) {
        if (call.match(/eval|_fn_wrapper|(jacket[\.\w]*.js)/) === null) { // TODO _fn_wrapper O_o ?
          stack.push(call);
        }
      });

      /*
        Выводим трассировку в виде строки только в консоль
        На сервер будем передавать массив
      */
      if (this.config.log_stacktrace) {
        this.log(this.trace(stack));
      }
      
      /*
        Может кому пригодится...
      */
      if (this.config.log_callstack) {
        this.log(this.callstack);
      }

      /*
        Если пользуем браузер (а не node.js) и настроен валидный адрес сервера
      */
      if (this.config.notify_url && !this.is_node) {

        if (!(typeof this.config.notify_url === "string" && (this.config.notify_url.match(Jacket.url_pattern) !== null))) {
          this.err("Jacket.config.notify_url is invalid");

        } else {

          /*
            Отправим все необходимое
          */
          this.notify({

            /*
              дата в виде строки
              ну сами понимаете - полезная инфа
            */
            date: (new Date()).toString(),
            
            /*
              миллисикунд со старта (отсчет не от события window.onload)
              что-то может случиться еще до старта
            */
            moment: this.moment(),

            /*
              по умолчанию фиксируются 2 события:
                - window.onload
                - все клики пользователя с исчерпывающей информацией
            */
            events: this.events,

            /*
              текст ошибки
            */
            message: msg,

            /*
              трассировка стека
              пожалуй самый исчерпывающий кусок инфы
              передается на сервер в виде массива а не в виде строки
            */
            stacktrace: stack,

            /*
              стек вызовов обёрнутых методов
              конечно больше пользы будет если
              покрытие Jacket'ом кода приложения будет максимально
              Отсюда можно черпать передаваемые параметры и результаты
              выполнения обернутых методов... Тя-Тя-Тя
            */
            callstack: this.callstack,

            /*
              Куда же без этого :)
            */
            browser : this.navigator.userAgent

          });
        }
      }

      /*
        Пока мы не имеет информации о том, окончательно ли пользователь
        обработал данное исключение
      */
      var handled = false;

      /*
        Если пользователь определил кастомный обработчик - дергаем
        Здесь можно определять какие ошибки будут прокинуты дальше
        Если возвращать true в обработчике, всплытия не произойдет
      */
      if (typeof this.handler === "function") {
        handled = this.handler(err, msg, stack, this.callstack);
      }

      /*
        Прокидаваем исключение дальше если необходимо
        В связи с тем что сообщение об ошибке дополняется полезной информацией
        каждый раз, когда используется данный обработчик
        можно получить очень довольно подробное описание места трагедии
      */
      if (this.config.throw_errors && !handled) {
        throw err;
      }

    };

    /*
      Вспомогательная фунция, детектирующая и предотвращающая
      зацикливание алгоритма при встрече с циклическими ссылками
      Используется при формирвоании JSON-строк
    */
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
      var info = node.nodeName;
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

    Jacket.construct = function(constructor, args, a) {

      a = [];

      a.push(function() {
          return constructor.apply(this, args);
      });

      a[0].prototype = constructor.prototype;

      return new a[0]();

    };

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
        } else {
          extentions = _.extend({}, extentions);
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
        
      }

      if (this instanceof Jacket) {

        return function() {
          obj = new Jacket.Wearer(obj, extentions, callback, methods, fname, true );
          return (typeof obj === 'function') ? Jacket.construct(obj, arguments) : obj;
        };

      } else {
        return new Jacket.Wearer(obj, extentions, callback, methods, fname, _.has(extentions, 'constructor') );
      }
      
    }

    return Jacket;

  })();

  Jacket.logEvent(window, "load");
  Jacket.logEvent(document.body, "click");

  Jacket.Wearer = (function() {

    Wearer.members = [];

    function Wearer(origin, extentions, callback, protected_methods, fname, instantiatable) {

      var key, type = typeof origin,
        _this = this;

      instantiatable = instantiatable || fname;

      if ( type === 'object' || type === 'function' ) {

        this.origin = origin;
        this.extentions = extentions;

        this.fname = (typeof fname === 'string' && fname.length) ? fname : (origin.name || '');

        this.wrap = this.bind(this.wrap, this);

        this.callback = callback;
        this.protect(protected_methods);
      
        if (!this.fname.length) {
          this.fname = _.uniqueId(origin.constructor.name);

        }

        /*
          если это именованная функция или
          мы вызываем через new
          будет создан новый класс
        */
        if (instantiatable || (_.keys(this.origin.prototype || Object.getPrototypeOf(this.origin)).length) || origin.name) {
          this.wrap_class();
        
        /*
          в противном случае обернутся
          создавать новый класс мы не будем
        */
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

      return this.wrapper;

    }

    Wearer.prototype.bind = function (fn, me) {
      return function(){ return fn.apply(me, arguments); };
    };

    Wearer.prototype.wrap_object_or_function = function() {

      var key, _this = this;

      if (typeof this.origin === 'function') {

        console.log(" >>> ", _this.extensions);

        console.log("WRAP FUNCTION", this.fname, {origin:this.origin}, this.extensions);

        this.wrapper = this.wrap('constructor', this.origin, true);

        console.log("FUNC", this.wrapper);

        console.log('ORIGIN', this.origin);

        _.each(this.origin, function(val, key, proto) {
          console.log(" ++ ", key, val);
          if (_.has(proto, key)) {
            _this.wrapper[key] = _this.wrap(key, val);
          }
        });

        if (this.extensions) {
          _.each(this.extensions, function(val, key, proto) {
          console.log(" -- ", key, val);
          if (_.has(proto, key)) {
            _this.wrapper[key] = _this.wrap(key, val);
          }
        });
        }

      } else {

        console.log("WRAP OBJECT", this.origin, this.extensions);

        this.wrapper = {};

        _.each(_.extend({}, this.origin, this.extensions), function(val, key, proto) {
          if (_.has(proto, key)) {
            _this.wrapper[key] = _this.wrap(key, val);
          }
        });

      }

    };

    Wearer.prototype.wrap_class = function() {

      console.log("WRAP CLASS", this.fname);

      var _wrapper = this, id = _.uniqueId(this.fname);

      if (this.extentions && _.has(this.extentions, 'constructor')) {
        this.extentions[this.fname] = this.extentions.constructor;
        delete this.extentions.constructor;
        this._constructor = this.wrap('constructor', this.extentions[this.fname], true);
      } else {
        this._constructor = this.wrap('constructor', this.origin, true);
      }

      this._constructor.__super__ = this.origin.prototype;

      Jacket.wearers[id] = {scope: _wrapper, origin: this.origin};

      this.cname = this.fname.substring(this.fname.lastIndexOf('.') + 1);

      _class = "Jacket.wearers['" + id + "'].wrapper = " + ( this.fname !== this.cname ? this.fname + ' = ' : '') + "(function(_super, jacket) {\n\n  jacket.extend(" + this.cname + ", _super, jacket);\n  \n  " + this.cname + ".name = \"" + this.cname + "\";\n  \n  function " + this.cname + "() {\n\n    " + ( this.extentions ?  "jacket.do_wraps(jacket.extentions, this);\n    " : "") +  "this.__super__ = jacket._constructor.__super__;\n\n    var result = jacket._constructor.apply(this, Array.prototype.slice.call(arguments));\n\n    var _self = this; _.each(this, function (val, key) {\n      _self[key] = jacket.wrap(key, val);\n    });\n\n    return result;\n  }\n\n  return " + this.cname + ";\n\n})(Jacket.wearers['" + id + "'].origin, Jacket.wearers['" + id + "'].scope);\n";
      
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
      for (var key in origin) {
          if (_.has(origin, key)) {
            target[key] = _this.wrap( key, origin[key] );
          }
        }
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
              _this.callback((_this.fname || _this.origin), prop, arguments, log.result);
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

  // Кроссбраузерная реализация getPrototypeOf (John Resig)
  if ( typeof Object.getPrototypeOf !== "function" ) {
  
    if ( typeof ("a")["__proto__"] === "object" ) {
      Object.getPrototypeOf = function(object){
        return object["__proto__"];
      };

    } else {
      Object.getPrototypeOf = function(object){
        return object.constructor.prototype;
      };
    }
  }

  var globalEval = function globalEval(src) {
    if (root.execScript) {
        root.execScript(src);
    } else {
      root['eval'].call(root, src);
    }
  };

  var nativeForEach = Object.getPrototypeOf([]).forEach;
  var idCounter = 0;

  // используются некоторые методы underscore
  if (typeof root._ === "undefined") {

    root._ = {
        
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

      keys: Object.keys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
        return keys;
      },

      uniqueId: function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      extend: function(obj) {
        _.each(slice.call(arguments, 1), function(source) {
          if (source) {
            for (var prop in source) {
              obj[prop] = source[prop];
            }
          }
        });
        return obj;
      }

    };

  }

  var _ = root._;

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

  root.Jacket = root.J = Jacket;
  return Jacket;

}).call(this);