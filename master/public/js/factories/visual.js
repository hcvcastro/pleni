'use strict';

pleni.factory('Visual',[function(){
    return {
        clean:function(){
            $('#canvas').empty();
        }
      , render:function(data){
            visual.site.init();
            visual.site.set(data.nodes,data.links);
            visual.site.draw();
            visual.site.panel();
        }
    };
}]);

