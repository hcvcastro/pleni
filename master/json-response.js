'use strict';

exports.error = {
    validation:     {result:false,message:'Validation error'}
  , network:        {result:false,message:'Network error'}
  , connection:     {result:false,message:'Connection error'}
  , json:           {result:false,message:'JSON error'}
  , notimplemented: {result:false,message:'Not implemented service'}
};

exports.success = {
    connection: {result:true,message:'Success connection'}
  , dbsave:     {result:true,message:'CouchDB settings changed'}
  , dbcreate:   {result:true,message:'Repository created'}
};

