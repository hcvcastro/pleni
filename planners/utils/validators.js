'use strict';

var validator=require('validator')
  , url=require('url')

var notEmpty=function(element){
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
exports.notEmpty=notEmpty;

exports.validHost=function(host){
    return notEmpty(host)
        && (validator.isIP(host)||validator.isURL(host));
};
exports.toValidHost=function(host){
    var parse=url.parse(host)
    if(parse.protocol==null){
        host='http://'+host  // <--default protocol
    }

    return url.resolve(host,'/').slice(0,-1);
}

exports.validPort=function(port){
    var _port=validator.toInt(port);
    return notEmpty(port)
        && validator.isInt(port)
        && (0 < _port && _port < 65536);
};

exports.validSlugSlash=function(slug){
    return notEmpty(slug)
        && /^[a-z][a-z0-9_]*\/[a-z][a-z0-9_]*$/i.test(slug);
};

exports.validSlug=function(slug){
    return notEmpty(slug)
        && /^[a-z][a-z0-9_]*$/i.test(slug);
};

exports.toInt=validator.toInt;
exports.toString=validator.toString;

