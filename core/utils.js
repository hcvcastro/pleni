'use strict';

exports.sort=function(a,b){
    if(a.id>b.id){
        return 1;
    }
    if(a.name<b.name){
        return -1;
    }
    return 0;
};

