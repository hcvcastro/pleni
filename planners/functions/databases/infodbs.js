'use strict';

var request=require('request')
  , Q=require('q')
  , infodb=require('./infodb')

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
            if(args.db.prefix==''){
                return true;
            }else{
                return element.lastIndexOf(args.db.prefix,0)===0;
            }
        })

    if(args.debug){
        console.log('getting all databases with prefix ... \''
            +args.db.prefix+'\'');
    }
    Q.all(filter.map(function(element){
        var params={
            db:{
                host:args.db.host
              , name:element
            }
          , auth:{
                cookie:args.auth.cookie
            }
        }

        if(args.debug){
            params.debug=args.debug;
        }

        return infodb(params);
    }))
    .spread(function(){
        if(args.debug){
            console.log('spreading the info db for ... '+arguments.length);
        }
        var map=new Array()

        for(var i in arguments){
            map.push(JSON.parse(arguments[i].db.info));
        }
        args.db.explist=map;
        deferred.resolve(args);
    })
    .done(function(args){
        deferred.resolve(args);
    });

    return deferred.promise;
};

