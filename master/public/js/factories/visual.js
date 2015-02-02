'use strict';

pleni.factory('Visual',[function(){
    return {
        clean:function(){
            $('#canvas').empty();
        }
      , render:function(data){
            visual.site.init();
            visual.site.draw(data.nodes,data.links);
            visual.site.panel();
        }
    };
}]);

