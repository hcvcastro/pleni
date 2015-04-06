'use strict'

var request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , _url=require('url')

/*
 * Function for links extraction in a text/html document
 * args input
 *      url
 *      body
 *
 * args output
 *      refs    <-- external links
 *      rels    <-- internal links
 */
module.exports=function(args){
    var deferred=Q.defer()
      , refs=[]
      , rels=[]

    if(args.url&&args.body){
        if(args.debug){
            console.log('analyzing text/html document');
        }

        var $=cheerio.load(args.body)

        $('base')
    }else{
        deferred.resolve({
            refs:refs
          , rels:rels
        });
    }

    return deferred.promise;
};

