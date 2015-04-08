'use strict';

var should=require('should')
  , fs=require('fs')
  , join=require('path').join
  , base='../../../../../core/functions/'
  , analyzer=require(base+'analyzers/html/linkanalyzer')

describe('test link analyzer',function(){
    [
        'test01.html'
      , 'test02.html'
      , 'test03.html'
    ].forEach(function(item){
        var body='';

        before(function(done){
            fs.readFile(join(__dirname,'..','data',item),'utf8'
                ,function(err,data){
                if(err){
                    throw err;
                }

                body=data;
                done();
            })
        });

        it('test spreading links',function(done){
            analyzer({
                url:'http://localhost'
              , body:body
            })
            .done(function(args){
                console.log(args);
                done();
            });
        });
    });
});

