'use strict';

var request=require('request')
  , Q=require('q')
  , cheerio=require('cheerio')
  , _url=require('url')

/*
 * Function for links analysis in HTML BODY
 * args inputs
 *      task
 *          wait
 *              id
 *              key
 *              value
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
 * args outputs
 *      task
 *          ref
 *              links
 *              related
 */
module.exports=function(args){
    var deferred=Q.defer()

    if(!args.task.head.get){
        // TODO add customized analyzer for specific mime types
        deferred.resolve(args);
    }else{
        var $=cheerio.load(args.task.get.body)
          , links={script:[],link:[],a:[],img:[],form:[]}
          , samedomain=[]
          , base=_url.parse(args.task.wait.key+args.task.wait.id.substr(5))

        function register_link(link,haystack){
            if(link==undefined){return}

            var parse=_url.parse(_url.resolve(base,link));
            if(parse.host===base.host){
                samedomain.push(parse.path);
            }

            parse.href=link;
            haystack.push(parse);
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
        deferred.resolve(args);
    }

    return deferred.promise;
};

