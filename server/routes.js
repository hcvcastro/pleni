'use strict';

var home=require('./routes/home')
  , settings=require('./routes/settings')
  , fetch=require('./routes/fetch');

module.exports=function(app){
    app.get('/',home.index);
    app.get('/home',home.home);
    app.get('/settings',settings.index);
    app.get('/fetch',fetch.index);
};

