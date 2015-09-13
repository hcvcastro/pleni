
/* view: header-server */
function(doc){
    switch(doc._id.substring(0,4)){
        case 'page':
            if(doc.current&&doc.current.get){
                emit(doc.current.get.headers['server']);
            }
            break;
        case 'file':
            if(doc.current&&doc.current.head){
                emit(doc.current.head.headers['server']);
            }
            break;
    }
}
_count

/* view: header-poweredby */
function(doc){
    switch(doc._id.substring(0,4)){
        case 'page':
            if(doc.current&&doc.current.get){
                emit(doc.current.get.headers['x-powered-by']);
            }
            break;
        case 'file':
            if(doc.current&&doc.current.head){
                emit(doc.current.head.headers['x-powered-by']);
            }
            break;
    }
}
_count

/* view: header-contenttype */
function(doc){
    switch(doc._id.substring(0,4)){
        case 'page':
            if(doc.current&&doc.current.get){
                emit(doc.current.get.headers['content-type']);
            }
            break;
        case 'file':
            if(doc.current&&doc.current.head){
                emit(doc.current.head.headers['content-type']);
            }
            break;
    }
}
_count

/* view: header-status */
function(doc){
    switch(doc._id.substring(0,4)){
        case 'page':
            if(doc.current&&doc.current.get){
                emit(doc.current.get.status);
            }
            break;
        case 'file':
            if(doc.current&&doc.current.head){
                emit(doc.current.head.status);
            }
            break;
    }
}
_count

/* view: hashes */
function(doc){
    if(doc._id.substring(0,4)=='page'){
        if(doc.current&&doc.current.get){
            emit(doc._id.substring(6),[doc.current.get.sha1,doc.current.get.md5]);
        }
    }
}

/* view: rels */
function(doc){
    if(doc._id.substring(0,4)=='page'){
        if(doc.current&&doc.current.get&&doc.current.get.rels){
            for(var i in doc.current.get.rels){
                emit([doc.current.get.rels[i].tag,doc.current.get.rels[i].url]);
            }
        }
    }
}
_count

/* view: refs */
function(doc){
    if(doc._id.substring(0,4)=='page'){
        if(doc.current&&doc.current.get&&doc.current.get.refs){
            for(var i in doc.current.get.refs){
                emit([doc.current.get.refs[i].tag,doc.current.get.refs[i].url]);
            }
        }
    }
}
_count

