'use strict';

var request=require('request')
  , Q=require('q')

/*
 * args definition
 *      host
 */
exports.testplanner=function(args){
    var deferred=Q.defer()
      , url=args.host

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                if(JSON.parse(response.body).planner){
                    deferred.resolve(args);
                    return;
                }
            }
            deferred.reject(JSON.parse(response.body));
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 */
exports.api=function(args){
    var deferred=Q.defer()
      , url=args.host+'/_api'

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args['all_tasks']=JSON.parse(response.body);
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/* args definition
 *      host
 *      task <-- the task for planner
 *          name
 *          count
 *          interval
 */
exports.set=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'
      , body={
            task:args.task.name
          , count:args.task.count
          , interval:args.task.interval
        }

    request.post({url:url,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args['tid']=response.body.tid
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      tid <-- task id
 *      targs <-- arguments needed for task
 */
exports.run=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.tid+'/_run'
      , body=args.targs

    request.post({url:url,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      tid <-- task id
 */
exports.stop=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.tid+'/_stop'

    request.post({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      tid <-- task id
 */
exports.delete=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.tid

    request.del({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                deferred.resolve(args);
                return;
            }
            deferred.reject(response.body);
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

