'use strict';

exports.index=function(request,response){
    response.render('index');
};

exports.home=function(request,response){
    response.render('pages/home');
};

