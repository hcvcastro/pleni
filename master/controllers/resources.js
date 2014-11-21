'use strict';

module.exports=function(app,resources){
    app.get('/resources/view',function(request,response){
        response.render('pages/resources');
    });
};

