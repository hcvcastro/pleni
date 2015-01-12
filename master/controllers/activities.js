'use strict';

module.exports=function(app){
    app.get('/activities/view',function(request,response){
        response.render('pages/activities');
    });
};

