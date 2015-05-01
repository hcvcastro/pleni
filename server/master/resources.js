'use strict';

module.exports=function(app){
    var auth=app.get('auth');

    app.get('/resources/view',auth,function(request,response){
        response.render('pages/resources');
    });
};

