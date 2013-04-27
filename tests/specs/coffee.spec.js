// Generated by CoffeeScript 1.4.0
(function() {
  var __hasProp = {}.hasOwnProperty;

  describe('CoffeeScript classes', function() {
    var i, _class, _i, _len, _ref, _results;
    _ref = [CoffeeClass, ExtendedCoffeeClass];
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      _class = _ref[i];
      _results.push((function(_class, i) {
        var W;
        W = Jacket(_class);
        describe('Jacket ( ' + _class.name + ' )', function() {
          it('should return new class', function() {
            return W.should.not.equal(CoffeeClass);
          });
          return describe('should have', function() {
            it('name of origin class `' + _class.name + '`', function() {
              return W.name.should.equal(_class.name);
            });
            it('copy of origin class static properties', function() {
              var prop, val, _results1;
              _results1 = [];
              for (prop in _class) {
                if (!__hasProp.call(_class, prop)) continue;
                val = _class[prop];
                _results1.push(W.should.have.ownProperty(prop));
              }
              return _results1;
            });
            return it('wrapped static methods of origin class', function() {
              var prop, val, _results1;
              _results1 = [];
              for (prop in _class) {
                if (!__hasProp.call(_class, prop)) continue;
                val = _class[prop];
                if (typeof val === 'function') {
                  _results1.push(W[prop].toString().should.match(Helpers.wrapped_function));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            });
          });
        });
        return describe('new Jacket ( ' + _class.name + ' )( )', function() {
          it('should return new instance of wrapped class', function() {
            var w;
            w = new W();
            console.log('<><><>', w);
            w.should.be.instanceOf(W);
            return w.id.should.eq(i + 1);
          });
          describe('should have', function() {
            beforeEach(function() {
              return this.w = new W();
            });
            it('copy of origin class prototype properties in it`s prototype', function() {
              var key, val, _ref1, _results1;
              _ref1 = Object.getPrototypeOf(_class);
              _results1 = [];
              for (key in _ref1) {
                val = _ref1[key];
                this.w.should.not.have.ownProperty(key);
                if (typeof val !== 'function') {
                  _results1.push(this.w.__proto__.should.have.ownProperty(key, val));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            });
            it('wrapped methods of origin class prototype methods in it`s prototype', function() {
              var key, val, _ref1, _results1;
              _ref1 = Object.getPrototypeOf(_class);
              _results1 = [];
              for (key in _ref1) {
                val = _ref1[key];
                if (typeof val === 'function') {
                  this.w.__proto__.should.have.ownProperty(key, val);
                  _results1.push(this.w.__proto__.prototype_method.should.match(Helpers.wrapped_function));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            });
            it('wrapped binded methods in it`s own scope', function() {
              this.w.should.have.ownProperty('binded_method');
              return this.w.binded_method.should.match(Helpers.wrapped_function);
            });
            return it('wrapped methods, created in constructor', function() {
              this.w.should.have.ownProperty('method_defined_in_constructor');
              return this.w.method_defined_in_constructor.should.match(Helpers.wrapped_function);
            });
          });
          if (i > 1) {
            return describe('should be able to', function() {
              before(function() {
                this.p = new (Jacket(CoffeeClass));
                return this.c = new (Jacket(ExtendedCoffeeClass));
              });
              it('run methods defined in parent constructor after `super`', function() {
                this.c.should.have.ownProperty('method_defined_in_constructor');
                return this.c.method_defined_in_constructor().should.eq('method_defined_in_constructor');
              });
              return it('run parent class prototype methods', function() {
                this.c.should.have.property('parent_method');
                return this.c.parent_method().should.eq('parent_method');
              });
            });
          }
        });
      })(_class, i));
    }
    return _results;
  });

}).call(this);
