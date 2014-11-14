'use strict';

module.exports=function(app){
    app.get('/tasks/view',function(request,response){
        response.render('pages/tasks');
    });
};

