describe 'Pure javascript', -> 

  object = 
    method: -> 
      'method'
    prop: 'prop'

  anonymous = -> 'anonymous'

  `var named = function named() {return false;}`

  for obj in [object, anonymous, named] 

    obj.method = -> 'method'
    obj.prop = 'prop'

    name = ( if typeof obj is 'function' and obj.name is '' then 'anonymous ' else '' ) + ' ' + obj.constructor.name

    describe 'Jacket ( ' + name + ' )', -> 

      beforeEach -> 
        @w = J(obj)

      it 'should return new object', -> 
        @w.should.not.eq obj
        @w.should.be.instanceOf Object

      describe 'should have', ->

        it 'copies of origin object properties', -> 
          @w.should.have.ownProperty 'prop'
          @w.prop.should.equal obj.prop
          @w.prop = false
          obj.prop.should.be.ok

        it 'wrapped origin object methods', -> 
          @w.should.have.ownProperty 'method'
          @w.method.toString().should.not.eq obj.method.toString()
          @w.method.should.match Helpers.wrapped_function

      # describe 'Jacket ( Anonymous function ) ', -> 

      #   before -> 
      #     @anonymous = Jacket(anonymous)

      #   it 'should return wrapped function', -> 
      #     @anonymous.should.match Helpers.wrapped_function

      #   describe 'should have', -> 

      #     it 'copies of origin object properties', -> 
      #       @w.should.have.ownProperty 'prop'
      #       @w.prop.should.equal obj.prop
      #       @w.prop = false
      #       obj.prop.should.be.ok

      #     it 'wrapped origin object methods', -> 
      #       @w.should.have.ownProperty 'method'
      #       @w.method.toString().should.not.eq obj.method.toString()
      #       @w.method.should.match Helpers.wrapped_function

