example( 'anonymous', function() {

  var view = J('View', Backbone.View, {
    constructor: function() {
      this.__super__.constructor.apply(this, arguments);
      console.log(' +++++++++++++ ');
      this.i = 1;
    },
    ADDITIOANAL: function() {
      return 'lol'
    },
    initialize: function() {
      // super()
    },
    render: function() {
      console.log("RENDER");
      this.__super__.render.apply(this, arguments);
    }
  });

  console.log(view);

  v = new view();
  console.log(v);

  v.render();

  /* 
    - хочу получить:
    jacket:
      _events: ...
      intitialize ...
      constructor ....
  */



});