/*
  Jacket.js 1.0.0
  (c) 2010-2013 kerbyfc@gmail.com
  http://github.com/kerbyfc/jacket.js
 */

(function () {

  var root = this,
    mod = typeof module,
    printStackTrace,
    pst = typeof printStackTrace,
    define,
    is_node = mod !== 'undefined' && module.exports,
    ArrayProto = Object.getPrototypeOf([]),
    nativeForEach = ArrayProto.forEach,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    slice = Array.prototype.slice,
    objConst = Object,
    idCounter = 0,
    emptyObj = {},
    Tracer,
    Jacket,
    Wearer,
    _;

  // используются некоторые методы underscore
  if (root._ === undefined) {

    root._ = {

      each: function (obj, iterator, context) {
        var i, l, key;
        if (typeof obj === "object") {
          if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
          } else if (obj.length === +obj.length) {
            for (i = 0, l = obj.length; i < l; i++) {
              if (iterator.call(context, obj[i], i, obj) === emptyObj) { return; }
            }
          } else {
            for (key in obj) {
              if (_.has(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === emptyObj) { return; }
              }
            }
          }
        }
      },

      isArray: function (obj) {
        return {}.toString.call(obj) === "[object Array]";
      },

      indexOf: function (array, item) {
        if (array === null) { return -1; }
        var i = 0,
          l = array.length;
        if (nativeIndexOf && array.indexOf === nativeIndexOf) {
          return array.indexOf(item);
        }
        for (i; i < l; i++) {
          if (array[i] === item) { return i; }
        }
        return -1;
      },

      lastIndexOf: function (array, item, from) {
        if (array === null) { return -1; }
        var hasIndex = from !== null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
          return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--) {
          if (array[i] === item) { return i; }
        }
        return -1;
      },

      has: function (obj, key) {
        return Object.hasOwnProperty.call(obj, key);
      },

      keys: Object.keys || function (obj) {
        var key;
        if (obj !== objConst(obj)) {
          throw new TypeError('Invalid object');
        }
        var keys = [];
        for (key in obj) {
          if (_.has(obj, key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function (prefix) {
        var id = (++idCounter).toString();
        return prefix ? prefix + id : id;
      },

      extend: function (obj) {
        _.each(slice.call(arguments, 1), function (source) {
          var prop;
          if (source) {
            for (prop in source) {
              obj[prop] = source[prop];
            }
          }
        });
        return obj;
      },

      bind: function (fn, me) {
        return function () {
          return fn.apply(me, arguments);
        };
      }

    };
  }

  _ = root._;

  // Кроссбраузерная реализация getPrototypeOf (John Resig)
  if (typeof Object.getPrototypeOf !== "function") {
    var proto = '__proto__';
    if (typeof ("a")[proto] === "object") {
      Object.getPrototypeOf = function (object) {
        return object[proto];
      };
    } else {
      Object.getPrototypeOf = function (object) {
        return object.constructor.prototype;
      };
    }
  }

  var globalEval = function globalEval(src) {
    var ex = "execScript", ev = "eval", _eval = root[ev];
    if (root[ex]) {
      root[ex](src);
    } else {
      _eval.call(root, src);
    }
  };

  if (pst === 'undefined') {

    printStackTrace = function printStackTrace(options) {
      var ex = options.e || null;
      var p = new printStackTrace.implementation();
      return p.run(ex);
    };

    printStackTrace.implementation = function () {};

    printStackTrace.implementation.prototype = {

      run: function (ex, mode) {
        var callee = 'callee',
          _ex = ex || this.createException(),
          _mode = mode || this.mode(_ex);
        return (_mode === "other") ? this.other(arguments[callee]) : this[_mode](_ex);
      },

      createException: function () {
        try {
          this.undef();
        } catch (e) {
          return e;
        }
      },

      mode: function (e) {
        var br = null;
        if (e["arguments"] && e.stack) {
          br = "chrome";
        } else if (e.stack && e.sourceURL) {
          br = "safari";
        } else if (e.stack && e.number) {
          br = "ie";
        } else if (typeof e.message === "string" && root.opera) {
          if (!e.stacktrace) {
            br = "opera9";
          }
          if (e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
            br = "opera9";
          }
          if (!e.stack) {
            br = "opera10a";
          }
          if (e.stacktrace.indexOf("called from line") < 0) {
            br = "opera10b";
          }
          br = "opera11";
        } else if (e.stack) {
          br = "firefox";
        } else {
          br = "other";
        }
        return br;
      },

      chrome: function (e) {
        var stack = (e.stack + "\n").replace(new RegExp("^\\S[^\\(]+?[\\n$]", "gm"), "").
          replace(new RegExp("^\\s+(at eval )?at\\s+", "gm"), "").
          replace(new RegExp("^([^\\(]+?)([\\n$])", "gm"), "{anonymous}()@$1$2").
          replace(new RegExp("^Object.<anonymous>\\s*\\(([^\\)]+)\\)", "gm"), "{anonymous}()@$1").split("\n");
        stack.pop();
        return stack;
      },

      safari: function (e) {
        return e.stack.replace(/\[native code\]\n/m, "")
          .replace(new RegExp("^(?=\\w+Error\\:).*$\\n", "m"), "")
          .replace(new RegExp("^@", "gm"), "{anonymous}()@")
          .split("\n");
      },

      ie: function (e) {
        var lineRE = new RegExp("^.*at (\\w+) \\(([^\\)]+)\\)$", "gm");
        return e.stack.replace(/at Anonymous function /gm, "{anonymous}()@")
          .replace(new RegExp("^(?=\\w+Error\\:).*$\\n", "m"), "")
          .replace(lineRE, "$1@$2")
          .split("\n");
      },

      firefox: function (e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, "").replace(/^[\(@]/gm, "{anonymous}()@").split("\n");
      },

      opera11: function (e) {
        var ANON = "{anonymous}",
          lineRE = new RegExp("^.*line (\\d+), column (\\d+)(?: in (.+))? in (\\S+):$"),
          lines = e.stacktrace.split("\n"),
          result = [],
          len,
          i;

        for (i = 0, len = lines.length; i < len; i += 2) {
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

      opera10b: function (e) {
        var lineRE = new RegExp("^(.*)@(.+):(\\d+)$"),
          lines = e.stacktrace.split("\n"),
          result = [],
          len,
          i;
        for (i = 0, len = lines.length; i < len; i++) {
          var match = lineRE.exec(lines[i]);
          if (match) {
            var fnName = match[1] ? (match[1] + "()") : "global code";
            result.push(fnName + "@" + match[2] + ":" + match[3]);
          }
        }

        return result;
      },

      opera10a: function (e) {

        var ANON = "{anonymous}",
          lineRE = new RegExp("Line (\\d+).*script (?:in )?(\\S+)(?:: In function (\\S+))?$", "i"),
          lines = e.stacktrace.split("\n"),
          result = [],
          len,
          i;

        for (i = 0, len = lines.length; i < len; i += 2) {
          var match = lineRE.exec(lines[i]);
          if (match) {
            var fnName = match[3] || ANON;
            result.push(fnName + "()@" + match[2] + ":" + match[1] + " -- " + lines[i + 1].replace(/^\s+/, ""));
          }
        }

        return result;
      },

      opera9: function (e) {
        var ANON = "{anonymous}",
          lineRE = new RegExp("Line (\\d+).*script (?:in )?(\\S+)", "i"),
          lines = e.message.split("\n"),
          result = [],
          len,
          i;

        for (i = 2, len = lines.length; i < len; i += 2) {
          var match = lineRE.exec(lines[i]);
          if (match) {
            result.push(ANON + "()@" + match[2] + ":" + match[1] + " -- " + lines[i + 1].replace(/^\s+/, ""));
          }
        }

        return result;
      },

      other: function (curr) {
        var ANON = "{anonymous}",
          fnRE = /function\s*([\w\-$]+)?\s*\(/i,
          stack = [],
          maxStackSize = 10,
          args,
          fn;

        while (curr && curr["arguments"] && stack.length < maxStackSize) {
          fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
          args = Array.prototype.slice.call(curr["arguments"] || []);
          stack[stack.length] = fn + "(" + this.stringifyArguments(args) + ")";
          curr = curr.caller;
        }
        return stack;
      },

      stringifyArguments: function (args) {
        var result = [], i;
        for (i = 0; i < args.length; ++i) {
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

    root.printStackTrace = printStackTrace;
  }

  /**
   * Основной класс
   * @return {function} замыкание возвращает класс
   */
  Jacket = function Jacket() {

    /*
      храним в локальном контексте для использования в фабрике
     */
    var option, passed, a = arguments;

    /*
      используется некоторое количество выдранных из underscore методов
      если underscore не цепляли или сам underscore
     */
    if (root._ === undefined) {
      return Jacket.err("Jacket needs underscore.js (http://underscorejs.org) to implement it`s functionality.");
    }

    a = Jacket.args.apply(this, Array.prototype.slice.call(Jacket.Helpers.isArguments(a[0]) ? a[0] : a));

    /*
      можно передать группу параметров 3-им аргументом - J ( <name>, origin, <options> )
      они окажутся в объекте extensions
      вытаскиваем их оттуда
     */
    for (option in Jacket.defaults) {

      /*
        если объект extensions имеет таки аргумент
       */
      if (_.has(a.extensions, option)) {

        /*
          если пользователь не передал таки аргумент (установлено значение по умолчанию)
         */
        if (a[option] === Jacket.defaults[option]) {
          _.extend(a, a.extensions[option]);
        }

        /*
          в любом случае это свойство необходимо убрать из extensions
         */
        delete a.extensions[option];

      }
    }

    /*
      если после всех махинаций расширение оказалось пустым объектом - сетим в false
     */
    if (typeof a.extensions === 'object' && _.keys(a.extensions).length === 0) {
      a.extensions = false;
    }

    /*
      когда используем вызов через new - new Jacket( class, args... )<(arguments)>
     */
    if (this instanceof Jacket) {
      /*
        возвращаем фабрику
       */
      return function () {
        /*
          добавляем к параметром arguments с которыми будет инициализироваться фактория
         */
        return new (new Jacket.Wearer(_.extend(a, {
          args: arguments
        })))();

      };

    }

    /*
      возвращаем обернутый класс
     */
    return new Jacket.Wearer(a);
  };

  /**
   * Массив, хранящий информацию о вызовах обёрнутых функцийs
   * @type {Array}
   */
  Jacket.callstack = [];

  /**
   * Настройки Jacket'а, в основном флаги
   * Jacket не надо сильно настраивать
   * Гибкость в свободе действий, а не в куче настроек... или я не прав? :)
   * @type {Object}
   */
  Jacket.config = {

    /**
     * Вывод инфомрации об ошибках в консоль через сonsole.error или console.log (ie9+)
     * @type {Boolean}
     */
    log_errors: true,

    /**
     * Вывод трассировки стека в консоль
     * @type {Boolean}
     */
    log_stacktrace: true,

    /**
     * Вывод стека вызовов в консоль
     * @type {Boolean}
     */
    log_callstack: false,

    /**
     * Прокидывать исключения дальше после их обработки
     * @type {Boolean}
     */
    throw_errors: false,

    /**
     * url-адрес, на который будут уходить POST запросы
     * со всей полезной инфой в формате JSON
     * url к errbit'у (к примеру)
     * @type {Boolean}
     */
    notify_url: false,

    /**
     * кол-во последних запоминаемых событий пользователя
     * @type {Number}
     */
    events_count: 100,

    /**
     * размер массива стека вызовов
     * @type {Number}
     */
    callstack_size: 50,

    /**
     * показывать трассировку на странице
     * @type {Boolean}
     */
    show_trace: false

  };

  /*
    Фиксация веремени начала исполнения
    Да, именно сдесь!
   */
  Jacket.startTime = new Date().getTime();

  /**
   * Пул ссылок на оригинальные объекты классов
   * @type {Object}
   */
  Jacket.wearers = {};

  /**
   * История "тыков" пользователя
   * Отправляется на аудит вместе с информацией об ошибке и трассировкой
   * @type {Array}
   */
  Jacket.events = [];

  /**
   * Заглушки для старых и странных браузеров (ie)
   * @return {[type]} [description]
   */
  Jacket.log = function () {
    try {
      console.log.apply(console, arguments);
    } catch (e) {}
  };

  Jacket.err = function () {
    try {
      console.error.apply(console, arguments);
    } catch (e) {
      this.log.apply(this, arguments);
    }
  };

  /**
   * Хуманизируем вывод трэйса: делаем отступы, маркируем
   * @param  {Array} stack трейс в виде массива строк
   * @return {String} удобно-читаемый трейс
   */
  Jacket.trace = function (stack) {
    return (" - " + stack.slice(1).join("\n - ")).replace(/(\-)+\s{2,}/g, "$1 ");
  };

  /**
   * url паттерн
   * @type {RegExp}
   */
  Jacket.url_pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  /**
   * Основная функция обработки ошибок принимает на себя все удары судьбы
   * @param  {Error}  err    Объект ошибки
   * @param  {String} prefix Дополнение к описанию ошибки
   * @return {Void}
   */
  Jacket.handle = function (err, prefix) {

    /**
     * Cохраним в отдельную переменную
     * Только объекты передаются по ссылке
     * Можно дополнять текст сообщения в собсвтвенном обработчике (Jacket.handler)
     * если менять err.message, но не msg
     * @type {String}
     */
    var msg = err.message;


    if (typeof prefix === 'string') {
      msg = prefix + msg;
    }

    /*
      Узреваем ошибки в консоле
     */
    if (this.config.log_errors) {
      this.err(msg);
    }

    /**
     * Отфильтрованный список вызовов
     * Не показываем строки трейса, касающиеся Jacket'а
     * Это излишки информации, забивающие логи
     * @type {Array}
     */
    var stack = [];

    _.each(printStackTrace({
      e: err
    }), function (call) {
      if (call.match(new RegExp("eval|_fn_wrapper|(jacket[\\.\\w]*.js)/")) === null) { // TODO _fn_wrapper O_o ?
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
      Показать на странице трассировку
     */
    if (this.config.show_trace) {
      console.log(stack.slice(1)[0]);
      new Jacket.Tracer(msg, stack.slice(1));
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

        this.notify({

          /*
            дата в виде строки
            ну сами понимаете - полезная инфа
           */
          date: (new Date()).toString(),

          /*
            миллисикунд со старта (отсчет не от события root.onload)
            что-то может случиться еще до старта
           */
          moment: this.moment(),

          /*
            по умолчанию фиксируются 2 события:
            - root.onload
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
          browser: this.navigator.userAgent

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
    var i = 0;
    return function (key, value) {
      if (i !== 0 && typeof censor === 'object' && typeof value === 'object' && censor === value) {
        return '[Circular]';
      }
      if (i >= 200) { return '[Unknown]'; }
      ++i;
      return value;
    };
  };

  Jacket.moment = function () {
    return ((new Date()).getTime() - this.startTime) / 1000;
  };

  Jacket.logEvent = function (elem, event) {
    if (elem.addEventListener) {
      elem.addEventListener(event, Jacket.pushEvent, false);
    } else {
      elem.attachEvent("on" + event, function () {
        return (Jacket.pushEvent.call(elem, root.event));
      });
    }
  };

  Jacket.getNodePath = function (node) {
    var info = node.nodeName;
    if (node.id) {
      info += "#" + node.id;
    }
    if (node.className) {
      info += "." + node.className;
    }
    return info;
  };

  Jacket.pushEvent = function (event) {
    Jacket.events.unshift({
      type: event.type,
      node: Jacket.getNodePath(event.target),
      moment: Jacket.moment(),
      time: (new Date())
    });
  };

  /**
   * отправить данные на сервер
   * @param  {Object} data
   * @return {XMLHttpRequest}
   */
  Jacket.notify = function (data) {

    var xhr = root.ActiveXObject ? new root.ActiveXObject("Microsoft.XMLHTTP") : root.XMLHttpRequest ? new root.XMLHttpRequest() : void 0;

    if (xhr) {

      xhr.open("POST", this.config.notify_url, true);
      xhr.setRequestHeader("Content-type", "applcation/json");

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

  /**
   * Защенные для всех классов методы
   * @type {Array}
   */
  Jacket.protected_methods = [];

  Jacket.protect = function (args) {

    if (typeof args === 'object') {
      return Jacket.protect.apply(this, args);
    }

    _.each(arguments, function (method) {
      if (typeof method === 'string') {
        Jacket.protected_methods.push(method);
      }
    });

    return Jacket.protected_methods;
  };

  Jacket.callback = null;
  Jacket.showError = null;
  Jacket.showTrace = null;
  Jacket.formErrorHtml = null;
  Jacket.formTraceHtml = null;

  /*
    функция, распознающая переданные аргументы
    делает некоторые преобразования, заботится о том чтобы все аргументы, необходимые для оборачивания
    имели нужные форматы и значения по умолчанию если они не были переданы
   */
  Jacket.args = function (fname, origin, extensions, target_methods, protected_methods, methods_callback) {

    /*
      если имя будущего класса не передано, "сдвигаем аргументы"
     */
    if (typeof fname !== 'string') {
      methods_callback = protected_methods;
      protected_methods = target_methods;
      target_methods = extensions;
      extensions = origin;
      origin = fname;
      fname = '';
    }

    /*
      расширение должно быть объектом
     */
    if (typeof extensions !== 'object') {
      /*
        на месте расширений может быть аргумент защищенных методов
       */
      target_methods = extensions;
      extensions = false;
    } else {
      /*
        копируем объект, для многократного использования оригинала
       */
      extensions = _.extend({}, extensions);
    }


    var methods = Jacket.Helpers.parseRegExp(target_methods);

    /*
      целевые методы могут быть указаны через регулярку или строку, описывающую регулярку
     */
    if (methods !== false) {
      /*
        в любом случае methods будет регуляркой
        */
      target_methods = methods;
    } else {
      /*
        на месте целевых методов может быть аргумент защищенных методов
        */
      protected_methods = target_methods;
      target_methods = Jacket.defaults.target_methods;
    }

    /*
      если были переданы защищенные методы в виде массива
     */
    if (_.isArray(protected_methods)) {
      /*
        Если глобвальные защещенные методы это массив, расширяем частный глобальным
       */
      if (_.isArray(Jacket.protected_methods)) {
        protected_methods = Jacket.protected_methods.concat(protected_methods);
      }

    } else {
      /*
        на месте защищенных методов может быть функа обратного вызова
       */
      if (typeof protected_methods === 'function') {
        methods_callback = protected_methods;
      }
      /*
        по умолчанию массив, враппер сольет его с массивом защищенных по его мнению методов
       */
      protected_methods = Jacket.defaults.protected_methods;
    }

    /*
      если функа обратного вызова не была передана
     */
    if (typeof methods_callback !== "function") {
      /*
        используем глобальную функу, только если
        последним аргументом не является false (methods_callback всегда последний аргумент)
       */
      if (methods_callback !== false) {
        methods_callback = Jacket.callback;
      } else {
        methods_callback = Jacket.defaults.methods_callback;
      }

    }

    /*
      вернуть в виде объекта
     */
    return {
      fname: fname,
      origin: origin,
      extensions: extensions,
      protected_methods: protected_methods,
      target_methods: target_methods,
      methods_callback: methods_callback
    };
  };

  Jacket.defaults = {
    extensions: false,
    protected_methods: false,
    target_methods: false,
    methods_callback: false
  };

  Jacket.Helpers = {

    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    getObjectName: function (obj, custom) {
      var name = (typeof custom === 'string' && custom) ? custom : obj.name;
      if (!name) {
        name = _.uniqueId(obj.name || 'jacket'); //this.capitalize(typeof(obj)));
      }
      return name;
    },

    isArguments: function (obj) {
      return (typeof obj === 'object') && (
        (Object.prototype.toString.call(obj) === '[object Arguments]') || (!!obj.callee)
      );
    },

    parseRegExp: function (value) {
      var fIndex;
      if (value instanceof RegExp) {
        return value;
      }
      if (typeof value === 'string' && value.match(new RegExp("^r\/.*\/([igm]*)?$")) !== null) {
        fIndex = _.lastIndexOf(value, '/');
        try {
          value = new RegExp(value.substr(2, fIndex - 3), value.substring(fIndex + 1));
        } catch (e) {
          value = false;
        }
      }
      return value;
    }
  };

  if (!is_node) {
    Jacket.logEvent(root, "load");
    root.onload = function () {
      Jacket.logEvent(root.document.body, "click");
    };
  }

  Jacket.Wearer = Wearer = function Wearer(options) {

    /*
      устанавливам контекст оборачивания
     */
    this.wrap = _.bind(this.wrap, this);

    _.extend(this, options);

    var key, type = typeof this.origin,
      _this = this;

    if (type === 'object' || type === 'function') {

      this.fname = Jacket.Helpers.getObjectName(this.origin, this.fname);

      /*
        если protected_methods = false, сцепляем с пустым массивом
       */
      this.protected_methods = Wearer.protected_methods.concat((this.protected_methods || []), Jacket.protected_methods);

      /*
        будет создан новый класс
       */
      if (this.args // если инстанциируем через new
          || (_.keys(this.origin.prototype || Object.getPrototypeOf(this.origin)).length) // или если у объекта есть свойства прототипа
          || this.origin.name // или если объект имеет name
          || _.has(this.origin, 'constructor') // или если объект имеет constructor
          || _.has((this.extensions || {}), 'constructor')) { // или если расширение объекта имеет contructor

        this.wrap_class(this.args);

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

    // console.log('(', instantiatable, ')', typeof this.wrapper, args)

    return this.wrapper;
  };

  Wearer.protected_methods = ["__super__", "constructor"];

  Wearer.prototype.wrap_object_or_function = function () {

    var key, _this = this;

    if (typeof this.origin === 'function') {

      this.wrapper = this.wrap(this.fname, this.origin, true);

      //console.log('ORIGIN', this.origin);

      _.each(this.origin, function (val, key, proto) {
        // console.log(" ++ ", key, val);
        if (_.has(proto, key)) {
          _this.wrapper[key] = _this.wrap(key, val);
        }
      });

      if (this.extensions) {
        _.each(this.extensions, function (val, key, proto) {
          // console.log(" -- ", key, val);
          if (_.has(proto, key)) {
            _this.wrapper[key] = _this.wrap(key, val);
          }
        });
      }

    } else {

      // console.log("WRAP OBJECT", this.origin, this.extensions);

      this.wrapper = {};

      _.each(_.extend({}, this.origin, this.extensions), function (val, key, proto) {
        if (_.has(proto, key)) {
          _this.wrapper[key] = _this.wrap(key, val);
        }
      });

    }
  };

  Wearer.prototype.wrap_class = function (args) {

    var tmp, wrapper, id = _.uniqueId('wearer'),
      _this = this, _class, i, last;

    if (typeof this.origin === 'object') {
      tmp = this.origin;
      this.origin = _.has(tmp, 'constructor') ? tmp.constructor : function () {};
      this.origin.prototype = tmp;
    }

    Jacket.wearers[id] = wrapper = [this, this.origin];

    if (this.extensions && _.has(this.extensions, 'constructor')) {
      this.extensions[this.fname] = this.extensions.constructor;
      delete this.extensions.constructor;
      this.construct = this.wrap('constructor', this.extensions[this.fname], true);
    } else {
      this.construct = this.wrap('constructor', this.origin, true);
    }

    this.construct.__super__ = this.origin.prototype;

    this.cname = this.fname.substring(_.lastIndexOf(this.fname, '.') + 1);

    _class = [
      'J.wearers["', id, '"].wrapper = ', (this.fname !== this.cname ? this.fname + ' = ' : ''), '(function (jacket, obj, constructor, extensions, args) {',
      // 'console.log(arguments);',
      '\n  jacket.extend(', this.cname, ', obj);',
      '\n  ', this.cname, '.name = "', this.cname, '";',
      '\n  function ', this.cname, '() {', (this.extensions ? '\n    jacket.do_wraps(extensions, this);' : ''),
      // '\n     this.__super__ = constructor.__super__;',
      '\n     var result = constructor.apply(this, Array.prototype.slice.call(', Jacket.Helpers.isArguments(args) ? 'args' : 'arguments', '));',
      '\n     jacket.do_wraps(this);',
      '\n     return result;',
      '\n  }',
      '\n  return ', this.cname, ';',
      '\n})('
    ];

    wrapper.push(this.construct, this.extensions, args);

    // console.log(wrapper);

    for (i = 0, last = wrapper.length - 1; i <= last; i++) {
      _class.push('J.wearers["' + id + '"][' + i + ']' + ((i < last) ? ', ' : ''));
    }

    _class.push(');');

    // console.log(_class.join(''));

    globalEval(_class.join(''));

    this.wrapper = Jacket.wearers[id].wrapper;

    this.wrapper.prototype.__super__ = this.origin.prototype;

    _.each(Object.getPrototypeOf(this.wrapper.prototype), function (val, key, proto) {
      if (_.has(proto, key)) {
        _this.wrapper.prototype[key] = _this.wrap(key, val);
      }
    });
  };

  Wearer.prototype.do_wraps = function (origin, target) {
    var _this = this, key;
    target = target || origin;
    for (key in origin) {
      if (_.has(origin, key)) {
        target[key] = _this.wrap(key, origin[key]);
      }
    }
  };

  Wearer.prototype.extend = function (child, parent) {

    var _this = this, key;

    for (key in parent) {
      if (_.has(parent, key)) {
        child[key] = _this.wrap(key, parent[key], child);
      }
    }

    function Ctor() {
      this.constructor = child;
    }

    Ctor.prototype = parent.prototype;
    child.prototype = new Ctor();
    child.__super__ = parent.prototype;

    return child;
  };

  Wearer.prototype.getCall = function (scope, prop) {

    var name, _this = this;

    if (this.constructor.name !== 'Wearer' && this.constructor.name !== 'Window') { // TODO check Node.js global to
      name = this.constructor.name;

      if (!prop) {
        name += _this.fname.substring(_.lastIndexOf(_this.fname, '.'));
      }
    } else {
      name = _this.fname;
    }

    if (name === prop) {
      prop = '';
    }

    return {
      method: prop,
      callee: name,
      caller: name + (prop ? '.' + prop : ''),
      scope: scope,
      time: new Date().getTime()
    };
  };

  Wearer.prototype.handle = function (e, call) {

    call.err = {
      obj: e,
      msg: call.caller + (call.args.length ? ('( ' + ((typeof call.args[0] === 'string') ? '"' + call.args[0] + '"' : typeof call.args[0]) + ", ... )") : '') + ' : '
    };

    Jacket.handle(e, call.err.msg);

    call.err.msg += e.message;

    return call;
  };

  Wearer.prototype.process = function (call) {
    if (typeof this.methods_callback === "function") {
      this.methods_callback(call);
    }
    return call;
  };

  Wearer.prototype.registerCall = function (call) {
    if (Jacket.callstack.length >= Jacket.config.callstack_size) {
      Jacket.callstack.shift();
    }
    Jacket.callstack.push(call);
  };

  Wearer.prototype.wrap = function (prop, value, force) {

    var _jacket = this;

    if (typeof prop === 'function') {
      value = prop;
      prop = false;
    }

    if (typeof value === 'function' && !_.has(value, "wrapped") && (force || ((this.target_methods === false || (this.target_methods instanceof RegExp && this.target_methods.test(prop))) && _.indexOf(this.protected_methods, prop) < 0))) {

      var jacket = function () {

        var call = _.extend(_jacket.getCall(this, prop), {
          args: arguments
        });

        _jacket.registerCall(call);

        try {
          call.result = value.apply(this, arguments);
        } catch (e) {
          call = _jacket.handle(e, call);
        }

        return _jacket.process(call).result;

      };

      jacket.wrapped = true;

      return jacket;

    }

    return value;
  };

  Jacket.Tracer = Tracer = function Tracer(err, stack) {

    this.first = true;

    var id = _.uniqueId('err'),
      trace = this.prepareTrace(stack, id),
      sources = [],
      step,
      url,
      i;

    this.showTrace = _.bind(this.showTrace, this);

    this.showError({
      id: id,
      message: err
    });

    for (i = 0; i < trace.length; i++) {
      step = trace[i];
      if (_.has(this.sources, step[1])) {
        url = this.sources[step[1]];
        if (_.isArray(url)) {
          url.push(step);
        } else {
          this.showTrace(step);
        }
      } else {
        this.sources[step[1]] = [step];
        this.loadSource(step, this.showTrace);
      }

    }

  };

  Tracer.prototype.loadSource = function(step, callback) {

    var _this = this, steps, xhr = root.ActiveXObject ? new root.ActiveXObject("Microsoft.XMLHTTP") : root.XMLHttpRequest ? new root.XMLHttpRequest() : void 0;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status <= 400) {
        steps = _this.sources[step[1]];
        _this.sources[step[1]] = xhr.responseText.split('\n');
        _.each(steps, function(step) {
          callback(step);
        });
      }
    };

    xhr.open("GET", step[1] ,true);

    return xhr.send();
  };

  Tracer.prototype.sources = {};

  Tracer.prototype.getHolder = function() {
    return document.getElementById('tracer') || this.appendHolder();
  };

  Tracer.prototype.appendHolder = function() {
    var holder = document.createElement('div');
    holder.id = 'tracer';
    document.body.appendChild(holder);
    return holder;
  };

  Tracer.prototype.url_pattern = new RegExp('((?:http|https)(?::\\/{2}[\\w]+)(?:[\\/|\\.]?)(?:[^\\s|\\)"]*))',["i"]);

  Tracer.prototype.prepareTrace = function(trace, err_id) {
    var callstack = [], _this = this, url;
    _.each(trace, function(step){
      url = _this.detect(step);
      if (url !== null && (url = url[0])) {
        callstack.push([ step, url.substring(0, url.indexOf('.js') + 3), url.substring(url.indexOf('.js') + 4).split(':').slice(-2), err_id]);
      }
    });
    return callstack;
  };

  Tracer.prototype.detect = function(step){
    return this.url_pattern.exec(step);
  };

  Tracer.prototype.createElement = function(type, parent, props) {
    var el = document.createElement(type), prop;
    for (prop in props) {
      if (_.has(props, prop)) {
        el[prop] = props[prop];
      }
    }
    parent.appendChild(el);
    return el;
  };

  Tracer.prototype.showTrace = function (step) {
    var data = {
      err: step[3],
      url: step[1],
      source: this.sources[step[1]],
      line: parseInt(step[2][0], 10),
      column: parseInt(step[2][1], 10),
      message: step[0]
    };
    if (typeof Jacket.showTrace === 'function') {
      return Jacket.showTrace(data);
    } else {
      return this.createElement('div', document.getElementById(data.err), {
        className: 'jacket-trace',
        innerHTML: this.formTraceHtml(data)
      });
    }
  };

  Tracer.prototype.showError = function (data) {
    if (typeof Jacket.showError === 'function') {
      return Jacket.showError(data);
    } else {
      return this.createElement('div', this.getHolder(), {
        className: 'jacket-error',
        id: data.id,
        innerHTML: this.formErrorHtml(data)
      });
    }
  };

  Tracer.prototype.formErrorHtml = function (data) {
    if (typeof Jacket.formErrorHtml === 'function') {
      return Jacket.formErrorHtml(data);
    } else {
      return "<h3>" + data.message + "</h3>";
    }
  };

  Tracer.prototype.escapeHtml = function(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  Tracer.prototype.formTraceHtml = function (data) {
    var msg, output = "<div>", i, line;
    if (typeof Jacket.formTraceHtml === 'function') {
      return Jacket.formTraceHtml(data);
    } else {

      data.line--;

      msg = "<h4>" + data.message.substring(0, 120) + "</h4>";

      for (i = data.line - 3; i < data.line + 2; i++ ) {
        line = data.source[i];
        if (i === data.line) {
          output += "<div class='" + (this.first === true ? 'error' : 'line') + "'><i>" + data.line+ ":</i>";
          output += (this.escapeHtml(line.substring(0, data.column-1)) + "<span>" + ( this.escapeHtml(line.substring(data.column-1)) || '&larr;') + '</span>').split("  ").join("&nbsp;&nbsp;") + "</div>";
        } else {
          output += "<div><i>" + data.line+ ":</i>";
          output += this.escapeHtml(line).split("  ").join("&nbsp;&nbsp;") + "<br />";
        }
        output += '</div>';
      }
      output += '</div>';

      this.first = false;

      if (data.column >= 120) {
        var start = Math.max(data.column-50, 0);
        var column = start + (data.column - start) -1;
        var end = Math.min(data.source[data.line].length, data.column+50);
        line = data.source[data.line];
        return msg += "<div><i>" + data.line + ":</i> . . ." + this.escapeHtml(line.substring(start, column)) + "<span>" + this.escapeHtml(line.substring(column, end) || '&larr;') + "</span> . . .</div>";
      } else {
        return msg += "<div>" + output + "</div>";
      }
    }
  };

  if (is_node) {
    module.exports = Jacket;
  }

  if (define !== undefined) {
    try {
      define(function () {
        return Jacket;
      });
    } catch (_error) {}
  }

  root.Jacket = root.J = Jacket;

}).call(this);
