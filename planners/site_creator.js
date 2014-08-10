'use strict';

var server=require('./functions/server')
  , planner=require('./functions/planner')
  , f=require('./functions/couchdb')
  , g=require('./functions/sites_creator')

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
    .then(g.createdesigndocument)
    .fail(function(error){
        console.log(error);
    })
    .done(function(args){
        console.log('repository created');
        console.log(args);
    });
}

server(planner(task,1,1000),3001);

exports.app=server.app;
exports.messages=server.messages;

