'use strict';

var request=require('request')
  , Q=require('q')

/*
 * args definition:
 *      host
 */
exports.testcouchdb=function(args){
    var deferred=Q.defer()
      , url=args.host

    request.get({url:url},function(error,response){
        if(!error){
            if(response.statusCode==200){
                if(JSON.parse(response.body).couchdb){
                    deferred.resolve(args);
                    return;
                }
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
 *      dbuser
 *      dbpass
 */
exports.couchdbauth=function(args){
    var deferred=Q.defer()
      , url=args.host+'/_session'
      , body={
            name:args.dbuser
          , password:args.dbpass
        }

    request.post({url:url,json:body},function(error,response){
        if(!error){
            if(response.statusCode==200){
                var regex=/^(.*); Version=1;.*$/i
                  , exec=regex.exec(response.headers['set-cookie'])
                
                args['cookie']=exec[1];
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
 *      cookie
 */
exports.listdb=function(args){
    var deferred=Q.defer()
      , url=args.host+'/_all_dbs'
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args['all_dbs']=JSON.parse(response.body);
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
 *      dbname
 *      cookie
 */
var getdb=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.get({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==200){
                args['getdb']=response.body
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
exports.getdb=getdb;

/*
 * args defintion
 *      host
 *      cookie
 *      prefix
 *      all_dbs
 */
exports.getdbs=function(args){
    var deferred=Q.defer()
      , list=args['all_dbs']
      , filter=list.filter(function(element){
            return element.lastIndexOf(args.prefix,0)===0
        })

    Q.all(filter.map(function(element){
        return getdb({
            host:   args.host
          , cookie: args.cookie
          , dbname: element
        });
    }))
    .spread(function(){
        var map=new Array()

        for(var i in arguments){
            map.push(JSON.parse(arguments[i].getdb));
        }
        deferred.resolve(map);
    })
    .done(function(args){
        deferred.resolve(args);
    });

    return deferred.promise;
};

/*
 * args definition
 *      host
 *      dbname
 *      cookie
 */
exports.createdb=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.put({url:url,headers:headers},function(error,response){
        if(!error){
            if(response.statusCode==201){
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
 *      dbname
 *      cookie
 */
exports.deletedb=function(args){
    var deferred=Q.defer()
      , url=args.host+'/'+args.dbname
      , headers={
            'Cookie':args.cookie
          , 'X-CouchDB-WWW-Authenticate':'Cookie'
        }

    request.del({url:url,headers:headers},function(error,response){
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

