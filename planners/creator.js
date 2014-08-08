'use strict';

var express=require('express')
  , bodyparser=require('body-parser')
  , http=require('http')
  , request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , app=express();

var planner={
    interval: 3000
  , run:function(){
        console.log('Run ... '+Date.now());
        this.stop();
        var self=this;
        this.id=setTimeout(function(){self.task();},this.interval);
    }
  , stop:function(){
        if(typeof this.id=='object'){
            console.log('Stop ... '+Date.now());
            clearTimeout(this.id);
            delete this.id;
        }
    }
  , task:function(){
        var self=this;
        functions.testcouchdb({
            host:'http://localhost:5984'
          , dbname:'/pleni_site_two'
          , dbuser: 'jacobian'
          , dbpass: 'asdf'
          , view:'/_design/default/_view/wait'
        })
        .then(functions.auth)
        .then(functions.createdb)
        .fail(function(error){
            if(error){
                console.log('ERROR');
                console.log(error);
                self.stop();
            }
        })
        .done(function(){
            console.log('finish task.');
        })
    }
};

var functions={
    testcouchdb:function(args){
        var deferred=Q.defer()
          , url=args.host;

        request.get({url:url},function(error,response,body){
            if(!error&&response.statusCode==200){
                var json=JSON.parse(body);
                if(json.couchdb){
                    deferred.resolve([args]);
                }
            }
            deferred.reject(error);
        });

        return deferred.promise;
    }
  , auth:function(args){
        var deferred=Q.defer()
          , url=args[0].host+'/_session'
          , body={
              name:args[0].dbuser
            , password:args[0].dbpass
          };

        request.post({url:url,json:body},function(error,response,body){
            if(!error&&response.statusCode==200){
                console.log(response.headers['set-cookie']);
                //deferred.resolve(args.concat(response.headers['set-cookie']));
            }
        });

        return deferred.promise;
  }
  , createdb:function(args){
        var deferred=Q.defer()
          , url=args[0].host+args[0].dbname
          , jar=request.jar()
          , cookie=request.cookie(args[1])

        jar.setCookie(cookie);
        request.put({url:url,jar:jar},function(error,response,body){
            if(!error){
                if(response.statusCode==401){
                    
                }
                console.log(response.statusCode);
            }
            deferred.reject(error);
        });

        return deferred.promise;
    }
};

var messages={
    ready: {planner:'ready!!'}
  , run:   {planner:'running'}
  , stop:  {planner:'stopped'}
};

app.set('port',process.env.PORT||3001);
app.disable('x-powered-by');
app.use(bodyparser.json())

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express server listening on port '+app.get('port'));
});

app.get('/',function(request,response){
    response.json(messages.ready);
});

app.post('/_run',function(request,response){
    planner.run();
    response.json(messages.run);
});

app.post('/_stop',function(request,response){
    planner.stop();
    response.json(messages.stop);
});

module.exports=app;
module.exports.messages=messages;

planner.run();
