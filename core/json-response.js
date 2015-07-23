'use strict';

exports.error={
    invalidaccount:{ok:false,message:'Invalid user account'}
  , notconfirmed:{ok:false,message:'Your account has not been confirmed yet. '
        +'Please check your email or click in forgot your password'}
  , inactiveaccount:{ok:false,message:'Your account is inactive'}
  , incorrectinformation:{ok:false,message:'Incorrect information provided'}
  , emailregistered:{ok:false,message:'The email is already registered'}
  , emailnotregistered:{ok:false,message:'The email is not registered'}
  , resetexpired:{ok:false,message:'The reset key has expired, please use the '
        +'forgot my password again'}
  , validation:     {ok:false,message:'Validation error'}
  , json:           {ok:false,message:'JSON error'}
  , network:        {ok:false,message:'Network error'}
  , connection:     {ok:false,message:'Connection error'}
  , notfound:       {ok:false,message:'Resource not found'}
  , notoverride:    {ok:false,message:'Resource cannot overridden'}
  , notquota:       {ok:false,message:'You do not have more resources'}
  , auth:           {ok:false,message:'Authorization error'}
  , badrequest:     {ok:false,message:'Bad request'}
  , busy:           {ok:false,message:'Resource is busy'}
  , notimplemented: {ok:false,message:'Not implemented service'}
};

exports.success={
    ok:         {ok:true}
  , connection: {ok:true,message:'Success connection'}
  , dbsave:     {ok:true,message:'CouchDB settings changed'}
  , dbcreate:   {ok:true,message:'Repository created'}
};

