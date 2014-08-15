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
    var _slash=url.resolve(host,'/');
    return _slash.slice(0,-1);
}

exports.validPort=function(port){
    var _port=validator.toInt(port);
    return notEmpty(port)
        && validator.isInt(port)
        && (0 < _port && _port < 65536);
};

exports.validSlug=function(slug){
    return notEmpty(slug)
        && /^[a-z][a-z0-9_]*$/i.test(slug);
};

exports.toInt=validator.toInt;
exports.toString=validator.toString;

