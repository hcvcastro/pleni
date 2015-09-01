'use strict';

var extend=require('underscore').extend
  , validate=require('../../core/validators')
  , join=require('path').join
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , test=require('../../core/functions/databases/test')
  , auth=require('../../core/functions/databases/auth')
  , remove=require('../../core/functions/databases/remove')
  , sites='../../core/functions/repositories/sites'
  , getsummary=require(sites+'/view/getsummary')
  , getdocument=require(sites+'/view/getdocument')
  , getrequests1=require(sites+'/view/getrequests1')
  , getrequests2=require(sites+'/view/getrequests2')
  , getpages1=require(sites+'/view/getpages1')
  , getpages2=require(sites+'/view/getpages2')
  , getfiles1=require(sites+'/view/getfiles1')
  , getfiles2=require(sites+'/view/getfiles2')
  , getmimetypes=require(sites+'/view/getmimetypes')
  , getsitemap=require(sites+'/view/getsitemap')
  , getreport=require(sites+'/view/getreport')
  , gettimestamp=require(sites+'/summarize/gettimestamp')
  , summarize=require(sites+'/summarize/summarize')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app,config){
    var authed=app.get('auth');

    app.get('/workspace/view',authed,function(request,response){
        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','..','client',
                    'workspace.html'));
        }else{
            response.render('pages/workspace');
        }
    });

    var generic_document=function(request,response,init,func,done){
        var id_p=validate.toString(request.params.project)
          , id_r=validate.toString(request.params.repository)
          , resources=request.user.resources

        var project=get_element(id_p,request.user.projects)
        if(!project){
            response.status(404).json(_error.notfound);
            return;
        }
        
        var repository=get_element(id_r,resources.repositories);
        if(!repository){
            response.status(404).json(_error.notfound);
            return;
        }
        
        var dbserver=get_element(repository[1]._dbserver,resources.dbservers);
        if(!dbserver){
            response.status(404).json(_error.notfound);
            return;
        }

        var packet={
            db:{
                host:dbserver[1].db.host+':'+
                     dbserver[1].db.port
              , user:dbserver[1].db.user
              , pass:dbserver[1].db.pass
              , name:repository[1].db.name
            }
        }

        if(dbserver[1].attrs.virtual){
            packet.db.host+='/dbserver';
        }

        packet=extend(init,packet);
        func.unshift(auth);

        func.reduce(function(previous,current){
            return previous.then(current);
        },test(packet))
        .then(done)
        .fail(function(error){
            if(error.code=='ECONNREFUSED'){
                response.status(404).json(_error.network);
            }else if(error.error=='not_found'){
                response.status(404).json(_error.network);
            }else if(error.error=='unauthorized'){
                response.status(401).json(_error.auth);
            }else if(error.statusCode==404){
                response.status(404).json(_error.notfound);
            }else{
                console.log(error);
                response.status(403).json(_error.json);
            }
        })
        .done();
    };

    app.get('/workspace/:project/:repository/summary',authed,
    function(request,response){
        return generic_document(request,response,{},
            [getsummary],function(args){
            if(args.site&&args.site.summary){
                response.status(200).json(args.site.summary);
            }else{
                response.status(404).json(_error.notfound);
            }
        });
    });

    app.post('/workspace/:project/:repository/summarize',authed,
    function(request,response){
        return generic_document(request,response,{},
            [getsummary,gettimestamp,summarize],function(args){
            response.status(200).json(_success.ok);
        });
    });

    app.post('/workspace/:project/:repository/remove',authed,
    function(request,response){
        return generic_document(request,response,{},
            [remove],function(args){
            response.status(200).json(_success.ok);
        });
    });

    app.get('/workspace/:project/:repository/requests',authed,
    function(request,response){
        return generic_document(request,response,{
            site:{
                filters:request.query.filters
              , offset:request.query.offset
              , limit:request.query.limit
            }},
            [getrequests1,getrequests2],function(args){
            response.status(200).json({
                total:args.site.total
              , list:args.site.list
            });
        });
    });

    app.get('/workspace/:project/:repository/pages',authed,
    function(request,response){
        return generic_document(request,response,{
            site:{
                filters:request.query.filters
              , offset:request.query.offset
              , limit:request.query.limit
            }},
            [getpages1,getpages2],function(args){
            response.status(200).json({
                total:args.site.total
              , list:args.site.list
            });
        });
    });

    app.get('/workspace/:project/:repository/files',authed,
    function(request,response){
        return generic_document(request,response,{
            site:{
                filters:request.query.filters
              , offset:request.query.offset
              , limit:request.query.limit
            }},
            [getfiles1,getfiles2],function(args){
            response.status(200).json({
                total:args.site.total
              , list:args.site.list
            });
        });
    });

    app.get('/workspace/:project/:repository/mimetypes',authed,
    function(request,response){
        return generic_document(request,response,{},
            [getmimetypes],function(args){
            response.status(200).json(args.site.list);
        });
    });

    app.get('/workspace/:project/:repository/report',authed,
    function(request,response){
        return generic_document(request,response,{},[getreport],function(args){
            response.status(200).json(args.site.report);
        });
    });

    app.get('/workspace/:project/:repository/sitemap',authed,
    function(request,response){
        return generic_document(request,response,{},[getsitemap],function(args){
            response.status(200).json(args.site.sitemap);
        });
    });

    app.get(/^\/workspace\/(.+?)\/(.+?)\/(.+)$/,authed,
    function(request,response){
        request.params.project=request.params[0];
        request.params.repository=request.params[1];
        request.params.document=request.params[2];

        return generic_document(request,response,{
            site:{doc:{id:request.params.document}}},
            [getdocument],function(args){
            response.status(200).json(args.site.doc.content);
        });
    });
};

