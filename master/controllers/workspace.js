'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , test=require('../../planners/functions/databases/test')
  , auth=require('../../planners/functions/databases/auth')
  , viewers='../../planners/functions/repositories/sites'
  , getsummary=require(viewers+'/view/getsummary')
  , getmapsite=require(viewers+'/view/getmapsite')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app){
    app.get('/workspace/view',function(request,response){
        response.render('pages/workspace');
    });

    var generic_document=function(request,response,func,done){
        var id_p=validate.toString(request.params.project)
          , id_r=validate.toString(request.params.repository)
          , resources=app.get('resources')
          , project=get_element(id_p,app.get('projects'))
          , repository=get_element(id_r,resources.repositories)
          , dbserver=get_element(repository[1]._dbserver,resources.dbservers)

        if(project&&repository&&dbserver){
            test({
                db:{
                    host:dbserver[1].db.host+':'+
                         dbserver[1].db.port
                  , user:dbserver[1].db.user
                  , pass:dbserver[1].db.pass
                  , name:repository[1].db.name
                }
            })
            .then(auth)
            .then(func)
            .then(done)
            .fail(function(error){
                if(error.code=='ECONNREFUSED'){
                    response.status(404).json(_error.network);
                }else if(error.error=='not_found'){
                    response.status(404).json(_error.network);
                }else if(error.error=='unauthorized'){
                    response.status(401).json(_error.auth);
                }
            })
            .done();
        }else{
            response.status(404).json(_error.notfound);
        }
    };

    app.get('/workspace/:project/:repository/summary',
    function(request,response){
        return generic_document(request,response,getsummary,function(args){
            response.status(200).json(args.site.summary);
        });
    });

    app.get('/workspace/:project/:repository/mapsite',
    function(request,response){
        return generic_document(request,response,getmapsite,function(args){
            response.status(200).json(args.site.mapsite);
        });
    });
};

