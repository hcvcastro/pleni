'use strict'

var request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , _url=require('url')

/*
 * Function for links extraction in a text/html document
 * args input
 *      site
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

    if(args.site&&args.url&&args.body){
        if(args.debug){
            console.log('analyzing text/html document');
        }

        var $=cheerio.load(args.body)
          , _base=$('base')
          , base='.'
          , parent=''

        if(_base.length>0){
            base=$(_base[0]).attr('href');
        }

        parent=_url.resolve(args.url,base);

        console.log(parent);

        deferred.resolve({
        });
    }else{
        deferred.resolve({
            refs:refs
          , rels:rels
        });
    }

    return deferred.promise;
};

