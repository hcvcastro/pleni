'use strict';

var fs=require('fs')

module.exports=function(file){
    var content=fs.readFileSync(file,{encoding:'utf8',flag:'r'});
    return JSON.parse(content);
};

