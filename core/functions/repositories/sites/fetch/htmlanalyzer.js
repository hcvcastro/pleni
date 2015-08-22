'use strict';

var request=require('request')
  , Q=require('q')
  , _url=require('url')
  , base='../../../../../core/functions/analyzers/'
  , linkanalyzer=require(base+'/html/linkanalyzer')

/*
 * Function for links analysis in HTML BODY
 * args input
 *      task
 *          wait
 *              id
 *              url
 *          head
 *              headers
 *          get
 *              status
 *              headers
 *              body
 *
 * args output
 *      task
 *          refs
 *          rels
 */
module.exports=function(args){
    var deferred=Q.defer()

    if(!args.task.rels){
        args.task.rels=[];
    }

    if(!args.task.refs){
        args.task.refs=[];
    }

    if('location' in args.task.head.headers){
        var url1=_url.parse(args.task.wait.url)
          , url2=_url.parse(_url.resolve(args.task.wait.url,
                args.task.head.headers.location))

        if(url1.host===url2.host){
            args.task.rels.push({
                tag:'location'
              , url:args.task.head.headers['location']
            });
        }else{
            args.task.refs.push({
                tag:'location'
              , url:args.task.head.headers['location']
            });
        }
    }

    if(args.task.get&&args.task.get.body){
        // HTML Body
        if(/text\/html/i.test(args.task.get.headers['content-type'])){
            if(args.debug){
                console.log('analyzing the response for request');
            }

            linkanalyzer({
                site:args.task.wait.url
              , url:_url.resolve(args.task.wait.url,
                    args.task.wait.id.split('::')[3])
              , body:args.task.get.body
            })
            .done(function(args2){
                Array.prototype.push.apply(args.task.refs,args2.refs);
                Array.prototype.push.apply(args.task.rels,args2.rels);
                deferred.resolve(args);
            });
        }else{
            deferred.resolve(args);
        }
    }else{
        deferred.resolve(args);
    }

    return deferred.promise;
};

