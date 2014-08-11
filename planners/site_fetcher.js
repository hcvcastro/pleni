'use strict';

var server=require('./functions/server')
  , planner=require('./functions/planner')
  , f=require('./functions/couchdb')
  , g=require('./functions/sites_creator')
  , h=require('./functions/sites_fetcher')

var task=function(){
    var packet={
        host:'http://localhost:5984'
      , dbuser:'jacobian'
      , dbpass:'asdf'
      , dbname:'pleni_site_galao'
    }

    f.testcouchdb(packet)
    .then(h.getsitetask)
    .then(h.looksitetask)
    .then(h.getheadrequest)
    .then(h.getgetrequest)
    .then(h.bodyanalyzerlinks)
    .then(h.completesitetask)
    .then(h.spreadsitelinks)
    .fail(function(error){
        console.log('error:');
        console.log(error);
    })
    .done(function(args){
        console.log('task finished');
    });
}

server(planner(task,Number.POSITIVE_INFINITY,1000),3001);

exports.app=server.app;
exports.messages=server.messages;

