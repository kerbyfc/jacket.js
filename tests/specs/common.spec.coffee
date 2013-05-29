describe 'Базовые объекты javascript', -> 

  object = {}
  anonymous = -> 'anonymous'
  `var named = function named() {return false;}`

  objects = [object, anonymous, named] 

  for obj in objects
    
    obj.method = -> 'method'
    obj.prop = 'prop'

    do (obj) =>

      name = ( if typeof obj is 'function' and obj.name is '' then 'anonymous ' else '' ) + ' ' + obj.constructor.name
      w = J(obj)

      describe 'выражение Jacket ( ' + name + ' )', -> 

        it 'должено вернуть новый объект', -> 
          w.should.not.eq obj
          w.should.be.instanceOf Object

        describe 'который должен иметь', ->
          
          it 'копии свойств базового объекта', -> 
            w.should.have.ownProperty 'prop'
            w.prop.should.equal obj.prop
            w.prop = false
            obj.prop.should.be.ok

          it 'обернутые методы базового объекта', -> 
            w.should.have.ownProperty 'method'
            w.method.toString().should.not.eq obj.method.toString()
            w.method.should.match Helpers.wrapped_function