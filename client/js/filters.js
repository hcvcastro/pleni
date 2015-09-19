'use strict';

pleni.filter('truncate',function(){
    return function(text,length,end){
        if(isNaN(length)){
            length=10;
        }
        if(end===undefined){
            end='...';
        }
        if(text.length<=length||text.length-end.length<=length){
            return text;
        }else{
            return String(text).substring(0,length-end.length)+end;
        }
    };
});

pleni.filter('pretty',function(){
    var glossary={
            '_id':'ID'
          , '_rev':'Revision'
          , 'ts_created':'Repository creation date'
          , 'ts_modified':'Repository last modification date'
          , 'type':'Type'
          , 'url':'URL'
          , 'count':'Pages count'
          , 'ts_ended':'Last fetch for pages'
          , 'ts_started':'First fetch for pages'
        }

    return function(key){
        if(key in glossary){
            return glossary[key];
        }else{
            return key;
        }
    };
});

pleni.filter('prettydate',function(){
    return function(value){
        return utils.prettydate(value);
    };
});

pleni.filter('render',function(){
    return function(value,key){
        if(key.substring(0,3)=='ts_'){
            return utils.prettydate(value);
        }else{
            return value;
        }
    };
});

pleni.filter('statusclass',function(){
    return function(value){
        var s=Math.floor(+value/100);
        return 'status'+s+'xx';
    };
});

pleni.filter('statuscode',function(){
    var statuscodes={
        '100':'Continue'
      , '101':'Switching Protocols'
      , '102':'Processing (WebDAV; RFC 2518)'
      , '200':'OK'
      , '201':'Created'
      , '202':'Accepted'
      , '203':'Non-Authoritative Information (since HTTP/1.1)'
      , '204':'No Content'
      , '205':'Reset Content'
      , '206':'Partial Content (RFC 7233)'
      , '207':'Multi-Status (WebDAV; RFC 4918)'
      , '208':'Already Reported (WebDAV; RFC 5842)'
      , '226':'IM Used (RFC 3229)'
      , '300':'Multiple Choices'
      , '301':'Moved Permanently'
      , '302':'Found'
      , '303':'See Other (since HTTP/1.1)'
      , '304':'Not Modified (RFC 7232)'
      , '305':'Use Proxy (since HTTP/1.1)'
      , '306':'Switch Proxy'
      , '307':'Temporary Redirect (since HTTP/1.1)'
      , '308':'Permanent Redirect (RFC 7538)'
      , '308':'Resume Incomplete (Google)'
      , '400':'Bad Request'
      , '401':'Unauthorized (RFC 7235)'
      , '402':'Payment Required'
      , '403':'Forbidden'
      , '404':'Not Found'
      , '405':'Method Not Allowed'
      , '406':'Not Acceptable'
      , '407':'Proxy Authentication Required (RFC 7235)'
      , '408':'Request Timeout'
      , '409':'Conflict'
      , '410':'Gone'
      , '411':'Length Required'
      , '412':'Precondition Failed (RFC 7232)'
      , '413':'Payload Too Large (RFC 7231)'
      , '414':'Request-URI Too Long'
      , '415':'Unsupported Media Type'
      , '416':'Requested Range Not Satisfiable (RFC 7233)'
      , '417':'Expectation Failed'
      , '418':'I\'m a teapot (RFC 2324)'
      , '419':'Authentication Timeout (not in RFC 2616)'
      , '420':'Method Failure (Spring Framework)'
      , '420':'Enhance Your Calm (Twitter)'
      , '421':'Misdirected Request (HTTP/2)'
      , '422':'Unprocessable Entity (WebDAV; RFC 4918)'
      , '423':'Locked (WebDAV; RFC 4918)'
      , '424':'Failed Dependency (WebDAV; RFC 4918)'
      , '426':'Upgrade Required'
      , '428':'Precondition Required (RFC 6585)'
      , '429':'Too Many Requests (RFC 6585)'
      , '431':'Request Header Fields Too Large (RFC 6585)'
      , '440':'Login Timeout (Microsoft)'
      , '444':'No Response (Nginx)'
      , '449':'Retry With (Microsoft)'
      , '450':'Blocked by Windows Parental Controls (Microsoft)'
      , '451':'Unavailable For Legal Reasons (Internet draft)'
      , '451':'Redirect (Microsoft)'
      , '494':'Request Header Too Large (Nginx)'
      , '495':'Cert Error (Nginx)'
      , '496':'No Cert (Nginx)'
      , '497':'HTTP to HTTPS (Nginx)'
      , '498':'Token expired/invalid (Esri)'
      , '499':'Client Closed Request (Nginx)'
      , '499':'Token required (Esri)'
      , '500':'Internal Server Error'
      , '501':'Not Implemented'
      , '502':'Bad Gateway'
      , '503':'Service Unavailable'
      , '504':'Gateway Timeout'
      , '505':'HTTP Version Not Supported'
      , '506':'Variant Also Negotiates (RFC 2295)'
      , '507':'Insufficient Storage (WebDAV; RFC 4918)'
      , '508':'Loop Detected (WebDAV; RFC 5842)'
      , '509':'Bandwidth Limit Exceeded (Apache bw/limited extension)[31]'
      , '510':'Not Extended (RFC 2774)'
      , '511':'Network Authentication Required (RFC 6585)'
      , '520':'Unknown Error'
      , '522':'Origin Connection Time-out'
      , '598':'Network read timeout error (Unknown)'
      , '599':'Network connect timeout error (Unknown)'
    }

    return function(code){
        if(code in statuscodes){
            return statuscodes[code];
        }else{
            return code;
        }
    };
});

