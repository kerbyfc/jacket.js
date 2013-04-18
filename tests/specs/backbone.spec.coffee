describe 'Backbone.js Jacket implementation', -> 

  beforeEach ->
    @W = Jacket(BackboneView)

  describe 'Jacket ( BackboneView )', -> 

    it 'should return new class',  ->
      @W.should.not.equal BackboneView

    describe 'should have', -> 

      it 'empty name', -> 
        @W.name.should.equal ''

      it 'wrapped prototype methods of __super__', -> 
        for prop, val of @W.prototype
          val.should.match Helpers.wrapped_function if typeof val is 'function'
      
    # describe 'new Jacket ( ' + _class.name + ' )', -> 

    #   it 'should return new instance of wrapped class', -> 
    #     w = new @W()
    #     w.should.be.instanceOf @W
    #     w.id.should.eq i

    #   describe 'should have', -> 

    #     beforeEach -> 
    #       @w = new @W()

    #     it 'copy of origin class prototype properties in it`s prototype', ->  
    #       for key, val of Object.getPrototypeOf _class
    #         @w.should.not.have.ownProperty key
    #         unless typeof val is 'function'
    #           @w.__proto__.should.have.ownProperty key, val

    #     it 'wrapped methods of origin class prototype methods in it`s prototype', -> 
    #       for key, val of Object.getPrototypeOf _class
    #         if typeof val is 'function'
    #           @w.__proto__.should.have.ownProperty key, val
    #           @w.__proto__.prototype_method.should.match Helpers.wrapped_function

    #     it 'wrapped binded methods in it`s own scope', -> 
    #       @w.should.have.ownProperty 'binded_method'
    #       @w.binded_method.should.match Helpers.wrapped_function

    #     it 'wrapped methods, created in constructor', -> 
    #       @w.should.have.ownProperty 'method_defined_in_constructor'
    #       @w.method_defined_in_constructor.should.match Helpers.wrapped_function

    #   if i > 0
    #     describe 'should be able to', -> 

    #       before ->   
    #         @p = new (Jacket CoffeeClass)
    #         @c = new (Jacket ExtendedCoffeeClass)

    #       it 'run methods defined in parent constructor after `super`', -> 
    #         @c.should.have.ownProperty 'method_defined_in_constructor'
    #         @c.method_defined_in_constructor().should.eq 'method_defined_in_constructor'

    #       it 'run parent class prototype methods', ->
    #         @c.should.have.property 'parent_method'
    #         @c.parent_method().should.eq 'parent_method'