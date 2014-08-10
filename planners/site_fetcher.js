'use strict';

var server=require('./functions/server')
  , planner=require('./functions/planner')
  , f=require('./functions/couchdb')
  , g=require('./functions/sites')

var task=function(){
    var packet={
        host:'http://localhost:5984'
      , dbuser:'jacobian'
      , dbpass:'asdf'
      , dbname:'pleni_site_two'
      , site_type:'site'
      , site_url:'http://galao.main'
    }

    f.testcouchdb(packet)
    .then(f.couchdbauth)
    .then(f.createdb)
    .then(g.createsummary)
    .then(g.createrootsite)
    .then(g.createdesignview)
    .fail(function(error){
        console.log(error);
    })
    .done(function(){
        console.log('repository created');
    });
}

server(planner(task,1,1000),3001);

exports.app=server.app;
exports.messages=server.messages;


/*
        functions.get({
            host:'http://localhost:5984'
          , dbname:'/pleni_site_one'
          , view:'/_design/default/_view/wait'
        })
        .then(functions.look)
        .then(functions.headers)
        .then(functions.fetch)
        .then(functions.scrap)
        .then(functions.register)
        .then(functions.spread)
        .fail(function(error){
            if(error){
                console.log('ERROR');
                console.log(error);
                self.stop();
            }
        })

};
*/
