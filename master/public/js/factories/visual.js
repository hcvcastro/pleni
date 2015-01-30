'use strict';

pleni.factory('Visual',[function(){
    return {
        clean:function(){
            $('#canvas').empty();
        }
      , render:function(data){
            var w=$('#canvas').parent().width()
              , h=parseInt($('#canvas').parent().height())-5
              , vis=d3.select('#canvas')
                .append('svg:svg')
                    .attr('width',w)
                    .attr('height',h)
                    .attr('pointer-events','all')
                        .call(d3.behavior.zoom().on('zoom',function(){
                            vis.attr('transform',
                                'translate('+d3.event.translate+')'+
                                'scale('+d3.event.scale+')');
                        }))
                .append('svg:g');

            var draw=function(nodes,links){
                var force=d3.layout.force()
                    .size([w,h])
                    .nodes(nodes)
                    .links(links)
                    .linkDistance(160)
                    .linkStrength(6)
                    .friction(0.35)
                    .charge(-2000)
                    .gravity(0.08)
                    .start();

                var link=vis.selectAll('line.link')
                    .data(links)
                    .enter()
                        .append('svg:line')

                var drag=force.drag()
                    .on('dragstart',function(){
                        d3.event.sourceEvent.stopPropagation();
                    });

                var node=vis.selectAll('g.node')
                    .data(nodes)
                    .enter()
                    .append('svg:g')
                    .call(drag)

                node.append('svg:circle')
                    .attr('r',function(d){
                        switch(d.type){
                            case 'root':
                                return 16;
                            case 'page':
                                return 12;
                            default:
                                return 8;
                        }
                    })
                    .attr('class',function(d){
                        return [
                            'node'
                          , d.type
                          , (function(status){return 's-'+status;})(d.status)
                          , (function(mime){return 'm-'+mime.replace('/','-');})(d.mime)
                        ].join(' ');
                    })

                node.append('text')
                    .attr('x',function(d){
                        switch(d.type){
                            case 'root':
                                return 26;
                            case 'page':
                                return 22;
                            default:
                                return 15;
                        }
                     })
                    .attr('y',function(d){
                        switch(d.type){
                            case 'root':
                                return 0;
                            case 'page':
                                return 3;
                            default:
                                return 6;
                        }
                    })
                    .attr('class','text title')
                    .text(function(d){
                        return d.page;
                    });

                node.append('text')
                    .attr('x',35)
                    .attr('y',20)
                    .attr('class',['text','subtle'].join(' '))
                    .text(function(d){
                        return d.mime;
                    });

                node.append('text')
                    .attr('x',20)
                    .attr('y',20)
                    .attr('class',['text','subtle'].join(' '))
                    .text(function(d){
                        return d.get ? '✓':'✕';
                    });

                force.on('tick',function(){
                    link.attr('x1',function(d){return d.source.x;})
                        .attr('y1',function(d){return d.source.y;})
                        .attr('x2',function(d){return d.target.x;})
                        .attr('y2',function(d){return d.target.y;});
                    node.call(function(){
                        this.attr('transform',function(d){
                            return 'translate('+d.x+','+d.y+')';
                        });
                    });
                });
            };

            draw(data.nodes,data.links);
        }
    };
}]);

