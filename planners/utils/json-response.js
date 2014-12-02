'use strict';

exports.error = {
    validation:     {ok:false,message:'Validation error'}
  , network:        {ok:false,message:'Network error'}
  , connection:     {ok:false,message:'Connection error'}
  , notfound:       {ok:false,message:'Resource not found'}
  , notoverride:    {ok:false,message:'Resource cannot overridden'}
  , auth:           {ok:false,message:'Authorization error'}
  , json:           {ok:false,message:'JSON error'}
  , badrequest:     {ok:false,message:'Bad request'}
  , notimplemented: {ok:false,message:'Not implemented service'}
};

exports.success = {
    ok:         {ok:true}
  , connection: {ok:true,message:'Success connection'}
  , dbsave:     {ok:true,message:'CouchDB settings changed'}
  , dbcreate:   {ok:true,message:'Repository created'}
};

