'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for getting information of multiple databases
 * args input
 *      db
 *          host
 *          prefix
 *          list
 *      auth
 *          cookie
 */
exports.getdbs=function(args){
    var deferred=Q.defer()
      , list=args.db.list
      , filter=list.filter(function(element){
            return element.lastIndexOf(args.prefix,0)===0
        })

    Q.all(filter.map(function(element){
        return getdb({
            host:args.db.host
          , cookie:args.auth.cookie
          , dbname:element
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

