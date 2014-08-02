'use strict';

var home=require('./controllers/home')
  , settings=require('./controllers/settings')
  , repositories=require('./controllers/repositories');

module.exports=function(app){
    app.get('/',home.index);
    app.get('/home',home.home);

    app.post('/settings/testdb',settings.testdb);
    app.post('/settings/savedb',settings.savedb);
    app.get('/settings',settings.index);

    app.post('/repositories',repositories.create);
    app.get('/repositories',repositories.index);
};

