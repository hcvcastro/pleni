'use strict';

var request=require('request')
  , Q=require('q')

/*
 * Function for propagate refs in site repository
 * args inputs
 *      db
 *          host
 *          name
 *      task
 *          wait
 *              id
 *              key
 *              value
 *          ref
 *              related
 */
module.exports=function(args){
    var deferred=Q.defer()
      , url=args.db.host+'/'+args.db.name
      , documents=[]

    if(args.task.ref.related){
        args.task.ref.related.forEach(function(element){
            var doc='/page_'+encodeURIComponent(element)
              , document={
                    status:'wait'
                  , url:args.task.wait.key
                  , type:'page'
                  , timestamp:Date.now()
            };

            request.put({url:url+doc,json:document},function(error,response){
                if(!error){
                    documents.push(element);
                }
            });
        });

        deferred.resolve(args);
    }

    return deferred.promise;
};

