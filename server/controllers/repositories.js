'use strict';

// validation of fields
var validator=require('validator')
  , validateRepository=function(repository){
        return repository.match(/^[a-z][a-z0-9_]*$/i);
    };

exports.index=function(request,response){
    response.render('pages/repositories');
};

exports.create=function(request,response){
    var repository=request.body.repository;

    // validation
    if(!validateRepository(repository)){
        response.json({result:false,message:'Validation error'});
        return;
    }

    response.json({result:true,message:'Repository created'});
};

