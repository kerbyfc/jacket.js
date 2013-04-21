describe 'Backbone.View.extend', -> 

  before ->
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

    
      
  