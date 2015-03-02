'use strict';

var should=require('should')
  , jayschema=require('jayschema')
  , js=new jayschema()

describe('testing for json schema validation',function(){
    it('primitive validation',function(done){
        var schema={'type':'integer'}
          , cases=[
                [1,true]
              , ['a',false]
              , [true,false]
            ]

        cases.forEach(function(element){
            var result=js.validate(element[0],schema);
            result.should.be.Array;
            if(element[1]){
                result.should.be.empty;
            }else{
                result.should.be.not.empty;
            }
        });
        done();
    });
    it('primitive validation',function(done){
        var schema={'type':'string'}
          , cases=[
                [1,false]
              , ['a',true]
              , [true,false]
            ]

        cases.forEach(function(element){
            var result=js.validate(element[0],schema);
            result.should.be.Array;
            if(element[1]){
                result.should.be.empty;
            }else{
                result.should.be.not.empty;
            }
        });
        done();
    });
    it('basic container validation',function(done){
        var schema={
                'type':'object'
              , 'properties':{
                    'one':{
                        'type':'string'
                    }
                  , 'two':{
                        'type':'string'
                    }
                }
              , 'required':['one']
            }
          , cases=[
                [{},false]
              , [[],false]
              , [{'one':true},false]
              , [{'one':'one'},true]
              , [{'two':'two'},false]
              , [{'one':'one','two':'two'},true]
            ]

        cases.forEach(function(element){
            var result=js.validate(element[0],schema);
            result.should.be.Array;
            if(element[1]){
                result.should.be.empty;
            }else{
                result.should.be.not.empty;
            }
        });
        done();
    });
});

