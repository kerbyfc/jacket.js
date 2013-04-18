(function() {
  var Band;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; }, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Band = (function() {
    var _base, _base2, _ref, _ref2;

    window.Band = Band;

    if ((_ref = (_base = Band.prototype).root) == null) _base.root = '/';

    if ((_ref2 = (_base2 = Band.prototype).strict) == null) _base2.strict = true;

    Band.setup = function(options) {
      return $.extend(Band.prototype, options);
    };

    Band.prototype.instance = function() {
      if (Band.prototype.composer == null) {
        Band.prototype.composer = new Band.Composer();
        Band.prototype.$ = Band.prototype.composer.$;
      }
      return Band.prototype.composer;
    };

    Band.compose = function() {
      var _ref3;
      return (_ref3 = Band.prototype.instance()).$.apply(_ref3, ['compose'].concat(__slice.call(arguments)));
    };

    function Band() {
      Band.prototype.instance().$('add', arguments);
      return Band.prototype.instance();
    }

    return Band;

  })();

  Band.Participant = (function() {
    var _base, _base2, _base3, _base4, _ref, _ref2, _ref3, _ref4;

    Participant.prototype.__scope = (_ref = (_base = Band.prototype).scope) != null ? _ref : _base.scope = {};

    Participant.prototype.__trace = (_ref2 = (_base2 = Band.prototype).trace) != null ? _ref2 : _base2.trace = [];

    Participant.prototype.__actions = (_ref3 = (_base3 = Band.prototype).actions) != null ? _ref3 : _base3.actions = {};

    Participant.prototype.__listeners = (_ref4 = (_base4 = Band.prototype).listeners) != null ? _ref4 : _base4.listeners = {};

    Participant.prototype.__len = function(e) {
      if (this.__listeners[e] != null) {
        return this.__listeners[e].length;
      } else {
        return 0;
      }
    };

    Participant.prototype.__identify = function(action) {
      if (typeof action === 'string') {
        if (action.match(/\.+/) == null) {
          return this.constructor.name + '.' + action;
        } else {
          return action;
        }
      }
      return action;
    };

    Participant.prototype.__reserved = ['__len', '__act', '__identify', '__methods', '__solid', '__error', '__warning', 'indicate', 'constructor', 'define', '$', 'on', 'listen', 'off', 'ignore'];

    Participant.prototype.__methods = function(m) {
      var n, o;
      if (m == null) m = {};
      for (n in this) {
        o = this[n];
        if (typeof o === 'function' && __indexOf.call(this.__reserved, n) < 0) {
          m[n] = o;
        }
      }
      return m;
    };

    Participant.prototype.__solid = function() {
      var vars, _i, _len, _var;
      vars = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = vars.length; _i < _len; _i++) {
        _var = vars[_i];
        if (_var === void 0 || !(_var != null) || _var === '') return false;
      }
      return true;
    };

    Participant.prototype.__act = function(action, implementation, args) {
      this.__trace.push(action + '(' + args.join(',').slice(0, 20) + ') ');
      try {
        return implementation.apply(this, args);
      } catch (err) {
        return this.__error(err);
      }
    };

    Participant.prototype.__error = function(err) {
      return console.error(err.message + '\n  *-> ' + this.__trace.join('--> '));
    };

    function Participant() {
      var action, implementation, _ref5;
      this.__scope[this.constructor.name] = this;
      _ref5 = this.__methods();
      for (action in _ref5) {
        implementation = _ref5[action];
        this.define(action, implementation);
      }
      this.$.apply(this, ['init'].concat(__slice.call(arguments)));
    }

    Participant.prototype.init = function() {
      return this;
    };

    Participant.prototype.define = function(action, impolementation) {
      return this.__actions[action = this.__identify(action)] = impolementation;
    };

    Participant.prototype.indicate = function() {
      var action, l, results, _results;
      action = arguments[0], results = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      l = this.__len(action);
      _results = [];
      while (l--) {
        if (typeof this.__listeners[action][l] === 'string') {
          _results.push(this.$.apply(this, $.merge([this.__listeners[action][l]], $.merge([], [results])[0])));
        } else {
          _results.push(this.__act(action, this.__listeners[action][l], results));
        }
      }
      return _results;
    };

    Participant.prototype.$ = function() {
      var action, args, __internal;
      action = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this.__solid(action)) {
        return this.__error(new Error('No arguments passed'));
      }
      action = this.__identify(action);
      if (this.__actions[action] == null) {
        if (Band.prototype.strict) {
          throw Error('method `' + action + '` must be defined');
        }
        if ((__internal = this[action.substring(action.lastIndexOf('.') + 1)] || false)) {
          if ($.isFunction(__internal)) {
            this.define(action, __internal);
          } else {
            return __internal;
          }
        } else {
          return this.define(action, args[0] || function() {
            return this;
          });
        }
      }
      return this.indicate(action, this.__act(action, this.__actions[action], args));
    };

    Participant.prototype.listen = function() {
      return this.on.apply(this, arguments);
    };

    Participant.prototype.on = function(action, handler) {
      var _base5, _name, _ref5;
      return ((_ref5 = (_base5 = this.__listeners)[_name = this.__identify(action)]) != null ? _ref5 : _base5[_name] = []).unshift(this.__identify(handler));
    };

    Participant.prototype.ignore = function() {
      return this.off.apply(this, arguments);
    };

    Participant.prototype.off = function(action, c) {
      var l, _results;
      if (c == null) c = null;
      l = this.__len(action);
      _results = [];
      while (l--) {
        _results.push(this.__listeners[action][l] === c || !(c != null) ? this.__listeners[action].splice(l, 1) : void 0);
      }
      return _results;
    };

    return Participant;

  })();

  Band.Composer = (function() {
    var _base, _ref;

    __extends(Composer, Band.Participant);

    function Composer() {
      Composer.__super__.constructor.apply(this, arguments);
    }

    Composer.prototype.suites = (_ref = (_base = Band.prototype).suites) != null ? _ref : _base.suites = {};

    Composer.prototype.dependencies = {};

    Composer.prototype.add = function(suites, callback, suite) {
      var expectations, _i, _len;
      var _this = this;
      console.log("ADD");
      expectations = [];
      for (_i = 0, _len = suites.length; _i < _len; _i++) {
        suite = suites[_i];
        if (!(this.suites[suite] != null)) expectations.push(this.get(suite));
      }
      return $.when.apply($, expectations).then((function() {
        return _this.$('ready', suites, callback, suite);
      }), (function() {
        return _this.$('fail', suites, callback, suite);
      }));
    };

    Composer.prototype.ready = function(suites, callback, suite) {
      var dep;
      if (callback == null) callback = null;
      if (suite == null) suite = null;
      if (callback != null) {
        console.log(">>>>>>>>>>>> ", suites, suite);
        this.dependencies[suite] = callback.apply(null, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = suites.length; _i < _len; _i++) {
            dep = suites[_i];
            _results.push(this.dependencies[dep]);
          }
          return _results;
        }).call(this));
        return console.log(this.dependencies);
      }
    };

    Composer.prototype.fail = function(suite, msg, description) {
      throw Error('Suite `' + suite.name + '` ' + description);
    };

    Composer.prototype.get = function(suite) {
      return this.suites[suite] = $.extend($.getScript([Band.prototype.root, 'band', 'suites', suite].join('/') + '.js'), {
        name: suite
      });
    };

    Composer.prototype.compose = function(suite, dependencies, implementation) {
      this.dependencies[suite] = dependencies;
      return this.$('add', dependencies, implementation, suite);
    };

    return Composer;

  })();

}).call(this);
