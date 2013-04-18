describe 'Common Jacket implementation', -> 

  obj = 
    method: -> 
      'method'
    prop: 'prop'

  anonymous = -> 
    false

  describe 'Jacket ( Object )', -> 

    beforeEach -> 
      @w = J(obj)

    it 'should return new object', -> 
      @w.should.not.eq obj
      @w.should.be.instanceOf Object

    it 'should copy origin object property', -> 
      @w.should.have.ownProperty 'prop'
      @w.prop.should.equal obj.prop
      @w.prop = false
      obj.prop.should.be.ok

    it 'should wrap origin object methods', -> 
      @w.should.have.ownProperty 'method'
      @w.method.toString().should.not.eq obj.method.toString()
      @w.method.should.match Helpers.wrapped_function

  describe 'Jacket ( \'MyFunc\', function ) ', -> 

    it 'should give the name to anonymous function', -> 

      @w = J('Myfunc', anonymous)
      console.log "NAME", @w.name


