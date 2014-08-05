'use strict';

var express=require('express')
  , bodyparser=require('body-parser')
  , http=require('http')
  , request=require('request')
//  , cheerio=require('cheerio')
  , app=express();

var planner={
    interval: 2000
  , run:function(){
        this.stop();
        var self=this;
        this.id=setInterval(function(){self.task();},this.interval);

        console.log('Run ... '+Date.now());
    }
  , stop:function(){
        if(typeof this.id=='object'){
            clearInterval(this.id);
            delete this.id;

            console.log('Stop ... '+Date.now());
        }
    }
  , task:function(){
        var self=this;
        var couchdb='http://localhost:5984';
        var dbname='/pleni_site_one';
        var view='/_design/default/_view/wait?limit=1';
        var url=couchdb+dbname+view;

        console.log('    Request a waiting document');
        request({method:'GET',url:url},function(error,response,body){
            if(!error&response.statusCode==200){
                var json=JSON.parse(body);

                if(json.total_rows==0){
                    self.stop();
                }else{
                    var row=json.rows[0];

                    console.log('    Look the document: '+row.id+' '+row.value);
                    var doc='/page_'+'%2F'
                    var url2=couchdb+dbname+doc;
                    var body={
                        _rev:row.value,
                        site:row.key,
                        status:'look',
                        timestamp:Date.now()
                    };

                    functions.look(url2,body);
                }
            }
        });
    }
};

var functions={
    get:function(url,success,error){
        request({
            method:'GET',
            url:url
        },function(error,response,body){
            if(!error&response.statusCode==200){
                var json=JSON.parse(body);
                if(json.total_rows==0){
                    error();
                }else{

                }
            }else{
                error();
            }
        });
    },
    look:function(url,doc){
        request({
            method:'PUT',
            url:url,
            json:doc
        },function(error,response,body){
            console.log(body);
        });
    },
    scrap:function(){
        request(url,function(error,response,body){
            if(!error){
                var $=cheerio.load(body);
                console.log('script');
                $('script').each(function(i,element){
                    console.log($(this).attr('src'));
                });
                console.log('link');
                $('link').each(function(i,element){
                    console.log($(this).attr('href'));
                });
                console.log('a');
                $('a').each(function(i,element){
                    console.log($(this).attr('href'));
                });
                console.log('img');
                $('img').each(function(i,element){
                    console.log($(this).attr('src'));
                });
            }
        });
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

