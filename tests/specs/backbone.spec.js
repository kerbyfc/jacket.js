// Generated by CoffeeScript 1.4.0
(function() {

  describe('Расширение классов на примере Backbone', function() {
    window.BackboneExtend = function() {
      var spy;
      spy = sinon.spy();
      return {
        constructor: function() {
          this.constructor.__super__.constructor.apply(this, arguments);
          return spy();
        },
        extended: true,
        spy: spy
      };
    };
    describe("выражение new (Jacket ( Backbone.View, extend ))()", function() {
      it('возвращает экземпляр класса Function[n]', function() {
        var view;
        view = new (Jacket(Backbone.View));
        return view.constructor.name.should.match(/^jacket[\d]+$/i);
      });
      it('расширяет класс объектом extend', function() {
        var view;
        view = new (Jacket(Backbone.View, BackboneExtend()));
        return view.should.have.ownProperty('extended');
      });
      it('вызывает метод constructor из расширения (extend.constructor)', function() {
        var extend, view;
        extend = BackboneExtend();
        view = new (Jacket(Backbone.View, extend));
        view.should.have.ownProperty('extended');
        return extend.spy.callCount.should.eq(1);
      });
      return it('присваивает Backbone.View.prototype свойству __super__', function() {
        var view;
        view = new (Jacket(Backbone.View, BackboneExtend()));
        return view.__super__.should.eq(Backbone.View.prototype);
      });
    });
    describe("выражение new Jacket ( Backbone.View, extend )()", function() {
      it('возвращает экземпляр класса jacket[n]', function() {
        var view;
        view = new Jacket(Backbone.View)();
        return view.constructor.name.should.match(/^jacket[\d]+$/i);
      });
      it('расширяет класс объектом extend', function() {
        var view;
        view = new Jacket(Backbone.View, BackboneExtend())();
        return view.should.have.ownProperty('extended');
      });
      it('вызывает метод constructor из расширения (extend.constructor)', function() {
        var extend, view;
        extend = BackboneExtend();
        view = new Jacket(Backbone.View, extend)();
        view.should.have.ownProperty('extended');
        return extend.spy.callCount.should.eq(1);
      });
      return it('присваивает Backbone.View.prototype свойству __super__', function() {
        var view;
        view = new Jacket(Backbone.View, BackboneExtend())();
        return view.__super__.should.eq(Backbone.View.prototype);
      });
    });
    return describe("выражение new Jacket ( 'MyView', Backbone.View, extend )()", function() {
      it('возвращает экземпляр класса MyView', function() {
        var view;
        view = new Jacket('MyView', Backbone.View, {
          constructor: function() {
            return false;
          }
        })();
        return view.constructor.name.should.match(/^MyView$/i);
      });
      it('расширяет класс объектом extend', function() {
        var view;
        view = new Jacket('MyView', Backbone.View, BackboneExtend())();
        return view.should.have.ownProperty('extended');
      });
      it('вызывает метод constructor из расширения (extend.constructor)', function() {
        var extend, view;
        extend = BackboneExtend();
        view = new Jacket('MyView', Backbone.View, extend)();
        view.should.have.ownProperty('extended');
        return extend.spy.callCount.should.eq(1);
      });
      return it('присваивает Backbone.View.prototype свойству __super__', function() {
        var view;
        view = new Jacket('MyView', Backbone.View, BackboneExtend())();
        return view.__super__.should.eq(Backbone.View.prototype);
      });
    });
  });

}).call(this);
