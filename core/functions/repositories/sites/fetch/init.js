'use strict';

var Q=require('q')

/* Function for reseting params in promises chain
 *
 */
module.exports=function(args){
    var deferred=Q.defer()

    //args.debug=true;
    
    if(args.debug){
        console.log();
        console.log('initializing input parameters ... ');
    }

    delete args.task;

    args.site={
        filters:'HEAD|ALL|ALL'
    };

    deferred.resolve(args);
    return deferred.promise;
};

