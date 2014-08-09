'use strict';

var request=require('request')
  , Q=require('q')

/*
 *  args definition:
 *      host  <-  http://localhost:5894
 */
exports.testcouchdb=function(args){
    var deferred=Q.defer()
      , url=args.host;

    request.get({url:url},function(error,response){
        if(!error&&response.statusCode==200){
            if(JSON.parse(response.body).couchdb){
                deferred.resolve(args);
            }else{
                throw new Error('JSON parsing error');
            }
        }
        deferred.reject(error);
    });

    return deferred.promise;
};

