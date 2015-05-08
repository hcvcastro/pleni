'use strict';

module.exports=function(app){
    var authed=app.get('auth');

    app.get('/resources/view',authed,function(request,response){
        response.render('pages/resources');
    });
};

