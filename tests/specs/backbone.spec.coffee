describe 'Backbone.View.extend', -> 

  before ->
    @W = Jacket(BackboneView)

  describe 'Jacket ( BackboneView )', -> 

    it 'should return new class',  ->
      @W.should.not.equal BackboneView

    describe 'should have', -> 

      it 'correct name', -> 
        @W.name.should.equal 'OLOL'

      it 'wrapped prototype methods of __super__', -> 
        for own prop, val of @W.prototype
          if typeof val is 'function' and prop isnt 'constructor'
            console.log ' >>>> ', prop, val
            val.should.match Helpers.wrapped_function 

    
      
  