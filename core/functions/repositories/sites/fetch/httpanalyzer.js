'use strict';

var request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
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
 *          response
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

    if(args.debug){
        console.log('analyzing the response for request');
    }

    if(args.task.response.body){
        // HTTP Body
        if(/text\/html/i.test(args.task.response.headers['content-type'])){
            linkanalyzer({
                site:args.task.wait.url
              , url:_url.parse(args.task.wait.url+args.task.wait.id.substr(5))
              , body:args.task.response.body
            })
            .done(function(args2){
                args.task.refs=args2.refs;
                args.task.rels=args2.rels;
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

