'use strict';

pleni.factory('Visual',[function(){
    var empty={
            page:'/'
          , status:'unknown'
          , statuscode:'unknown'
          , mimetype:'unknown'
          , type:'unknown'
        }
      , force={
            count:1
          , nodes:[empty]
          , links:[]
        }

    return {
        clean:function(){
            $('#canvas').empty();
        }
      , render:function(data){
            if(!data){
                data=force;
            }
            visual.init();
            visual.set(data.count,data.nodes,data.links);
            visual.draw();
            visual.panel();
        }
      , add:function(node,rels){
            visual.add(node,rels);
        }
    };
}]);

