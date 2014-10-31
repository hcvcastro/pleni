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
 *
 * args output
 *      db
 *          explist
 */
module.exports=function(args){
    var deferred=Q.defer()
      , list=args.db.list
      , filter=list.filter(function(element){
            return element.lastIndexOf(args.db.prefix,0)===0
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
        args.db.explist=map
        deferred.resolve(args);
    })
    .done(function(args){
        deferred.resolve(args);
    });

    return deferred.promise;
};

