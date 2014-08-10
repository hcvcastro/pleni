'use strict';

module.exports=function(app){
    var validate=require('../validators')
      , paqSuccess=require('../json-response').success
      , paqError=require('../json-response').error;

    app.get('/fetch',function(request,response){
        response.render('pages/fetch');
    });

    app.get('/repositories',function(request,response){
        var db=global.app.db
          , nano=require('nano')('http://'+db.host+':'+db.port);

        nano.db.list(function(err,body){
            response.json(JSON.stringify(body.filter(function(element){
                return element.indexOf(db.prefix)==0;
            })));
        });
    });

    app.put('/repositories',function(request,response){
        response.json(paqError.notimplemented);
    });

    app.post('/repositories',function(request,response){
        var db=global.app.db
          , nano=require('nano')('http://'+db.host+':'+db.port)
          , repository=request.body.repository;

        // validation
        if(!validate.validSlug(repository)){
            response.json(paqError.validation);
            return;
        }

        nano.db.create(db.port+repository,function(err,body){
            if(err){
                throw err;
            }

            response.json(paqSuccess.dbcreate);
        });

        response.json(paqError.connection);
    });

    app.delete('/repositories',function(request,response){
        response.json(paqError.notimplemented);
    });

    app.get('/repositories/:repository',function(request,response){
        var db=global.app.db
          , nano=require('nano')('http://'+db.host+':'+db.port)
          , repository=request.params.repository;

        // validation
        if(!validate.validSlug(repository)){
            response.json(paqError.validation);
            return;
        }

        data=nano.db.use(repository);
    });
};

