'use strict';

exports.index=function(request,response){
    console.log(app.db);
    response.render('pages/fetch');
};

exports.create=function(request,response){
    response.render('pages/fetch/create');
};

