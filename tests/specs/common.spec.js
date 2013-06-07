// Generated by CoffeeScript 1.4.0
(function() {

  describe('Базовые объекты javascript', function() {
    var anonymous, obj, object, objects, _i, _len, _results,
      _this = this;
    object = {
      method2: function() {
        return console.log("222", this.i);
      }
    };
    anonymous = function() {
      return 'anonymous';
    };
    var named = function named() {return false;};

    objects = [object, anonymous, named];
    _results = [];
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      obj = objects[_i];
      obj.method = function() {
        return 'method';
      };
      obj.prop = 'prop';
      _results.push((function(obj) {
        var name, w;
        name = (typeof obj === 'function' && obj.name === '' ? 'anonymous ' : '') + ' ' + obj.constructor.name;
        w = J(obj);
        return describe('выражение Jacket ( ' + name + ' )', function() {
          it('должено вернуть новый объект', function() {
            w.should.not.eq(obj);
            return w.should.be.instanceOf(Object);
          });
          return describe('который должен иметь', function() {
            it('копии свойств базового объекта', function() {
              w.should.have.ownProperty('prop');
              w.prop.should.equal(obj.prop);
              w.prop = false;
              return obj.prop.should.be.ok;
            });
            return it('обернутые методы базового объекта', function() {
              w.should.have.ownProperty('method');
              w.method.toString().should.not.eq(obj.method.toString());
              return w.method.should.match(Helpers.wrapped_function);
            });
          });
        });
      })(obj));
    }
    return _results;
  });

}).call(this);
