'use strict';

var error = {
    validation:     {result:false,message:'Validation error'}
  , network:        {result:false,message:'Network error'}
  , connection:     {result:false,message:'Connection error'}
  , json:           {result:false,message:'JSON error'}
  , notimplemented: {result:false,message:'Not implemented service'}
};

var success = {
    connection: {result:true,message:'Success connection',version:'1.6.0'}
  , dbsave:     {result:true,message:'CouchDB settings changed'}
  , dbcreate:   {result:true,message:'Repository created'}
};

success.connectionv = function(obj){
    var packet=success.connection;
    packet.version = obj.version;
    return packet;
};

exports.error = error;
exports.success = success;

