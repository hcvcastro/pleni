'use strict';

module.exports=function(app){
    app.get('/resources/view',function(request,response){
        response.render('pages/resources');
    });
};

