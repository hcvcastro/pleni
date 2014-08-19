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
exports.take=function(args){
    var deferred=Q.defer()
      , url=args.host+'/clock?count=1&delay=1000'

    request.put({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var body=JSON.parse(response.body);
                args['tid']=body.tid
                deferred.resolve(args);
                return;
            }
            deferred.reject(JSON.parse(response.body));
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

/* args definition
 *      host
 *      tid <-- task id (given in takecontrol)
 */
exports.loose=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.tid

    request.del({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var body=JSON.parse(response.body);
                deferred.resolve(args);
                return;
            }
            deferred.reject(JSON.parse(response.body));
            return;
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

