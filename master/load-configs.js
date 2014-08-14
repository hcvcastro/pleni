'use strict';

var fs=require('fs')
  , path=require('path')

// read a database configuration
fs.readFile(path.join(__dirname,'database.json'),'utf8',function(err,data){
    if(err){throw err;}
    global.app.db=JSON.parse(data);
});

