describe 'Расширение классов на примере Backbone', -> 

  window.BackboneExtend = -> 
    spy = sinon.spy()
    return {
      constructor: ->
        @constructor.__super__.constructor.apply(this, arguments); spy();
      extended: true
      spy: spy
    }

  describe "выражение new (Jacket ( Backbone.View, extend ))()", -> 

    it 'возвращает экземпляр класса Function[n]', ->
      view = new (Jacket(Backbone.View))
      view.constructor.name.should.match /^jacket[\d]+$/i

    it 'расширяет класс объектом extend', ->
      view = new (Jacket Backbone.View, BackboneExtend())
      view.should.have.ownProperty 'extended'
      
    it 'вызывает метод constructor из расширения (extend.constructor)', -> 
      extend = BackboneExtend()
      view = new( Jacket Backbone.View, extend )
      view.should.have.ownProperty 'extended'
      extend.spy.callCount.should.eq 1

    it 'присваивает Backbone.View.prototype свойству __super__', ->
      view = new (Jacket Backbone.View, BackboneExtend())
      view.__super__.should.eq Backbone.View.prototype

  describe "выражение new Jacket ( Backbone.View, extend )()", -> 

    it 'возвращает экземпляр класса jacket[n]', ->
      view = new Jacket(Backbone.View)()
      view.constructor.name.should.match /^jacket[\d]+$/i

    it 'расширяет класс объектом extend', ->
      view = new Jacket(Backbone.View, BackboneExtend())()
      view.should.have.ownProperty 'extended'
      
    it 'вызывает метод constructor из расширения (extend.constructor)', -> 
      extend = BackboneExtend()
      view = new Jacket(Backbone.View, extend)()
      view.should.have.ownProperty 'extended'
      extend.spy.callCount.should.eq 1

    it 'присваивает Backbone.View.prototype свойству __super__', ->
      view = new Jacket(Backbone.View, BackboneExtend())()
      view.__super__.should.eq Backbone.View.prototype

  describe "выражение new Jacket ( 'MyView', Backbone.View, extend )()", -> 

    it 'возвращает экземпляр класса MyView', ->
      view = new Jacket('MyView', Backbone.View, {constructor: -> false})()
      view.constructor.name.should.match /^MyView$/i

    it 'расширяет класс объектом extend', ->
      view = new Jacket('MyView', Backbone.View, BackboneExtend())()
      view.should.have.ownProperty 'extended'
      
    it 'вызывает метод constructor из расширения (extend.constructor)', -> 
      extend = BackboneExtend()
      view = new Jacket('MyView', Backbone.View, extend)()
      console.log view
      view.should.have.ownProperty 'extended'
      extend.spy.callCount.should.eq 1

    it 'присваивает Backbone.View.prototype свойству __super__', ->
      view = new Jacket('MyView', Backbone.View, BackboneExtend())()
      view.__super__.should.eq Backbone.View.prototype

