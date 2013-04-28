example( 'anonymous', function() {

  window.view = J('Jacket.View', Backbone.View, {
    el: '.test',
    constructor: function() {
      view.__super__.constructor.apply(this, arguments);
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
      view.__super__.render.apply(this, arguments);
      this.$el.append('<span>cool</span>');
      console.log(this.ADDITIOANAL(), this.i);
    },
    view1method: function() {
      console.log('aaahahahahahah');
    }
  });

  var view2 = J('View2', view, {
    constructor: function() {
      this.__super__.constructor.apply(this, arguments);
      console.log('view2', this);
      this.view1method();
    }
  });

  window.v1 = new view;
  window.v2 = new view2;

  v2.render();


  log(v1); 

  /* 
    - хочу получить:
    jacket:
      _events: ...
      intitialize ...
      constructor ....
  */



});