'use strict';

pleni.factory('Workspace',['$sessionStorage','Projects',
    function($sessionStorage,Projects){
        var get_element=function(needle,haystack){
            for(var i in haystack){
                if(haystack[i].id==needle){
                    return [i,haystack[i]];
                }
            }
            return;
        };

    return {
        workspace:{
            load:function(sucess,failure){

            }
        }
    };
}]);

