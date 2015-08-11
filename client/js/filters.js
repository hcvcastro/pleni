'use strict';

pleni.filter('truncate',function(){
    return function(text,length,end){
        if(isNaN(length)){
            length=10;
        }
        if(end===undefined){
            end='...';
        }
        if(text.length<=length||text.length-end.length<=length){
            return text;
        }else{
            return String(text).substring(0,length-end.length)+end;
        }
    };
});

pleni.filter('pretty',function(){
    var glossary={
            '_id':'ID'
          , '_rev':'Revision'
          , 'ts_created':'Repository creation date'
          , 'ts_modified':'Repository last modification date'
          , 'type':'Type'
          , 'url':'URL'
          , 'count':'Pages count'
          , 'ts_ended':'Last fetch for pages'
          , 'ts_started':'First fetch for pages'
        }

    return function(key){
        if(key in glossary){
            return glossary[key];
        }else{
            return key;
        }
    };
});

pleni.filter('render',function(){
    return function(value,key){
        if(key.substring(0,3)=='ts_'){
            return utils.prettydate(value);
        }else{
            return value;
        }
    };
});

