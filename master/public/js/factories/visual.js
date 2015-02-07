'use strict';

pleni.factory('Visual',[function(){
    var empty={
            page:'/'
          , status:'unknown'
          , mime:'unknown'
          , get:false
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
            if(node.page in visual.hash1){
                var index=visual.hash1[node.page];

                visual.nodes[index]=node;
                rels.forEach(function(rel){
/*                    var j=visual.nodes.length;
                    visual.nodes.push($.extend({},empty,{page:rel}));

                    visual.links.push({source:j,target:index});
                    visual.adjacency1[index+'_'+j]=true;
                    visual.adjacency2[j+'_'+index]=true;

                    visual.hash1[rel]=j;
                    // MIME UPDATE
*/
                });

                visual.draw();
            }
        }
    };
}]);

