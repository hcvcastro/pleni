
/* filter: requests */
function(doc,req){
    if(doc._id.substring(0,7)=='request'){
        return (
            function(){
                if(req.query.method=='ALL'){
                    return true;
                }else{
                    return req.query.method==doc.request.method;
                }
            })()
            &&(
            function(){
                if(req.query.statuscode=='ALL'){
                    return true;
                }else{
                    if(doc.response){
                        return +req.query.statuscode==Math.floor(doc.response.status/100);
                    }else{
                        return false;
                    }
                }
            })()
            &&(
            function(){
                if(req.query.status=='ALL'){
                    return true;
                }else{
                    return req.query.status==doc.status;
                }
            })();
    }else{
        return false;
    }
}

/* filter: pages */
function(doc,req){
    if(doc._id.substring(0,4)=='page'){
        return (
            function(){
                if(req.query.status=='ALL'){
                    return true;
                }else{
                    return req.query.status==doc.status;
                }
            })();
    }else{
        return false;
    }
}

/* filter: files */
function(doc,req){
    if(doc._id.substring(0,4)=='file'){
        return (
            function(){
                if(req.query.status=='ALL'){
                    return true;
                }else{
                    return doc.current.head.headers['content-type'].indexOf(req.query.mimetype)==0;
                }
            })()
            &&(
            function(){
                if(req.query.status=='ALL'){
                    return true;
                }else{
                    return req.query.status==doc.status;
                }
            })();
    }else{
        return false;
    }
}

/* filter: requestslist */
function(doc,req){
    var match=/request::[0-9]+::(.+)::(.+)/.exec(doc._id);
    if(match){
        return (req.query.method=='ALL'||req.query.method==match[1])&&(req.query.page==match[2]);
    }else{
        return false;
    }
}


/* view: wait*/
function(doc){
    if(doc._id.substring(0,7)=='request'&&doc.status&&doc.status=='wait'){
        emit(doc.request.url,[doc._rev,doc.ts_created]);
    }
}

/* view: timestamp */
function(doc){
    if(doc.ts_modified){
        emit(null,doc.ts_modified);
    }
}
function(keys,values,rereduce){
    if(rereduce){
        return {
            'min':values.reduce(function(a,b){
                    return Math.min(a,b.min)
                },Infinity)
          , 'max':values.reduce(function(a,b){
                    return Math.max(a,b.max)
                },-Infinity)
          , 'count':values.reduce(function(a,b){
                    return a+b.count
                },0)
        };
    }else{
        return {
            'min':Math.min.apply(null,values)
          , 'max':Math.max.apply(null,values)
          , 'count':values.length
        };
    }
}

/* view: mimetype */
function(doc){
    if(doc._id.substring(0,4)=='file'){
        var r=/([a-z]+\/[a-z]+).*/.exec(doc.current.head.headers['content-type']);
        if(r){
            emit(r[1],null);
        }
    }
}
_count

/* view: sitemap_current */
function(doc){
    switch(doc._id.substring(0,4)){
        case 'page':
            emit(doc._id.substring(6),{
                status:doc.status
              , statuscode:doc.current.get.status
              , mimetype:'text/html'
              , type:'page'
              , rels:(function(x){
                    if(x.current&&x.current.get){
                        return x.current.get.rels.filter(function(i){
                            return /https?:\/\/[^\/]+(\/.*)/.test(i.url);
                        }).map(function(i){
                            return /https?:\/\/[^\/]+(\/.*)/.exec(i.url)[1];
                        });
                    }else{
                        return [];
                    }
                })(doc)
            });
            break;
        case 'file':
            emit(doc._id.substring(6),{
                status:doc.status
              , statuscode:doc.current.head.status
              , mimetype:/^([a-z]+\/[a-z-]+).*$/.exec(doc.current.head.headers['content-type'])[1]
              , type:'file'
              , rels:[]
            });
            break;
    }
}

/* view: sitemap_all */
function(doc){
    switch(doc._id.substring(0,4)){
        case 'page':
            emit(doc._id.substring(6),{
                status:doc.status
              , statuscode:doc.current.get.status
              , mimetype:'text/html'
              , type:'page'
              , rels:(function(x){
                    if(x.revs&&x.revs.length>0){
                        var rels=[];
                        x.revs.forEach(function(y){
                            Array.prototype.push.apply(rels,y.rels);
                        });
                        return rels.filter(function(i){
                            return /https?:\/\/[^\/]+(\/.*)/.test(i.url);
                        }).map(function(i){
                            return /https?:\/\/[^\/]+(\/.*)/.exec(i.url)[1];
                        });
                    }else{
                        return [];
                    }
                })(doc)
            });
            break;
        case 'file':
            emit(doc._id.substring(6),{
                status:doc.status
              , statuscode:doc.current.head.status
              , mimetype:/^([a-z]+\/[a-z-]+).*$/.exec(doc.current.head.headers['content-type'])[1]
              , type:'file'
              , rels:[]
            });
            break;
    }
}

