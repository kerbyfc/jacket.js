example( 'anonymous', function() {

  var view = J('Jacket.View', Backbone.View, {
    el: '.test',
    constructor: function() {
      console.log(this);
      this.__super__.constructor.apply(this, arguments);
      console.log(' +++++++++++++ ');
      this.i = 1;
      console.log(this.i);
    },
    ADDITIOANAL: function() {
      return 'lol'
    },
    initialize: function() {
      // super()
    },
    render: function() {
      this.__super__.render.apply(this, arguments);
      this.$el.append('<span>cool</span>');
      console.log(this.ADDITIOANAL(), this.i);
    }
  });

  console.log('VIEW', view);

  var view2 = J('View2', view, {
    constructor: function() {
      this.__super__.constructor.apply(this, arguments);
      console.log('view2');
    }
  });

  var v1 = new view;
  var v2 = new view2;




  /* 
    - хочу получить:
    jacket:
      _events: ...
      intitialize ...
      constructor ....
  */



});