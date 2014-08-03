'use strict';

module.exports=function(app){
    app.get('/repositories',function(request,response){
        response.render('pages/repositories');
    });

    app.post('/repositories',function(request,response){
        var validate=require('../validators')
          , repository=request.body.repository;

        response.json({result:true,message:'Repository created'});
    });
};

