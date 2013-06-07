// Generated by CoffeeScript 1.4.0
(function() {

  describe('Базовые объекты javascript', function() {
    var anonymous, obj, object, objects, _fn, _i, _len,
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
    _fn = function(obj) {
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
    };
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      obj = objects[_i];
      obj.method = function() {
        return 'method';
      };
      obj.prop = 'prop';
      _fn(obj);
    }
    return describe('Общие принципы', function() {
      describe('выражение Jacket ( {yes:1} ) ', function() {
        it('вернет объект новый ', function() {
          var j;
          obj = {
            yes: 1
          };
          j = Jacket(obj);
          j.should.not.equal(obj);
          return j.should.be.an["instanceof"](Object);
        });
        return it('имеющий собственное свойство yes = 1', function() {
          return Jacket({
            yes: 1
          }).should.have.ownProperty('yes', 1);
        });
      });
      describe('выражение new Jacket ( {yes:1} )', function() {
        before(function() {
          return this.j = new Jacket({
            yes: 1
          });
        });
        return it('вернет новую функцию-инициализатор', function() {
          this.j.should.be.a('function');
          return this.j.name.should.eq('');
        });
      });
      return describe('выражение new Jacket ( {yes:1} )("lol")', function() {
        before(function() {
          this.j = new Jacket({
            yes: 1
          })('lol');
          this.j = new Jacket({
            yes: 1
          })('lol2');
          return this.j = new Jacket({
            yes: 1
          })('lol3');
        });
        return it('вернет новый класс, с именем jacket[n]', function() {
          this.j.should.be.a('object');
          return this.j.constructor.name.should.match(/jacket[\d]+/);
        });
      });
    });
  });

}).call(this);
