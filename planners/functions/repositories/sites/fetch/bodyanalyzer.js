'use strict';

var request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , _url=require('url')

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
 *          get
 *              status
 *              headers
 *              body
 *              sha1
 *              md5
 *
 * args output
 *      task
 *          ref
 *              links
 *              related
 */
module.exports=function(args){
    var deferred=Q.defer()

    if(!args.task.head.get){
        deferred.resolve(args);
    }else{
        // HTML analyzer
        if(/text\/html/i.test(args.task.head.headers['content-type'])){
            if(args.debug){
                console.log('analyzing the body for request');
            }

            var $=cheerio.load(args.task.get.body)
              , links={script:[],link:[],a:[],img:[],form:[]}
              , samedomain=[]
              , base=_url.parse(args.task.wait.url+args.task.wait.id.substr(5))
              , register_link=function(link,haystack){
                    if(link==undefined){return}

                    var url=_url.resolve(base,link)
                      , parse=_url.parse(url)

                    if(parse.host===base.host){
                        samedomain.push(parse.path);
                    }

                    haystack.push(url);
                }

            // body analysis (TODO)
            $('script').each(function(i,element){
                register_link($(this).attr('src'),links.script);
            });
            $('link').each(function(i,element){
                register_link($(this).attr('href'),links.link);
            });
            $('a').each(function(i,element){
                register_link($(this).attr('href'),links.a);
            });
            $('img').each(function(i,element){
                register_link($(this).attr('src'),links.img);
            });
            $('form').each(function(i,element){
                register_link($(this).attr('action'),links.form);
            });

            if(!args.task.ref){
                args.task.ref={};
            }
            args.task.ref.links=links;
            args.task.ref.related=samedomain;
        }

        deferred.resolve(args);
    }

    return deferred.promise;
};

