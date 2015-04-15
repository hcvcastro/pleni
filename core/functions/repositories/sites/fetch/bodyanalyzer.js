'use strict';

var request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , _url=require('url')
  , base='../../../../../core/functions/analyzers/'
  , htmlanalyzer=require(base+'/html/linkanalyzer')

/*
 * Function for links analysis in HTML BODY
 * args input
 *      task
 *          wait
 *              id
 *              url
 *          head
 *              status
 *              headers
 *              get
 *              location (*)
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 *
 * args output
 *      task
 *          refs
 *          rels
 */
module.exports=function(args){
    var deferred=Q.defer()

    if(!args.task.head.get){
        deferred.resolve(args);
    }else{
        if(args.debug){
            console.log('analyzing the body for request');
        }

        // HTML analyzer
        if(/text\/html/i.test(args.task.head.headers['content-type'])){
            htmlanalyzer({
                site:args.task.wait.url
              , url:_url.parse(args.task.wait.url+args.task.wait.id.substr(5))
              , body:args.task.get.body
            })
            .done(function(args2){
                args.task.refs=args2.refs;
                args.task.rels=args2.rels;
                deferred.resolve(args);
            });
        }else{
            deferred.resolve(args);
        }
    }

    return deferred.promise;
};

