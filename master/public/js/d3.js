'use strict';

var tip=d3.tip()
    .attr('class','tooltip')
    .html(function(d){
        return '<div class="title">'+d.page+'</div>'+
            '<div class="subtle">'+(d.get ? '✓':'✕')+'</div>'+
            '<div class="subtle">'+d.mime+'</div>';
    })
    .direction('n')

var vis=d3.select('#canvas')
    .append('svg:svg')
        .attr('width','100%')
        .attr('height','100%')
        .attr('pointer-events','all')
            .call(d3.behavior.zoom().on('zoom',function(){
                vis.attr('transform',
                    'translate('+d3.event.translate+')'+
                    'scale('+d3.event.scale+')');
            }))
    .append('svg:g')
    .call(tip);

var draw=function(nodes,links){
    var force=d3.layout.force()
        .nodes(nodes)
        .links(links)
        .linkDistance(180)
        .linkStrength(1)
        .friction(0.35)
        .charge(-2000)
        .gravity(0.05)
        .start();

    var link=vis.selectAll('line.link')
        .data(links)
        .enter()
            .append('svg:line');

    var drag=force.drag()
        .on('dragstart',function(){
            d3.event.sourceEvent.stopPropagation();
        });

    var node=vis.selectAll('g.node')
        .data(nodes)
        .enter()
        .append('svg:g')
        .call(drag);

    node.append('svg:circle')
        .attr('r',function(d){
            switch(d.type){
                case 'root':
                    return 18;
                case 'page':
                    return 12;
                default:
                    return 6;
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
        .on('mouseover',tip.show)
        .on('mouseout',tip.hide)

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

d3.json('http://localhost:3000/workspace/test/site_j1/mapsite',function(data){
    draw(data.nodes,data.links);
});

