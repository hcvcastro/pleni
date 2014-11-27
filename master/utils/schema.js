'use strict';

var validator=require('validator')
  , jayschema=require('jayschema')
  , js=new jayschema()
  , notEmpty=function(element){
    if(typeof element==='undefined'){
        return false;
    }
    if(element===null){
        return false;
    }
    if(element===''){
        return false;
    }
    return true;
};

js.addFormat('id',function(value){
    if(notEmpty(value)
        && /^[a-z][a-z0-9_]*\/?[a-z][a-z0-9_]*$/i.test(value)){
        return null;
    }
    return 'id is not a valid string';
});
js.addFormat('host',function(value){
    if(notEmpty(value)
        && (validator.isIP(value)||validator.isURL(value))){
        return null;
    }
    return 'host is not a valid';
});
js.addFormat('port',function(value){
    var _port=validator.toInt(value);
    if(notEmpty(value)
        && validator.isInt(value)
        && (0 < _port && _port < 65536)){
        return null;
    }
    return 'port is not a valid';
});
js.addFormat('slug',function(value){
    if(notEmpty(value)
        && /^[a-z][a-z0-9_]*$/i.test(value)){
        return null;
    }
    return 'there is not a valid slug';
});
exports.js=js;

var dbserver={
    'type':'object'
  , 'properties':{
        'id':{
            'type':'string'
          , 'format':'id'
        }
      , 'db':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                  , 'format':'host'
                }
              , 'port':{
                    'type':'integer'
                  , 'format':'port'
                }
              , 'user':{
                    'type':'string'
                  , 'format':'slug'
                }
              , 'pass':{
                    'type':'string'
                }
              , 'prefix':{
                    'type':'string'
                  , 'format':'slug'
                }
            }
          , 'required':['host','port','user','pass']
        }
    }
  , 'required':['id','db']
};
exports.dbserver=dbserver;

var dbservers={
    'type':'array'
  , 'items':dbserver
  , 'minItems':1
  , 'uniqueItems':true
};
exports.dbservers=dbservers;

