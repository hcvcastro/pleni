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
    if(args.site&&args.url&&args.body){
        if(args.debug){
            console.log('analyzing text/html document');
        }

        var refs=[], rels=[]
          , $=cheerio.load(args.body)
          , _base=$('base').filter(function(i,el){
                return $(this).attr('href')!=undefined
            })
          , href=$(_base[0]).attr('href')
          , base=(_base.length>0)?href:'.'
          , root=_url.resolve(args.url,base)
          , extract=function(element,attribute){
                return $(element).filter(function(i,el){
                    return $(this).attr(attribute)!=undefined;
                }).map(function(i,el){
                    return $(this).attr(attribute);
                }).get();
            };

        [
            ['a','href']
          , ['area','href']
          , ['audio','src']
          , ['embed','src']
          , ['form','action']
          , ['iframe','src']
          , ['img','src']
          , ['input','src']
          , ['link','href']
          , ['object','data']
          , ['script','src']
          , ['video','src']
        ].forEach(function(element){
            extract(element[0],element[1]).forEach(function(resource){
                var path=_url.resolve(root,resource)
                  , _h1=_url.parse(args.site)
                  , _h2=_url.parse(path);

                if(_h1.host===_h2.host){
                    rels.push({
                        tag:element[0]
                      , url:path
                    });
                }else{
                    refs.push({
                        tag:element[0]
                      , url:path
                    });
                }
            });
        });

        deferred.resolve({refs:refs,rels:rels});
    }else{
        deferred.reject({});
    }

    return deferred.promise;
};

