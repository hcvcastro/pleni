'use strict';

exports.sort=function(a,b){
    if(a.id>b.id){
        return 1;
    }
    if(a.id<b.id){
        return -1;
    }
    return 0;
};

exports.sort2=function(a,b){
    if(a.name>b.name){
        return 1;
    }
    if(a.name<b.name){
        return -1;
    }
    return 0;
};

