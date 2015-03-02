'use strict';

var Q=require('q')

/* Function for reseting params in promises chain
 *
 */
module.exports=function(args){
    var deferred=Q.defer()

    if(args.debug){
        console.log();
        console.log('initializing input parameters ... ');
    }

    delete args.task;

    deferred.resolve(args);
    return deferred.promise;
};

