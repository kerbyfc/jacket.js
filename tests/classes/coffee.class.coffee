class CoffeeClass

  @static_method = -> 
    'static_method'

  @static_property = 'static_property'

  received: {}

  constructor: (id = 1) -> 

    @id = id

    this.method_defined_in_constructor = -> 
      'method_defined_in_constructor'

  prototype_method: -> 
    @created_in_prototype_method = (@created_in_prototype_method ?= 0) + 1
    'prototype_method'

  test: -> 
    'called_from_constructor'

  binded_method: => 
    'binded_method'

  parent_method: -> 
    'parent_method'

class ExtendedCoffeeClass extends CoffeeClass

  @static_method = -> 
    'static_method'

  @static_method_2 = -> 
    'static_method_2'

  @static_property = 'static_property'

  received: {}

  constructor: (id = 2) -> 

    super
    @id = id

  prototype_method: -> 
    @created_in_prototype_method = (@created_in_prototype_method ?= 0) + 1
    'prototype_method'

  test: -> 
    'called_from_constructor'

  binded_method: => 
    'binded_method'

this.CoffeeClass = CoffeeClass
this.ExtendedCoffeeClass = ExtendedCoffeeClass