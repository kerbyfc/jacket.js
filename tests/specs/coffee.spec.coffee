describe 'CoffeeScript classes', ->

  for _class, i in [CoffeeClass, ExtendedCoffeeClass]

    do (_class, i) -> 

      W = Jacket(_class)

      describe 'Jacket ( ' + _class.name + ' )', -> 

        it 'should return new class', ->
          W.should.not.equal CoffeeClass

        describe 'should have', -> 

          it 'name of origin class `' + _class.name + '`', -> 
            W.name.should.equal _class.name

          it 'copy of origin class static properties', -> 
            for own prop, val of _class
              W.should.have.ownProperty prop

          it 'wrapped static methods of origin class', -> 
            for own prop, val of _class
              if typeof val is 'function'
                W[prop].toString().should.match Helpers.wrapped_function
        
      describe 'new Jacket ( ' + _class.name + ' )( )', -> 

        it 'should return new instance of wrapped class', -> 
          w = new W()
          w.should.be.instanceOf W
          w.id.should.eq i+1

        describe 'should have', -> 

          beforeEach -> 
            @w = new W()

          it 'copy of origin class prototype properties in it`s prototype', ->  
            for key, val of Object.getPrototypeOf _class
              @w.should.not.have.ownProperty key
              unless typeof val is 'function'
                @w.__proto__.should.have.ownProperty key, val

          it 'wrapped methods of origin class prototype methods in it`s prototype', -> 
            for key, val of Object.getPrototypeOf _class
              if typeof val is 'function'
                @w.__proto__.should.have.ownProperty key, val
                @w.__proto__.prototype_method.should.match Helpers.wrapped_function

          it 'wrapped binded methods in it`s own scope', -> 
            @w.should.have.ownProperty 'binded_method'
            @w.binded_method.should.match Helpers.wrapped_function

          it 'wrapped methods, created in constructor', -> 
            @w.should.have.ownProperty 'method_defined_in_constructor'
            @w.method_defined_in_constructor.should.match Helpers.wrapped_function

        if i > 1
          describe 'should be able to', -> 

            before ->   
              @p = new (Jacket CoffeeClass)
              @c = new (Jacket ExtendedCoffeeClass)

            it 'run methods defined in parent constructor after `super`', -> 
              @c.should.have.ownProperty 'method_defined_in_constructor'
              @c.method_defined_in_constructor().should.eq 'method_defined_in_constructor'

            it 'run parent class prototype methods', ->
              @c.should.have.property 'parent_method'
              @c.parent_method().should.eq 'parent_method'




          


